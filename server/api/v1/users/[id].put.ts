import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const db = getDb();
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);
  const { user_email, display_name, user_pass, role, user_status } = body;

  try {
    let sql = 'UPDATE tbl_users SET user_email = ?, display_name = ?, role = ?, user_status = ?';
    let params = [user_email, display_name, role, user_status];

    if (user_pass) {
      const hashedPassword = await bcrypt.hash(user_pass, 12);
      sql += ', user_pass = ?';
      params.push(hashedPassword);
    }

    sql += ' WHERE ID = ?';
    params.push(id as string);

    await db.query(sql, params);

    return { status: 'success', message: 'User updated successfully' };
  } catch (error: any) {
    console.error('Update User Error:', error);
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
