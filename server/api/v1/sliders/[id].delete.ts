import fs from 'node:fs/promises';
import path from 'node:path';

export default defineEventHandler(async (event) => {
  const db = getDb();
  const id = getRouterParam(event, 'id');

  try {
    // 1. Ambil nama file buat dihapus fisiknya
    const [rows]: any = await db.query('SELECT image_url FROM tbl_sliders WHERE id = ?', [id]);
    
    if (rows.length > 0) {
      const imageUrl = rows[0].image_url;
      if (imageUrl && imageUrl.startsWith('/uploads/')) {
        const filePath = path.join(process.cwd(), 'public', imageUrl);
        try {
          await fs.unlink(filePath);
        } catch (e) {
          console.warn('Slider image not found on disk.');
        }
      }
    }

    // 2. Hapus dari database
    await db.query('DELETE FROM tbl_sliders WHERE id = ?', [id]);

    return { status: 'success', message: 'Slider banner deleted successfully' };
  } catch (error: any) {
    console.error('Delete Slider Error:', error);
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
