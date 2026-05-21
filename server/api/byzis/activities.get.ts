export default defineEventHandler(async (event) => {
  const db = getByzisDb();
  try {
    const [rows]: any = await db.query(`
      SELECT a.*, c.title as campaign_title
      FROM tbl_activities a
      LEFT JOIN tbl_campaigns c ON a.campaign_id = c.id
      ORDER BY a.activity_date DESC 
      LIMIT 20
    `);
    return {
      status: 'success',
      data: rows
    };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
