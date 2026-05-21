export default defineEventHandler(async (event) => {
  const db = getDb();
  const id = getRouterParam(event, 'id'); // Ini term_taxonomy_id
  const body = await readBody(event);

  try {
    // Cari term_id dulu dari term_taxonomy_id
    const [tax]: any = await db.query('SELECT term_id FROM tbl_term_taxonomy WHERE term_taxonomy_id = ?', [id]);
    if (tax.length === 0) throw new Error('Category not found');

    const termId = tax[0].term_id;

    if (body.name) {
      await db.query(
        'UPDATE tbl_terms SET name = ?, slug = ?, term_link = ? WHERE term_id = ?',
        [body.name, slugify(body.name), body.term_link || '', termId]
      );
    }

    if (body.term_navbar !== undefined) {
      await db.query(
        'UPDATE tbl_terms SET term_navbar = ? WHERE term_id = ?',
        [body.term_navbar, termId]
      );
    }

    return { status: 'success', message: 'Category updated' };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
