export default defineEventHandler(async (event) => {
  const db = getDb();
  const id = getRouterParam(event, 'id'); // term_taxonomy_id

  try {
    const [tax]: any = await db.query('SELECT term_id FROM tbl_term_taxonomy WHERE term_taxonomy_id = ?', [id]);
    
    if (tax.length > 0) {
      const termId = tax[0].term_id;
      // 1. Hapus dari taxonomy
      await db.query('DELETE FROM tbl_term_taxonomy WHERE term_taxonomy_id = ?', [id]);
      // 2. Hapus dari terms
      await db.query('DELETE FROM tbl_terms WHERE term_id = ?', [termId]);
      // 3. Bersihkan relasi (Opsional: Post jadi nggak punya kategori ini)
      await db.query('DELETE FROM tbl_term_relationships WHERE term_taxonomy_id = ?', [id]);
    }

    return { status: 'success', message: 'Category deleted' };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
