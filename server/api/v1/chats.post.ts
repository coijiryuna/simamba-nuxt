import { getDb } from "../../utils/db";

export default defineEventHandler(async (event) => {
  const db = getDb();
  const body = await readBody(event);

  if (!body.sessionId || !body.message || !body.senderRole) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields',
    });
  }

  try {
    await db.query(
      'INSERT INTO tbl_chats (session_id, sender_role, sender_name, sender_contact, message) VALUES (?, ?, ?, ?, ?)',
      [body.sessionId, body.senderRole, body.senderName || 'Guest', body.senderContact || null, body.message]
    );

    return {
      success: true,
      message: 'Message sent'
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }
});
