
export default defineEventHandler(async (event) => {
  const db = getDb();
  const idOrSlug = getRouterParam(event, 'id');

  try {
    // Tentukan apakah mencari berdasarkan ID atau Slug
    const isId = !isNaN(Number(idOrSlug));
    const column = isId ? 'p.ID' : 'p.post_name';

    console.log(`Fetching post by ${isId ? 'ID' : 'Slug'}: ${idOrSlug}`);

    const [rows]: any = await db.query(`
      SELECT 
        p.*, p.post_name as slug,
        u.display_name as author
      FROM tbl_posts p
      LEFT JOIN tbl_users u ON u.ID = p.post_author
      WHERE ${column} = ?
      LIMIT 1
    `, [idOrSlug]);

    if (rows.length === 0) {
      console.warn(`Post not found for ${column}: ${idOrSlug}`);
      throw createError({ statusCode: 404, statusMessage: 'Post not found' });
    }

    const post = rows[0];

    // Ambil Kategori
    const [categories]: any = await db.query(`
      SELECT t.term_id as id, t.name, t.slug
      FROM tbl_terms t
      JOIN tbl_term_taxonomy tt ON tt.term_id = t.term_id
      JOIN tbl_term_relationships tr ON tr.term_taxonomy_id = tt.term_taxonomy_id
      WHERE tr.object_id = ? AND tt.taxonomy = 'category'
    `, [post.ID]);

    post.categories = categories;

    return post;
  } catch (error: any) {
    console.error('Post Detail API Error:', error.message);
    throw createError({ statusCode: error.statusCode || 500, statusMessage: error.message });
  }
});
