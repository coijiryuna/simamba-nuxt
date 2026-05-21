import { getDb } from "../../utils/db";

export default defineEventHandler(async (event) => {
  const db = getDb();
  const query = getQuery(event);
  const sessionId = query.sessionId as string;

  if (!sessionId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Session ID is required',
    });
  }

  try {
    const [messages]: any = await db.query(
      `SELECT * FROM tbl_chats WHERE session_id = ? ORDER BY created_at ASC`,
      [sessionId]
    );

    return {
      success: true,
      data: messages
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }
});
