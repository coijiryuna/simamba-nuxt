export default defineEventHandler(async (event) => {
  const db = getByzisDb();
  
  try {
    // 1. Total donasi terkumpul (settlement/capture)
    const [donationSum]: any = await db.query(`
      SELECT SUM(amount) as total_donation 
      FROM tbl_donations 
      WHERE transaction_status IN ('settlement', 'capture')
    `);
    
    // 2. Jumlah transaksi berhasil
    const [transactionCount]: any = await db.query(`
      SELECT COUNT(*) as total_transactions 
      FROM tbl_donations 
      WHERE transaction_status IN ('settlement', 'capture')
    `);
    
    // 3. Jumlah donatur unik berdasarkan email
    const [donorCount]: any = await db.query(`
      SELECT COUNT(DISTINCT donor_email) as unique_donors 
      FROM tbl_donations 
      WHERE transaction_status IN ('settlement', 'capture')
    `);
    
    // 4. Jumlah campaign aktif
    const [campaignCount]: any = await db.query(`
      SELECT COUNT(*) as active_campaigns 
      FROM tbl_campaigns 
      WHERE status = 'active'
    `);

    const stats = {
      total_donation_collected: parseFloat(donationSum[0].total_donation || 0),
      total_successful_donations: parseInt(transactionCount[0].total_transactions || 0),
      total_unique_donors: parseInt(donorCount[0].unique_donors || 0),
      total_active_campaigns: parseInt(campaignCount[0].active_campaigns || 0),
    };

    return {
      status: 'success',
      data: stats
    };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: 'Gagal mengambil statistik: ' + error.message });
  }
});
