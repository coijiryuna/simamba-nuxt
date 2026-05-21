import { getDb } from "../../../utils/db";

export default defineEventHandler(async (event) => {
  const db = getDb();
  
  try {
    // Ambil ID pesan terakhir & ID donasi terakhir
    const [[lastMsg]]: any = await db.query('SELECT id FROM tbl_messages ORDER BY id DESC LIMIT 1');
    const [[lastDonation]]: any = await db.query('SELECT id FROM tbl_donations ORDER BY id DESC LIMIT 1');
    const [[unreadCount]]: any = await db.query('SELECT COUNT(*) as count FROM tbl_messages WHERE is_read = 0');

    return {
      lastMessageId: lastMsg?.id || 0,
      lastDonationId: lastDonation?.id || 0,
      unreadMessages: unreadCount?.count || 0
    };
  } catch (error: any) {
    return { lastMessageId: 0, lastDonationId: 0, unreadMessages: 0 };
  }
});
