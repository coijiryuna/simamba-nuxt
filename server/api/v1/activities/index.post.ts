export default defineEventHandler(async (event) => {
  const db = getByzisDb();
  const body = await readBody(event);

  try {
    const slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const [result]: any = await db.query(`
      INSERT INTO tbl_activities 
      (campaign_id, category_id, title, description, slug, activity_date, cost_used, attachment_url) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      body.campaign_id || null, 
      body.category_id || null, 
      body.title, 
      body.description || null, 
      slug, 
      body.activity_date || new Date(), 
      body.cost_used || 0, 
      body.attachment_url || null
    ]);
    return { status: 'success', id: result.insertId };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
