export default defineEventHandler(async (event) => {
  const db = getDb();
  const id = getRouterParam(event, 'id');

  try {
    // 1. Hapus Relasi Kategori
    await db.query('DELETE FROM tbl_term_relationships WHERE object_id = ?', [id]);
    
    // 2. Hapus Post
    await db.query('DELETE FROM tbl_posts WHERE ID = ?', [id]);

    return { status: 'success', message: 'Post deleted successfully' };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
