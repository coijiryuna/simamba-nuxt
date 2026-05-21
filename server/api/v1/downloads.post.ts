import { getDb } from "../../utils/db";

export default defineEventHandler(async (event) => {
  const db = getDb();
  const body = await readBody(event);

  if (!body.title || !body.file_url) {
    throw createError({ statusCode: 400, statusMessage: 'Judul dan URL File wajib diisi' });
  }

  try {
    if (body.id) {
      // Update
      await db.query(
        'UPDATE tbl_downloads SET title = ?, description = ?, file_url = ?, file_category = ? WHERE id = ?',
        [body.title, body.description || '', body.file_url, body.file_category || 'Laporan', body.id]
      );
    } else {
      // Insert
      await db.query(
        'INSERT INTO tbl_downloads (title, description, file_url, file_category) VALUES (?, ?, ?, ?)',
        [body.title, body.description || '', body.file_url, body.file_category || 'Laporan']
      );
    }
    return { success: true, message: 'Data berhasil disimpan' };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
