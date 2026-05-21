export default defineEventHandler(async (event) => {
  const db = getDb();
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);

  try {
    let sql = 'UPDATE tbl_links SET link_updated = NOW()';
    const params = [];

    if (body.link_name) { sql += ', link_name = ?'; params.push(body.link_name); }
    if (body.link_url) { sql += ', link_url = ?'; params.push(body.link_url); }
    if (body.link_category) { sql += ', link_category = ?'; params.push(body.link_category); }
    if (body.link_target) { sql += ', link_target = ?'; params.push(body.link_target); }
    if (body.link_visible) { sql += ', link_visible = ?'; params.push(body.link_visible); }

    sql += ' WHERE link_id = ?';
    params.push(id);

    await db.query(sql, params);

    return { status: 'success', message: 'Link updated successfully' };
  } catch (error: any) {
    console.error('Update Link Error:', error);
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
