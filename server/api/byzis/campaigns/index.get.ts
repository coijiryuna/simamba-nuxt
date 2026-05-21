export default defineEventHandler(async (event) => {
  const db = getByzisDb();
  const query = getQuery(event);
  
  const categorySlug = query.category as string;
  const searchQuery = query.search as string;

  try {
    let sql = `
      SELECT c.*, cat.name as category_name, cat.categories_type
      FROM tbl_campaigns c
      LEFT JOIN tbl_categories cat ON c.category_id = cat.id
      WHERE c.status = 'active'
    `;
    const params: any[] = [];

    // Filter categories that are NOT zakat/kurban by default unless requested?
    // CI logic: excluded zakat/kurban from general index
    if (!categorySlug) {
      sql += " AND cat.categories_type NOT IN ('kurban', 'zakat_maal', 'zakat_fitrah')";
    } else {
      sql += " AND cat.categories_type = ?";
      params.push(categorySlug);
    }

    if (searchQuery) {
      sql += " AND c.title LIKE ?";
      params.push(`%${searchQuery}%`);
    }

    sql += " ORDER BY c.created_at DESC";

    const [rows]: any = await db.query(sql, params);

    const data = rows.map((campaign: any) => {
      // Calculate progress percentage
      const target = parseFloat(campaign.target_amount) || 0;
      const current = parseFloat(campaign.current_amount) || 0;
      campaign.progress_percentage = target > 0 ? parseFloat(((current / target) * 100).toFixed(2)) : 0;

      // Calculate days remaining
      if (campaign.end_date) {
        const endDate = new Date(campaign.end_date);
        const today = new Date();
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        campaign.days_remaining = diffDays > 0 ? diffDays : 0;
      } else {
        campaign.days_remaining = null;
      }

      return campaign;
    });

    // Handle Zakat Calculator for Zakat Maal campaigns in the list
    const goldPrice = await getGoldPrice();
    const finalData = data.map((campaign: any) => {
      if (campaign.categories_type && campaign.categories_type.includes('zakat_maal') && goldPrice > 0) {
        const nisabGram = 85;
        const nisabValue = nisabGram * goldPrice;
        const zakatYearly = nisabValue * 0.025;
        const zakatMonthly = zakatYearly / 12;

        campaign.zakat_calculator = {
          gold_price_per_gram: goldPrice,
          nisab_gram: nisabGram,
          nisab_value: nisabValue,
          zakat_obligation: {
            yearly: Math.round(zakatYearly),
            monthly: Math.round(zakatMonthly)
          }
        };
      }
      return campaign;
    });

    return {
      status: 'success',
      data: finalData
    };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
