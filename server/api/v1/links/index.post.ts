export default defineEventHandler(async (event) => {
  const db = getDb();
  const body = await readBody(event);

  try {
    await db.query(`
      INSERT INTO tbl_links (link_url, link_name, link_category, link_target, link_visible, link_updated)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [body.link_url, body.link_name, body.link_category || 'General', body.link_target || '_self', body.link_visible || 'Y']);

    return { status: 'success', message: 'Link added successfully' };
  } catch (error: any) {
    console.error('Add Link Error:', error);
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
