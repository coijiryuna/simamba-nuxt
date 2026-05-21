export default defineEventHandler(async (event) => {
  const user = verifyByzisToken(event);
  const db = getByzisDb();
  const query = getQuery(event);
  
  const page = parseInt(query.page as string || '1');
  const limit = parseInt(query.limit as string || '10');
  const offset = (page - 1) * limit;

  try {
    const [rows]: any = await db.query(`
      SELECT 
        d.id, d.amount, d.transaction_status, d.payment_type, d.created_at,
        c.title as campaign_title, c.slug as campaign_slug, c.cover_image_url
      FROM tbl_donations d
      LEFT JOIN tbl_campaigns c ON d.campaign_id = c.id
      WHERE d.user_id = ?
      ORDER BY d.created_at DESC
      LIMIT ? OFFSET ?
    `, [user.id, limit, offset]);

    const [total]: any = await db.query('SELECT COUNT(*) as count FROM tbl_donations WHERE user_id = ?', [user.id]);

    return {
      status: 'success',
      data: rows,
      pager: {
        total: total[0].count,
        per_page: limit,
        current_page: page,
        last_page: Math.ceil(total[0].count / limit)
      }
    };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
