export default defineEventHandler(async (event) => {
  const db = getDb();
  try {
    const [rows]: any = await db.query('SELECT * FROM tbl_galery ORDER BY id DESC');
    return rows;
  } catch (error: any) {
    console.error('Gallery API Error:', error);
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
