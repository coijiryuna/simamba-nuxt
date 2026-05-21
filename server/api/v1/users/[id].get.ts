export default defineEventHandler(async (event) => {
  const db = getDb();
  const id = getRouterParam(event, 'id');

  try {
    const [rows]: any = await db.query(`
      SELECT 
        ID, user_login, user_email, 
        display_name, role, user_status 
      FROM tbl_users 
      WHERE ID = ?
    `, [id]);

    if (rows.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' });
    }

    return rows[0];
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
