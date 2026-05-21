import { getDb } from "../../utils/db";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const db = getDb();

  if (!body.name || !body.email || !body.message) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Nama, Email, dan Pesan wajib diisi',
    });
  }

  try {
    await db.query(
      'INSERT INTO tbl_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)',
      [body.name, body.email, body.phone || null, body.subject || null, body.message]
    );

    return {
      success: true,
      message: 'Pesan Anda telah terkirim. Terima kasih!',
    };
  } catch (error: any) {
    console.error('Messages API Error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Gagal mengirim pesan. Silakan coba lagi nanti.',
    });
  }
});
