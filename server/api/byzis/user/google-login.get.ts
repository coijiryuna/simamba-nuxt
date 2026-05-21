import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export default defineEventHandler(async (event) => {
  const db = getByzisDb();
  const config = useRuntimeConfig();
  const query = getQuery(event);
  const code = query.code as string;
  const errorParam = query.error as string;

  const REDIRECT_URI = 'https://baznastangerangkab.or.id/api/byzis/user/google-login';
  const FRONTEND_CALLBACK = 'https://donasi.baznastangerangkab.or.id/auth/google/callback';
  const CLIENT_ID = (process.env.NUXT_OAUTH_GOOGLE_CLIENT_ID || config.googleClientId || '') as string;
  const CLIENT_SECRET = (process.env.NUXT_OAUTH_GOOGLE_CLIENT_SECRET || config.googleClientSecret || '') as string;
  const JWT_SECRET = (process.env.JWT_SECRET_BYZIS || config.jwtSecretByzis || 'baznas_secret') as string;

  // Jika Google mengembalikan error
  if (errorParam) {
    console.error('Google OAuth Error:', errorParam);
    return sendRedirect(event, `${FRONTEND_CALLBACK}?error=google_denied`);
  }

  // Jika tidak ada code, redirect ke Google untuk minta izin
  if (!code) {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: 'email profile',
      access_type: 'online',
    });
    return sendRedirect(event, `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  }

  try {
    // 1. Tukar code dengan access token dari Google
    const tokenRes: any = await $fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `code=${encodeURIComponent(code)}&client_id=${encodeURIComponent(CLIENT_ID)}&client_secret=${encodeURIComponent(CLIENT_SECRET)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&grant_type=authorization_code`,
    });

    if (!tokenRes.access_token) {
      throw new Error('No access token from Google: ' + JSON.stringify(tokenRes));
    }

    // 2. Ambil data user dari Google
    const googleUser: any = await $fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenRes.access_token}` }
    });

    const { email, name, picture } = googleUser;
    if (!email) throw new Error('No email from Google user info');

    // 3. Cek apakah user sudah ada di tabel users (auth)
    const [existingUsers]: any = await db.query(
      'SELECT id, email FROM users WHERE email = ?', [email]
    );

    let userId;
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      if (existingUsers.length > 0) {
        // User sudah ada, ambil ID-nya
        userId = existingUsers[0].id;

        // Update nama & avatar di tbl_users jika ada
        await connection.query(
          'UPDATE tbl_users SET name = ?, updated_at = NOW() WHERE id = ?',
          [name, userId]
        );
      } else {
        // User baru - buat akun di tabel users (auth)
        const username = email.split('@')[0] + Math.floor(Math.random() * 9000 + 1000);
        const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);

        const [authResult]: any = await connection.query(
          'INSERT INTO users (username, email, password_hash, active, created_at, updated_at) VALUES (?, ?, ?, 1, NOW(), NOW())',
          [username, email, randomPassword]
        );
        userId = authResult.insertId;

        // Simpan profil di tbl_users
        await connection.query(
          'INSERT INTO tbl_users (id, name, email, phone, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
          [userId, name, email, '']
        );
      }

      await connection.commit();
      connection.release();
    } catch (dbErr) {
      await connection.rollback();
      connection.release();
      throw dbErr;
    }

    // 4. Buat JWT Token untuk Aplikasi Donasi
    const token = jwt.sign(
      { id: userId, email, name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // 5. Redirect ke frontend dengan token
    return sendRedirect(event, `${FRONTEND_CALLBACK}?token=${token}`);

  } catch (error: any) {
    console.error('Google Login ByZIS Error:', error?.message || error);
    return sendRedirect(event, `${FRONTEND_CALLBACK}?error=google_login_failed&msg=${encodeURIComponent(error?.message || 'Unknown error')}`);
  }
});
