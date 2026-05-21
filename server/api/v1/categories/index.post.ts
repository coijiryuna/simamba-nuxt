export default defineEventHandler(async (event) => {
  const db = getDb();
  const body = await readBody(event);
  const { name, parent } = body;
  const slug = slugify(name);

  try {
    // 1. Simpan ke tbl_terms
    const [termResult]: any = await db.query(
      'INSERT INTO tbl_terms (name, slug, term_link) VALUES (?, ?, ?)',
      [name, slug, body.term_link || '']
    );
    const termId = termResult.insertId;

    // 2. Simpan ke tbl_term_taxonomy
    await db.query(
      'INSERT INTO tbl_term_taxonomy (term_id, taxonomy, parent, count) VALUES (?, ?, ?, ?)',
      [termId, 'category', parent || 0, 0]
    );

    return { status: 'success', message: 'Category created' };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
