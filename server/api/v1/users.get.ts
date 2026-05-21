export default defineEventHandler(async (event) => {
  const db = getDb();
  try {
    const [rows]: any = await db.query('SELECT ID, user_login, display_name, user_email, role, user_status FROM tbl_users');
    return rows;
  } catch (error: any) {
    console.error('Users API Error:', error);
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
