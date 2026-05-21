export default defineEventHandler(async (event) => {
  const db = getByzisDb();
  try {
    // 1. Get kurban category
    const [categories]: any = await db.query("SELECT id FROM tbl_categories WHERE categories_type = 'kurban'");
    
    if (categories.length === 0) {
      return { status: 'success', data: [] };
    }

    const categoryId = categories[0].id;

    // 2. Get campaigns for kurban
    const [campaigns]: any = await db.query(`
      SELECT * FROM tbl_campaigns 
      WHERE category_id = ? AND status = 'active'
    `, [categoryId]);

    // 3. Get recent activities for kurban
    const [activities]: any = await db.query(`
      SELECT a.* FROM tbl_activities a
      JOIN tbl_campaigns c ON a.campaign_id = c.id
      WHERE c.category_id = ?
      ORDER BY a.activity_date DESC LIMIT 5
    `, [categoryId]);

    return {
      status: 'success',
      data: campaigns,
      activities: activities,
      button: 'Kurban Sekarang'
    };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
