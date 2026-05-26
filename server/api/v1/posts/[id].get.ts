export default defineEventHandler(async (event) => {
  const db = getDb();
  const idOrSlug = getRouterParam(event, "id");

  try {
    // Tentukan apakah mencari berdasarkan ID atau Slug
    const isId = !isNaN(Number(idOrSlug));
    const column = isId ? "p.ID" : "p.post_name";

    console.log(`Fetching post by ${isId ? "ID" : "Slug"}: ${idOrSlug}`);

    const [rows]: any = await db.query(
      `
      SELECT 
        p.*, p.post_name as slug,
        u.display_name as author,
        -- Ambil galeri dari tbl_postmeta agar konsisten dengan agenda
        (
          SELECT GROUP_CONCAT(meta_value SEPARATOR '|')
          FROM tbl_postmeta m
          WHERE m.post_id = p.ID AND m.meta_key = 'post_image'
        ) as post_images
      FROM tbl_posts p
      LEFT JOIN tbl_users u ON u.ID = p.post_author
      WHERE ${column} = ?
      LIMIT 1
    `,
      [idOrSlug]
    );

    if (rows.length === 0) {
      throw createError({ statusCode: 404, statusMessage: "Berita tidak ditemukan" });
    }

    const post = rows[0];

    // Format post_images menjadi array
    post.post_images = post.post_images ? post.post_images.split("|").filter(Boolean) : [];

    // Ambil Kategori
    const [categories]: any = await db.query(
      `
      SELECT t.term_id as id, t.name, t.slug
      FROM tbl_terms t
      JOIN tbl_term_taxonomy tt ON tt.term_id = t.term_id
      JOIN tbl_term_relationships tr ON tr.term_taxonomy_id = tt.term_taxonomy_id
      WHERE tr.object_id = ? AND tt.taxonomy = 'category'
    `,
      [post.ID],
    );

    post.categories = categories;
    return post;
  } catch (error: any) {
    console.error("Post Detail API Error:", error.message);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message,
    });
  }
});
