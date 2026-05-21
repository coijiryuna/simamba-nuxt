export default defineEventHandler(async (event) => {
  const db = getDb();
  const id = getRouterParam(event, 'id');

  try {
    const [rows]: any = await db.query('SELECT * FROM tbl_sliders WHERE id = ?', [id]);
    if (rows.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Slider not found' });
    }
    return rows[0];
  } catch (error: any) {
    console.error('Get Slider Detail Error:', error);
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
