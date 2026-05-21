export default defineEventHandler(async (event) => {
  const db = getDb();
  try {
    const [rows] = await db.query('SELECT * FROM tbl_posts WHERE post_status = "publish" ORDER BY post_date DESC LIMIT 10');
    return rows;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Database connection failed',
      data: error
    });
  }
});


