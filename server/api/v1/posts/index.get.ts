
export default defineEventHandler(async (event) => {
  const db = getDb();
  const query = getQuery(event);
  
  const category = query.category as string;
  const search = query.search as string;
  const page = parseInt(query.page as string || '1');
  const limit = parseInt(query.limit as string || '10');
  const offset = (page - 1) * limit;

  try {
    let sql = `
      SELECT 
        p.ID, p.post_title, p.post_name as slug, p.post_date, p.post_status, p.post_type,
        p.post_content, p.featured_image_url,
        u.display_name as author
      FROM tbl_posts p
      LEFT JOIN tbl_users u ON u.ID = p.post_author
    `;

    const conditions = [];
    const params: any[] = [];
    
    // Filter Status (Publish/Draft)
    if (query.status) {
      conditions.push("p.post_status = ?");
      params.push(query.status);
    }

    // Filter Tipe (Article/Post/Program/Page)
    if (query.type) {
      conditions.push("p.post_type = ?");
      params.push(query.type);
    }

    // Filter Kategori (melalui join tabel relasi)
    if (category) {
      sql += `
        JOIN tbl_term_relationships tr ON tr.object_id = p.ID
        JOIN tbl_term_taxonomy tt ON tt.term_taxonomy_id = tr.term_taxonomy_id
        JOIN tbl_terms t ON t.term_id = tt.term_id
      `;
      conditions.push("t.slug = ?");
      params.push(category);
    }

    // Filter Pencarian
    if (search) {
      conditions.push("(p.post_title LIKE ? OR p.post_content LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    // Urutan & Limit
    sql += " ORDER BY p.post_date DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows] = await db.query(sql, params);

    let countSql = `SELECT COUNT(DISTINCT p.ID) as total FROM tbl_posts p`;
    if (category) {
      countSql += `
        JOIN tbl_term_relationships tr ON tr.object_id = p.ID
        JOIN tbl_term_taxonomy tt ON tt.term_taxonomy_id = tr.term_taxonomy_id
        JOIN tbl_terms t ON t.term_id = tt.term_id
      `;
    }
    if (conditions.length > 0) {
      countSql += " WHERE " + conditions.join(" AND ");
    }
    const [countRows] = await db.query(countSql, params.slice(0, params.length - 2)) as any[]; // remove limit and offset
    const total = countRows[0].total;
    
    return {
      page,
      limit,
      total,
      data: rows
    };
  } catch (error) {
    console.error('Posts API Error:', error);
    return { error: 'Failed to fetch posts' };
  }
});
