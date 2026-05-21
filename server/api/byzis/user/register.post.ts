import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default defineEventHandler(async (event) => {
  const db = getByzisDb();
  const body = await readBody(event);
  
  const { name, email, password, phone } = body;
  
  if (!name || !email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Nama, Email, dan Password wajib diisi.' });
  }

  try {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // 1. Check if email already exists
      const [existing]: any = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length > 0) {
        throw createError({ statusCode: 400, statusMessage: 'Email sudah terdaftar.' });
      }

      // 2. Hash password
      const passwordHash = await bcrypt.hash(password, 10);
      const username = email.split('@')[0] + Math.floor(Math.random() * 9000 + 1000);

      // 3. Insert into users (auth)
      const [authResult]: any = await connection.query(
        'INSERT INTO users (username, email, password_hash, active, created_at, updated_at) VALUES (?, ?, ?, 1, NOW(), NOW())',
        [username, email, passwordHash]
      );
      const userId = authResult.insertId;

      // 4. Insert into tbl_users (profile)
      const profileData = {
        id: userId,
        name,
        email,
        phone: phone || '',
        created_at: new Date(),
        updated_at: new Date()
      };
      await connection.query('INSERT INTO tbl_users SET ?', profileData);

      await connection.commit();
      connection.release();

      // 5. Generate Token
      const config = useRuntimeConfig();
      const token = jwt.sign(
        { id: userId, email }, 
        (config.jwtSecretByzis || 'secret') as string,
        { expiresIn: '30d' }
      );

      return {
        status: 'success',
        message: 'Registrasi berhasil.',
        token,
        user: profileData
      };

    } catch (err: any) {
      await connection.rollback();
      connection.release();
      throw err;
    }
  } catch (error: any) {
    throw createError({ statusCode: error.statusCode || 500, statusMessage: error.message });
  }
});
