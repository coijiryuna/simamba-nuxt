export default defineEventHandler(async (event) => {
  const db = getDb();
  try {
    const [rows]: any = await db.query('SELECT * FROM tbl_links ORDER BY link_id DESC');
    return rows;
  } catch (error: any) {
    console.error('Links API Error:', error);
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
