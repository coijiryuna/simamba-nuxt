export default defineEventHandler(async (event) => {
  const db = getDb();
  try {
    const [rows]: any = await db.query('SELECT * FROM tbl_sliders ORDER BY display_order ASC');
    return rows;
  } catch (error: any) {
    console.error('Sliders API Error:', error);
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
