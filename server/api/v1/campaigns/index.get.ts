export default defineEventHandler(async (event) => {
  const db = getByzisDb();
  try {
    const [rows] = await db.query(`
      SELECT c.*, cat.name as category_name 
      FROM tbl_campaigns c
      LEFT JOIN tbl_categories cat ON c.category_id = cat.id
      ORDER BY c.id DESC
    `);
    return rows;
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
