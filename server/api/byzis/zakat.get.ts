export default defineEventHandler(async (event) => {
  const db = getByzisDb();
  try {
    // 1. Get categories related to zakat
    const [categories]: any = await db.query(`
      SELECT id FROM tbl_categories 
      WHERE categories_type IN ('zakat_maal', 'zakat_fitrah')
    `);
    
    if (categories.length === 0) {
      return { status: 'success', data: [] };
    }

    const categoryIds = categories.map((c: any) => c.id);

    // 2. Get campaigns for these categories
    const [campaigns]: any = await db.query(`
      SELECT * FROM tbl_campaigns 
      WHERE category_id IN (?) AND status = 'active'
    `, [categoryIds]);

    // 3. Get recent activities for zakat
    const [activities]: any = await db.query(`
      SELECT a.* FROM tbl_activities a
      JOIN tbl_campaigns c ON a.campaign_id = c.id
      WHERE c.category_id IN (?)
      ORDER BY a.activity_date DESC LIMIT 5
    `, [categoryIds]);

    return {
      status: 'success',
      data: campaigns,
      activities: activities,
      button: 'Zakat Sekarang'
    };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
