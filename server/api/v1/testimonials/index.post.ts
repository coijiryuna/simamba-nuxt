export default defineEventHandler(async (event) => {
  const db = getByzisDb();
  const body = await readBody(event);

  try {
    const [result]: any = await db.query(`
      INSERT INTO tbl_testimoni 
      (user_id, name, message, rating, avatar, avatar_url) 
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      body.user_id || null, 
      body.name, 
      body.message, 
      body.rating || 5, 
      body.avatar || null, 
      body.avatar_url || null
    ]);
    return { status: 'success', id: result.insertId };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
