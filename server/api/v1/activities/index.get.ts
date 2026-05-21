export default defineEventHandler(async (event) => {
  const db = getByzisDb();
  try {
    const [rows] = await db.query(`
      SELECT a.*, c.title as campaign_title, cat.name as category_name
      FROM tbl_activities a
      LEFT JOIN tbl_campaigns c ON a.campaign_id = c.id
      LEFT JOIN tbl_categories cat ON a.category_id = cat.id
      ORDER BY a.id DESC
    `);
    return rows;
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
