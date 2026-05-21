import { getDb } from '../utils/db';

export default defineEventHandler(async (event) => {
  const db = getDb();
  try {
    const [rows]: any = await db.query("SELECT * FROM tbl_sliders WHERE status = 'active' ORDER BY display_order ASC");
    return {
      status: 'success',
      data: rows
    };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
