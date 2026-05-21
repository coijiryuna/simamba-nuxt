import { getDb } from "../../../utils/db";

export default defineEventHandler(async (event) => {
  const db = getDb();
  
  try {
    const [sessions]: any = await db.query(`
      SELECT 
        session_id, 
        MAX(sender_name) as guest_name,
        MAX(sender_contact) as guest_contact,
        MAX(created_at) as last_message_at,
        (SELECT message FROM tbl_chats WHERE session_id = c.session_id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT COUNT(*) FROM tbl_chats WHERE session_id = c.session_id AND is_read = 0 AND sender_role = 'guest') as unread_count
      FROM tbl_chats c
      GROUP BY session_id
      ORDER BY last_message_at DESC
    `);

    return {
      success: true,
      data: sessions
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }
});
