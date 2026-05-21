export default defineEventHandler(async (event) => {
  const db = getByzisDb();
  const slug = getRouterParam(event, 'slug');

  try {
    const [rows]: any = await db.query(`
      SELECT c.*, cat.name as category_name, cat.categories_type
      FROM tbl_campaigns c
      LEFT JOIN tbl_categories cat ON c.category_id = cat.id
      WHERE c.slug = ?
    `, [slug]);

    if (rows.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Campaign not found' });
    }

    const campaign = rows[0];

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

    // 3. Get donor count
    const [donors]: any = await db.query(`
      SELECT COUNT(*) as count 
      FROM tbl_donations 
      WHERE campaign_id = ? AND transaction_status IN ('settlement', 'capture')
    `, [campaign.id]);
    campaign.donator_count = donors[0].count;

    // 4. Handle Zakat Calculator for Zakat Maal
    const catType = campaign.categories_type || '';
    if (catType.includes('zakat_maal')) {
      const goldPrice = await getGoldPrice();
      if (goldPrice > 0) {
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
          },
          note: 'Perhitungan berdasarkan harga emas 85 gram x harga jual saat ini.'
        };
      }
    }

    // 5. Helper fields for frontend buttons
    campaign.button = 'Donasi Sekarang';
    if (catType.includes('zakat_maal')) {
      campaign.button = 'Zakat Sekarang';
      campaign.categories = 'zakat_maal';
    } else if (catType.includes('zakat_fitrah')) {
      campaign.button = 'Zakat Fitrah Sekarang';
      campaign.categories = 'zakat_fitrah';
    } else if (catType.includes('infaq')) {
      campaign.button = 'Infaq Sekarang';
    } else if (catType.includes('sedekah')) {
      campaign.button = 'Sedekah Sekarang';
    } else if (catType.includes('kurban')) {
      campaign.button = 'Kurban Sekarang';
      campaign.categories = 'kurban';
    }

    return {
      status: 'success',
      data: campaign
    };
  } catch (error: any) {
    throw createError({ statusCode: error.statusCode || 500, statusMessage: error.message });
  }
});
