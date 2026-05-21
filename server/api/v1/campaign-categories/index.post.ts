export default defineEventHandler(async (event) => {
  const db = getByzisDb();
  const body = await readBody(event);

  try {
    const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // Cek duplikasi
    const [existing]: any = await db.query('SELECT id FROM tbl_categories WHERE name = ? OR slug = ?', [body.name, slug]);
    if (existing.length > 0) {
      throw createError({ statusCode: 400, statusMessage: 'Nama atau Slug kategori ini sudah digunakan' });
    }

    const [result]: any = await db.query(`
      INSERT INTO tbl_categories (name, slug, categories_type) 
      VALUES (?, ?, ?)
    `, [
      body.name, 
      body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''), // Auto slug
      body.categories_type || 'donasi'
    ]);
    return { status: 'success', id: result.insertId };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
