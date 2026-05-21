export default defineEventHandler(async (event) => {
  const db = getByzisDb();
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);

  try {
    const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // Cek duplikasi (kecuali dirinya sendiri)
    const [existing]: any = await db.query('SELECT id FROM tbl_categories WHERE (name = ? OR slug = ?) AND id != ?', [body.name, slug, id]);
    if (existing.length > 0) {
      throw createError({ statusCode: 400, statusMessage: 'Nama atau Slug kategori ini sudah digunakan oleh kategori lain' });
    }

    await db.query(`
      UPDATE tbl_categories 
      SET name = ?, slug = ?, categories_type = ?
      WHERE id = ?
    `, [body.name, slug, body.categories_type || 'donasi', id]);
    // Note: We deliberately don't update slug to prevent breaking old URLs unless necessary
    return { status: 'success' };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
