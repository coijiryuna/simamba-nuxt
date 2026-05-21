export default defineEventHandler(async (event) => {
  const db = getByzisDb();
  const slug = getRouterParam(event, 'slug');

  try {
    // 1. Find campaign ID by slug
    const [campaigns]: any = await db.query('SELECT id FROM tbl_campaigns WHERE slug = ?', [slug]);
    if (campaigns.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Campaign not found' });
    }
    const campaignId = campaigns[0].id;

    // 2. Get activities
    const [rows]: any = await db.query(`
      SELECT *
      FROM tbl_activities
      WHERE campaign_id = ?
      ORDER BY activity_date DESC
    `, [campaignId]);

    return {
      status: 'success',
      data: rows
    };
  } catch (error: any) {
    throw createError({ statusCode: error.statusCode || 500, statusMessage: error.message });
  }
});
