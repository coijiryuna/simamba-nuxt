import { getDb } from "../../utils/db";

export default defineEventHandler(async (event) => {
  const db = getDb();
  const query = getQuery(event);
  const page = parseInt(query.page as string) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  try {
    const [messages]: any = await db.query(
      `SELECT * FROM tbl_messages ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [[{ total }]]: any = await db.query('SELECT COUNT(*) as total FROM tbl_messages');

    return {
      success: true,
      data: messages,
      total,
      limit,
      page
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }
});
