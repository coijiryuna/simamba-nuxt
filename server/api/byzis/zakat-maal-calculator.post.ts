export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { total_harta } = body;
  const db = getByzisDb();

  if (!total_harta || isNaN(total_harta)) {
    throw createError({ statusCode: 400, statusMessage: 'Total harta wajib diisi dan berupa angka.' });
  }

  const goldPrice = await getGoldPrice();
  if (goldPrice <= 0) {
    throw createError({ statusCode: 503, statusMessage: 'Gagal mengambil data harga emas terkini.' });
  }

  const nisabGram = 85;
  const nisabValue = nisabGram * goldPrice;
  const isZakatObligatory = total_harta >= nisabValue;
  
  let zakatAmount = total_harta * 0.025;
  let targetCategorySlug = isZakatObligatory ? 'zakat_maal' : 'infaq';
  let recommendation = isZakatObligatory 
    ? 'Harta Anda telah mencapai nisab. Anda WAJIB menunaikan Zakat Maal sebesar 2.5%.' 
    : 'Harta Anda belum mencapai nisab. Anda disarankan untuk bersedekah/infaq seikhlasnya.';

  // Find target campaign
  let targetCampaign = null;
  try {
    const [rows]: any = await db.query(`
      SELECT c.id, c.title, c.slug 
      FROM tbl_campaigns c
      JOIN tbl_categories cat ON c.category_id = cat.id
      WHERE cat.categories_type = ? AND (c.default = 1 OR c.status = 'active')
      ORDER BY c.default DESC, c.created_at DESC
      LIMIT 1
    `, [targetCategorySlug]);

    if (rows.length > 0) {
      targetCampaign = {
        ...rows[0],
        type: targetCategorySlug
      };
    }
  } catch (e) {
    console.error('Error finding target campaign:', e);
  }

  return {
    calculation: {
      gold_price_per_gram: goldPrice,
      nisab_gram: nisabGram,
      nisab_value: nisabValue,
      total_harta: parseFloat(total_harta),
      is_zakat_obligatory: isZakatObligatory,
      zakat_amount: Math.round(zakatAmount)
    },
    recommendation,
    target_campaign: targetCampaign
  };
});
