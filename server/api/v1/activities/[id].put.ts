export default defineEventHandler(async (event) => {
  const db = getByzisDb();
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);

  try {
    await db.query(`
      UPDATE tbl_activities 
      SET campaign_id = ?, category_id = ?, title = ?, description = ?, 
          activity_date = ?, cost_used = ?, attachment_url = ?
      WHERE id = ?
    `, [
      body.campaign_id || null, 
      body.category_id || null, 
      body.title, 
      body.description || null, 
      body.activity_date || null, 
      body.cost_used || 0, 
      body.attachment_url || null,
      id
    ]);
    return { status: 'success' };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
