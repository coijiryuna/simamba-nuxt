export default defineEventHandler(async (event) => {
  const db = getDb();
  try {
    const [rows]: any = await db.query(`
      SELECT 
        ID, user_login, user_email, 
        display_name, role, user_status 
      FROM tbl_users 
      ORDER BY ID DESC
      LIMIT 100
    `);
    return rows;
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
