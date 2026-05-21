import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default defineEventHandler(async (event) => {
  const db = getByzisDb();
  const body = await readBody(event);
  
  const { identity, password } = body;
  
  if (!identity || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email/Username dan Password wajib diisi.' });
  }

  try {
    // 1. Find user in auth table (users)
    const [authUsers]: any = await db.query(
      'SELECT id, email, username, password_hash FROM users WHERE email = ? OR username = ?',
      [identity, identity]
    );

    if (authUsers.length === 0) {
      throw createError({ statusCode: 401, statusMessage: 'Login gagal. Akun tidak ditemukan.' });
    }

    const authUser = authUsers[0];

    // 2. Verify password
    const isPasswordValid = await bcrypt.compare(password, authUser.password_hash);
    if (!isPasswordValid) {
      throw createError({ statusCode: 401, statusMessage: 'Login gagal. Password salah.' });
    }

    // 3. Get profile from tbl_users
    const [profiles]: any = await db.query('SELECT * FROM tbl_users WHERE id = ?', [authUser.id]);
    if (profiles.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Profil pengguna tidak ditemukan.' });
    }
    const profile = profiles[0];

    // 4. Generate JWT
    const config = useRuntimeConfig();
    const token = jwt.sign(
      { 
        id: profile.id, 
        email: profile.email 
      }, 
      (config.jwtSecretByzis || 'secret') as string,
      { expiresIn: '30d' }
    );

    return {
      status: 'success',
      message: 'Login berhasil.',
      token,
      user: profile
    };

  } catch (error: any) {
    throw createError({ statusCode: error.statusCode || 500, statusMessage: error.message });
  }
});
