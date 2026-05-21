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

    // 2. Get donors (settlement/capture)
    const [rows]: any = await db.query(`
      SELECT donor_name, amount, message, is_anonymous, created_at
      FROM tbl_donations
      WHERE campaign_id = ? AND transaction_status IN ('settlement', 'capture')
      ORDER BY created_at DESC
    `, [campaignId]);

    const data = rows.map((donation: any) => {
      if (donation.is_anonymous) {
        donation.donor_name = 'Hamba Allah';
      }
      delete donation.is_anonymous;
      return donation;
    });

    return {
      status: 'success',
      data: data
    };
  } catch (error: any) {
    throw createError({ statusCode: error.statusCode || 500, statusMessage: error.message });
  }
});
