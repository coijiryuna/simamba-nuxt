export default defineEventHandler(async (event) => {
  const db = getDb();
  try {
    const [rows] = await db.query('SELECT * FROM tbl_request WHERE status = 1 ORDER BY ID DESC');
    return {
      success: true,
      data: rows
    };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
