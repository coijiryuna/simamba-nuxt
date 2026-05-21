import fs from 'node:fs/promises';
import path from 'node:path';

export default defineEventHandler(async (event) => {
  const db = getDb();
  const id = getRouterParam(event, 'id');

  try {
    // 1. Ambil nama file gambar dulu buat dihapus fisiknya
    const [rows]: any = await db.query('SELECT images_url FROM tbl_galery WHERE id = ?', [id]);
    
    if (rows.length > 0) {
      const imageUrl = rows[0].images_url;
      if (imageUrl && imageUrl.startsWith('/uploads/')) {
        const filePath = path.join(process.cwd(), 'public', imageUrl);
        try {
          await fs.unlink(filePath);
        } catch (e) {
          console.warn('File image not found on disk, but deleting DB record anyway.');
        }
      }
    }

    // 2. Hapus dari database
    await db.query('DELETE FROM tbl_galery WHERE id = ?', [id]);

    return { status: 'success', message: 'Gallery item deleted successfully' };
  } catch (error: any) {
    console.error('Delete Gallery Error:', error);
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
