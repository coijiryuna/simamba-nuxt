import { getDb } from "../../utils/db";

export default defineEventHandler(async (event) => {
  const db = getDb();
  const query = getQuery(event);
  const id = query.id;

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID wajib disertakan' });
  }

  try {
    await db.query('DELETE FROM tbl_downloads WHERE id = ?', [id]);
    return { success: true, message: 'Data berhasil dihapus' };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
