export default defineEventHandler(async (event) => {
  const user = verifyByzisToken(event);
  const db = getByzisDb();

  try {
    const [stats]: any = await db.query(`
      SELECT 
        COALESCE(SUM(amount), 0) as total_amount_donated,
        COUNT(*) as total_donations_made,
        COUNT(DISTINCT campaign_id) as total_campaigns_supported
      FROM tbl_donations
      WHERE user_id = ? AND transaction_status IN ('settlement', 'capture')
    `, [user.id]);

    return stats[0];
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
