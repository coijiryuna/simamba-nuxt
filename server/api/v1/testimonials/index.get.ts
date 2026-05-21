export default defineEventHandler(async (event) => {
  const db = getByzisDb();
  try {
    const [rows] = await db.query('SELECT * FROM tbl_testimoni ORDER BY id DESC');
    return rows;
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
