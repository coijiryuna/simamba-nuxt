import fs from 'node:fs/promises';
import path from 'node:path';

export default defineEventHandler(async (event) => {
  const db = getDb();
  const id = getRouterParam(event, 'id');
  const formData = await readMultipartFormData(event);
  
  if (!formData) {
    throw createError({ statusCode: 400, statusMessage: 'No form data found' });
  }

  const getField = (name: string) => formData.find(f => f.name === name)?.data.toString();
  const getFile = (name: string) => formData.find(f => f.name === name);

  const title = getField('title');
  const caption = getField('caption');
  const link_url = getField('link_url');
  const display_order = getField('display_order');
  const status = getField('status');
  const image = getFile('image');

  try {
    let sql = 'UPDATE tbl_sliders SET title = ?, caption = ?, link_url = ?, display_order = ?, status = ?';
    const params: any[] = [title, caption, link_url, display_order, status];

    if (image && image.data.length > 0) {
      // 1. Hapus gambar lama
      const [rows]: any = await db.query('SELECT image_url FROM tbl_sliders WHERE id = ?', [id]);
      if (rows.length > 0 && rows[0].image_url?.startsWith('/uploads/')) {
        const oldPath = path.join(process.cwd(), 'public', rows[0].image_url);
        try { await fs.unlink(oldPath); } catch (e) {}
      }

      // 2. Upload gambar baru
      const fileData = await saveFile(image, 'sliders');
      if (fileData) {
        sql += ', image = ?, image_url = ?';
        params.push(fileData.filename, fileData.url);
      }
    }

    sql += ' WHERE id = ?';
    params.push(id);

    await db.query(sql, params);

    return { status: 'success', message: 'Slider updated successfully' };
  } catch (error: any) {
    console.error('Update Slider Error:', error);
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
