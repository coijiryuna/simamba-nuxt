import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const db = getDb();
  const body = await readBody(event);
  const { user_login, user_email, display_name, user_pass, role } = body;

  try {
    // 1. Hash password
    const hashedPassword = await bcrypt.hash(user_pass, 12);

    // 2. Insert ke tbl_users
    // Format WP-like: user_login, user_pass, user_nicename, user_email, user_registered, display_name, role
    await db.query(`
      INSERT INTO tbl_users 
        (user_login, user_pass, user_nicename, user_email, user_registered, display_name, role, user_status)
      VALUES (?, ?, ?, ?, NOW(), ?, ?, 0)
    `, [user_login, hashedPassword, user_login, user_email, display_name, role]);

    return { status: 'success', message: 'User created successfully' };
  } catch (error: any) {
    console.error('Create User Error:', error);
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
