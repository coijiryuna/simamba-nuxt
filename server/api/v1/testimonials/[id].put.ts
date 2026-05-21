export default defineEventHandler(async (event) => {
  const db = getByzisDb();
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);

  try {
    await db.query(`
      UPDATE tbl_testimoni 
      SET name = ?, message = ?, rating = ?, avatar_url = ?
      WHERE id = ?
    `, [
      body.name, 
      body.message, 
      body.rating, 
      body.avatar_url, 
      id
    ]);
    return { status: 'success' };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
