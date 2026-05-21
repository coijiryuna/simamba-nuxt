
export default defineEventHandler(async (event) => {
  const db = getDb();
  const query = getQuery(event);

  const search = query.search as string;
  const page = parseInt(query.page as string || '1');
  const limit = parseInt(query.limit as string || '10');
  const offset = (page - 1) * limit;

  try {
    let sql = `
      SELECT 
        p.ID, p.agenda_title, p.agenda_name as slug, p.agenda_date, p.agenda_status, p.agenda_type,
        p.agenda_content, p.featured_image_url,
        u.display_name as author
      FROM tbl_agendas p
      LEFT JOIN tbl_users u ON u.ID = p.agenda_author
    `;

    const conditions = [];
    const params: any[] = [];

    // Filter Status (Publish/Draft)
    if (query.status) {
      conditions.push("p.agendas_status = ?");
      params.push(query.status);
    }

    if (query.type) {
      conditions.push("p.agenda_type = ?");
      params.push(query.type);
    }
    if (search) {
      conditions.push("(p.agenda_title LIKE ? OR p.agenda_content LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    // Urutan & Limit
    sql += " ORDER BY p.agenda_date DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    let countSql = `SELECT COUNT(DISTINCT p.ID) as total FROM tbl_agendas p`;
        const [countRows] = await db.query(countSql, params.slice(0, params.length - 2)) as any[]; // remove limit and offset
    const total = countRows[0].total;

    const [rows] = await db.query(sql, params);

    return {
      page,
      limit,
      total,
      data: rows
    };
  } catch (error) {
    console.error('Agenda API Error:', error);
    return { error: 'Failed to fetch agendas' };
  }
});
