import midtransClient from 'midtrans-client';
import jwt from 'jsonwebtoken';

export default defineEventHandler(async (event) => {
  const db = getByzisDb();
  const body = await readBody(event);
  
  const { 
    campaign_id, 
    amount, 
    payment_code, 
    donor_name, 
    donor_email, 
    donor_phone, 
    message, 
    is_anonymous, 
    admin_fee, 
    mudhohi, 
    mudhohi_names,
    mudhohiPhone, 
    mudhohi_phones,
    mudhohiemail, 
    mudhohi_emails,
    chekedmudhohi,
    quantity
  } = body;
  
  if (!campaign_id || !amount || !payment_code) {
    throw createError({ statusCode: 400, statusMessage: 'Field campaign_id, amount, dan payment_code wajib diisi.' });
  }

  if (parseInt(amount) < 10000) {
    throw createError({ statusCode: 400, statusMessage: 'Nominal donasi minimal Rp 10.000.' });
  }

  const [campaigns]: any = await db.query('SELECT * FROM tbl_campaigns WHERE id = ?', [campaign_id]);
  if (campaigns.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Program campaign tidak ditemukan.' });
  }
  const campaign = campaigns[0];

  let userId = null;
  const authHeader = getHeader(event, 'authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      if (token) {
        const config = useRuntimeConfig();
        const decoded: any = jwt.verify(token, (config.jwtSecretByzis || 'secret') as string);
        userId = decoded.id;
      }
    } catch (e) {
      // Ignore invalid token - guest mode fallback
    }
  }

  // Validasi guest: email & phone wajib diisi jika tidak login
  if (!userId) {
    if (!donor_email || !donor_phone) {
      throw createError({ statusCode: 400, statusMessage: 'Email dan Nomor Telepon wajib diisi jika berdonasi tanpa login.' });
    }
  }

  const orderId = `BAZTGN-${Date.now()}-${Math.floor(Math.random() * 900) + 100}`;
  const donationData = {
    user_id: userId,
    campaign_id,
    amount: parseInt(amount),
    admin_fee: parseInt(admin_fee || 0),
    donor_name: donor_name || 'Hamba Allah',
    donor_email: donor_email || '-',
    donor_phone: donor_phone || '-',
    donor_address: body.donor_address || '-',
    donor_village: body.donor_village || '-',
    donor_district: body.donor_district || '-',
    donor_city: body.donor_city || '-',
    donor_province: body.donor_province || '-',
    donor_zip_code: body.donor_zip_code || '-',
    message: message || '',
    is_anonymous: is_anonymous ? 1 : 0,
    midtrans_order_id: orderId,
    transaction_status: 'pending',
    payment_type: payment_code,
    created_at: new Date(),
    updated_at: new Date()
  };

  try {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Cek kategori campaign untuk validasi Kurban
      const [categories]: any = await connection.query('SELECT * FROM tbl_categories WHERE id = ?', [campaign.category_id]);
      const category = categories[0];
      const isKurban = category && category.categories_type && category.categories_type.includes('kurban');
      const qty = parseInt(quantity || 1);

      if (isKurban) {
        const names = mudhohi_names || mudhohi;
        const mudhohiArr = Array.isArray(names) ? names.filter(Boolean) : (names ? [names] : []);
        const mudhohiCount = mudhohiArr.length;

        // Cek ketersediaan slot untuk unit 'paket'
        if (campaign.unit === 'paket') {
          if (campaign.remaining_slots < qty) {
            throw createError({ statusCode: 400, statusMessage: `Maaf, hanya tersisa ${campaign.remaining_slots} paket. Anda memilih ${qty} paket.` });
          }
          // Update slot
          await connection.query('UPDATE tbl_campaigns SET booked_slots = booked_slots + ?, remaining_slots = remaining_slots - ? WHERE id = ?', [qty, qty, campaign_id]);
        }

        // Validasi mudhohi untuk patungan (is_multiple = 1): jumlah mudhohi harus = quantity
        if (campaign.is_multiple == 1 && mudhohiCount !== qty) {
          throw createError({ statusCode: 400, statusMessage: `Jumlah nama pekurban (${mudhohiCount}) harus sama dengan jumlah hewan/bagian yang dipilih (${qty}).` });
        }
        // Validasi mudhohi untuk utuh (is_multiple = 0): max 7 orang per hewan
        if (campaign.is_multiple == 0 && mudhohiCount > (7 * qty)) {
          throw createError({ statusCode: 400, statusMessage: `Jumlah nama pekurban maksimal ${7 * qty} orang untuk ${qty} hewan.` });
        }
      }

      const [result]: any = await connection.query('INSERT INTO tbl_donations SET ?', donationData);
      const donationId = result.insertId;

      const groupData: any[] = [];
      if (chekedmudhohi) {
        groupData.push([null, donationId, donationData.donor_name, donationData.donor_phone, donationData.donor_email]);
      }

      // Untuk Kurban is_multiple=0 (utuh): jika tidak ada mudhohi, auto-isi dengan nama donatur
      const isKurbanUtuh = category && category.categories_type?.includes('kurban') && campaign.is_multiple == 0;
      const names = mudhohi_names || mudhohi;
      const mudhohiList = Array.isArray(names) ? names.filter(Boolean) : (names ? [names] : []);
      const finalMudhohi = isKurbanUtuh && mudhohiList.length === 0
        ? [donationData.donor_name]
        : mudhohiList;
      
      const phones = mudhohi_phones || mudhohiPhone;
      const finalPhone  = Array.isArray(phones) ? phones : (phones ? [phones] : []);
      
      const emails = mudhohi_emails || mudhohiemail;
      const finalEmail  = Array.isArray(emails) ? emails : (emails ? [emails] : []);

      if (finalMudhohi.length > 0) {
        finalMudhohi.forEach((name: string, index: number) => {
          if (name) {
            groupData.push([
              null,
              donationId,
              name,
              finalPhone[index] || '',
              finalEmail[index] || ''
            ]);
          }
        });
      }

      if (groupData.length > 0) {
        await connection.query('INSERT INTO tbl_donation_group_user (id_user, donation_id, donation_name, donation_phone, donation_email) VALUES ?', [groupData]);
      }

      await connection.commit();
      connection.release();

      const config = useRuntimeConfig();
      const snap = new midtransClient.CoreApi({
        isProduction: config.midtransIsProduction,
        serverKey: config.midtransServerKey || '',
        clientKey: config.midtransClientKey || ''
      });

      const itemDetails = [
        {
          id: `BAZTGN-${campaign.id}`,
          price: parseInt(amount),
          quantity: parseInt(quantity || 1),
          name: campaign.title.substring(0, 50)
        }
      ];

      if (donationData.admin_fee > 0) {
        itemDetails.push({
          id: `ADMIN-FEE-${campaign.id}`,
          price: donationData.admin_fee,
          quantity: 1,
          name: 'Infaq Pemeliharaan Sistem'
        });
      }

      const params: any = {
        transaction_details: {
          order_id: orderId,
          gross_amount: donationData.amount + donationData.admin_fee
        },
        customer_details: {
          first_name: donationData.donor_name,
          email: donationData.donor_email,
          phone: donationData.donor_phone,
          address: donationData.donor_address
        },
        item_details: itemDetails
      };

      switch (payment_code) {
        case 'bca_va':
        case 'bni_va':
        case 'bri_va':
        case 'cimb_va':
          params.payment_type = 'bank_transfer';
          params.bank_transfer = { bank: payment_code.replace('_va', '') };
          break;
        case 'permata_va':
          params.payment_type = 'permata';
          break;
        case 'mandiri_bill':
          params.payment_type = 'echannel';
          params.echannel = {
            bill_info1: 'Pembayaran untuk:',
            bill_info2: campaign.title.substring(0, 20)
          };
          break;
        case 'indomaret':
        case 'alfamart':
          params.payment_type = 'cstore';
          params.cstore = {
            store: payment_code,
            message: 'Pembayaran ' + campaign.title.substring(0, 20)
          };
          break;
        case 'qris':
          params.payment_type = 'qris';
          break;
        case 'gopay':
          params.payment_type = 'gopay';
          break;
        case 'shopeepay':
          params.payment_type = 'shopeepay';
          params.shopeepay = { callback_url: 'https://donasi.baznastangerangkab.or.id/' };
          break;
        default:
          params.payment_type = payment_code;
      }

      const midtransResponse = await snap.charge(params);

      // Helper to format response (similar to CI formatPaymentResponse)
      const formattedResponse = formatPaymentResponse(midtransResponse, payment_code);

      return {
        status: 'success',
        message: 'Transaksi berhasil dibuat, silakan selesaikan pembayaran.',
        donation_id: donationId,
        order_id: orderId,
        payment_type: payment_code,
        payment_data: formattedResponse
      };

    } catch (err: any) {
      await connection.rollback();
      connection.release();
      throw err;
    }
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: 'Gagal memproses donasi: ' + error.message });
  }
});

