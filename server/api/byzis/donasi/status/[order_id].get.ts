import midtransClient from 'midtrans-client';

export default defineEventHandler(async (event) => {
  const db = getByzisDb();
  const orderId = getRouterParam(event, 'order_id');

  const config = useRuntimeConfig();
  const snap = new midtransClient.CoreApi({
    isProduction: config.midtransIsProduction,
    serverKey: config.midtransServerKey,
    clientKey: config.midtransClientKey
  });

  try {
    // 1. Ambil status dari Midtrans
    const statusResponse = await (snap as any).transaction.status(orderId);
    
    // 2. Ambil data donasi & campaign dari database kita
    const [rows]: any = await db.query(`
      SELECT d.*, c.title as campaign_title, c.cover_image_url
      FROM tbl_donations d
      JOIN tbl_campaigns c ON d.campaign_id = c.id
      WHERE d.midtrans_order_id = ?
    `, [orderId]);

    if (rows.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Donasi tidak ditemukan' });
    }

    const donation = rows[0];

    // 3. Sinkronisasi status jika di DB masih pending tapi di Midtrans sudah settlement
    if (donation.transaction_status === 'pending' && statusResponse.transaction_status === 'settlement') {
      const connection = await db.getConnection();
      await connection.beginTransaction();
      try {
        await connection.query('UPDATE tbl_donations SET transaction_status = ?, settlement_time = ? WHERE id = ?', [
          statusResponse.transaction_status,
          statusResponse.settlement_time,
          donation.id
        ]);
        await connection.query('UPDATE tbl_campaigns SET current_amount = current_amount + ? WHERE id = ?', [
          donation.amount,
          donation.campaign_id
        ]);
        await connection.commit();
        connection.release();
        donation.transaction_status = 'settlement';
      } catch (err) {
        await connection.rollback();
        connection.release();
      }
    }

    return {
      status: 'success',
      data: {
        ...statusResponse,
        donation_detail: {
          amount: donation.amount,
          donor_name: donation.donor_name,
          campaign_title: donation.campaign_title,
          cover_image_url: donation.cover_image_url,
          transaction_status: donation.transaction_status
        }
      }
    };

  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: 'Gagal mengambil status transaksi: ' + error.message });
  }
});
