export default defineEventHandler(async (event) => {
  const db = getDb();
  const query = getQuery(event);
  const requestId = query.request_id;

  try {
    let sql = 'SELECT * FROM tbl_requirements';
    const params = [];
    if (requestId) {
      sql += ' WHERE request_id = ?';
      params.push(requestId);
    }
    sql += ' ORDER BY ID ASC';
    const [rows] = await db.query(sql, params);
    return {
      success: true,
      data: rows
    };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
