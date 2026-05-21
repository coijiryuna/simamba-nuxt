export default defineEventHandler(async (event) => {
  const db = getByzisDb();
  const query = getQuery(event);
  
  const page = parseInt(query.page as string || '1');
  const limit = parseInt(query.limit as string || '20');
  const offset = (page - 1) * limit;
  const search = query.search as string;
  const status = query.status as string;

  try {
    let sql = `
      SELECT 
        d.*, 
        c.title as campaign_title,
        COALESCE(NULLIF(d.donor_name, ''), u.name, 'Hamba Allah') as donor_display_name,
        COALESCE(NULLIF(d.donor_email, ''), u.email, '-') as donor_display_email
      FROM tbl_donations d
      LEFT JOIN tbl_campaigns c ON d.campaign_id = c.id
      LEFT JOIN tbl_users u ON d.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      sql += " AND (d.donor_name LIKE ? OR d.midtrans_order_id LIKE ? OR c.title LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status) {
      sql += " AND d.transaction_status = ?";
      params.push(status);
    }

    sql += " ORDER BY d.created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows]: any = await db.query(sql, params);

    // Total for pagination
    let countSql = "SELECT COUNT(*) as total FROM tbl_donations d LEFT JOIN tbl_campaigns c ON d.campaign_id = c.id WHERE 1=1";
    const countParams: any[] = [];
    if (search) {
      countSql += " AND (d.donor_name LIKE ? OR d.midtrans_order_id LIKE ? OR c.title LIKE ?)";
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status) {
      countSql += " AND d.transaction_status = ?";
      countParams.push(status);
    }
    const [total]: any = await db.query(countSql, countParams);

    return {
      status: 'success',
      data: rows,
      total: total[0].total,
      page,
      limit
    };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
