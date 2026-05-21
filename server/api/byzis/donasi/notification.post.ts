import midtransClient from 'midtrans-client';

export default defineEventHandler(async (event) => {
  const db = getByzisDb();
  const body = await readBody(event);
  
  const config = useRuntimeConfig();
  const snap = new midtransClient.CoreApi({
    isProduction: config.midtransIsProduction,
    serverKey: config.midtransServerKey,
    clientKey: config.midtransClientKey
  });

  try {
    // Verifikasi notifikasi dari Midtrans
    const statusResponse = await (snap as any).transaction.notification(body);
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // 1. Ambil data donasi
      const [donations]: any = await connection.query('SELECT * FROM tbl_donations WHERE midtrans_order_id = ?', [orderId]);
      if (donations.length === 0) {
        connection.release();
        return { status: 'error', message: 'Donasi tidak ditemukan' };
      }

      const donation = donations[0];

      // 2. Hindari proses ulang jika sudah final
      if (donation.transaction_status === 'settlement' || donation.transaction_status === 'capture') {
        await connection.commit();
        connection.release();
        return { status: 'success', message: 'Status sudah final' };
      }

      // 3. Update status donasi
      const updateData: any = {
        transaction_status: transactionStatus,
        midtrans_transaction_id: statusResponse.transaction_id,
        payment_type: statusResponse.payment_type,
        settlement_time: statusResponse.settlement_time || null,
        fraud_status: fraudStatus || null,
        updated_at: new Date()
      };

      await connection.query('UPDATE tbl_donations SET ? WHERE id = ?', [updateData, donation.id]);

      // 4. Jika status Berhasil (settlement / capture accept), update saldo campaign
      if (transactionStatus === 'settlement' || (transactionStatus === 'capture' && fraudStatus === 'accept')) {
        await connection.query('UPDATE tbl_campaigns SET current_amount = current_amount + ? WHERE id = ?', [donation.amount, donation.campaign_id]);
      }

      await connection.commit();
      connection.release();

      return { status: 'success', message: 'Webhook processed successfully' };

    } catch (err: any) {
      await connection.rollback();
      connection.release();
      throw err;
    }
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: 'Gagal memproses notifikasi Midtrans: ' + error.message });
  }
});