function formatPaymentResponse(res: any, code: string) {
  const base = {
    transaction_id: res.transaction_id,
    order_id: res.order_id,
    gross_amount: res.gross_amount,
    transaction_status: res.transaction_status,
    transaction_time: res.transaction_time,
    expiry_time: res.expiry_time,
  };

  let specific: any = {};

  if (code.includes('_va')) {
    specific = {
      payment_method: 'Virtual Account',
      bank: code.replace('_va', '').toUpperCase(),
      va_number: res.va_numbers ? res.va_numbers[0].va_number : (res.permata_va_number || null)
    };
  } else if (code === 'mandiri_bill') {
    specific = {
      payment_method: 'Mandiri Bill',
      bill_key: res.bill_key,
      biller_code: res.biller_code
    };
  } else if (code === 'qris') {
    specific = {
      payment_method: 'QRIS',
      qr_code_url: res.actions?.find((a: any) => a.name === 'generate-qr-code')?.url,
      qr_string: res.qr_string
    };
  } else if (code === 'gopay' || code === 'shopeepay') {
    specific = {
      payment_method: code === 'gopay' ? 'GoPay' : 'ShopeePay',
      deeplink: res.actions?.find((a: any) => a.name === 'deeplink-redirect')?.url
    };
  } else if (code === 'indomaret' || code === 'alfamart') {
    specific = {
      payment_method: code.charAt(0).toUpperCase() + code.slice(1),
      payment_code: res.payment_code
    };
  }

  return { ...base, ...specific };
}
