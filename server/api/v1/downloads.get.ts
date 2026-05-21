import { getDb } from "../../utils/db";

export default defineEventHandler(async (event) => {
  const db = getDb();
  
  try {
    const [downloads]: any = await db.query('SELECT * FROM tbl_downloads ORDER BY created_at DESC');
    return { success: true, data: downloads };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
