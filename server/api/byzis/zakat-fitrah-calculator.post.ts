export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { jumlah_jiwa } = body;
  const db = getByzisDb();

  if (!jumlah_jiwa || isNaN(jumlah_jiwa)) {
    throw createError({ statusCode: 400, statusMessage: 'Jumlah jiwa wajib diisi dan berupa angka.' });
  }

  try {
    // Get default amount for zakat_fitrah from campaign
    const [campaigns]: any = await db.query(`
      SELECT c.id, c.title, c.slug, c.default_amount, cat.categories_type
      FROM tbl_campaigns c
      JOIN tbl_categories cat ON c.category_id = cat.id
      WHERE cat.categories_type = 'zakat_fitrah' AND (c.default = 1 OR c.status = 'active')
      ORDER BY c.default DESC, c.created_at DESC
      LIMIT 1
    `);

    if (campaigns.length === 0) {
      throw createError({ statusCode: 503, statusMessage: 'Gagal mengambil data harga fitrah terkini.' });
    }

    const campaign = campaigns[0];
    const nilai_harga_fitrah = parseFloat(campaign.default_amount || 0);
    const zakat_fitrah = jumlah_jiwa * nilai_harga_fitrah;

    return {
      zakat_fitrah,
      jumlah_jiwa: parseInt(jumlah_jiwa),
      harga_fitrah: nilai_harga_fitrah,
      nilai_harga_fitrah: nilai_harga_fitrah,
      recommendation: `Harga fitrah untuk ${jumlah_jiwa} jiwa adalah Rp ${zakat_fitrah.toLocaleString('id-ID')}`,
      target_campaign: {
        id: campaign.id,
        title: campaign.title,
        slug: campaign.slug,
        type: campaign.categories_type
      }
    };
  } catch (error: any) {
    throw createError({ statusCode: error.statusCode || 500, statusMessage: error.message });
  }
});
