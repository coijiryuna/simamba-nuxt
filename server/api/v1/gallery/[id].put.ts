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

  const caption = getField('caption');
  const category = getField('category');
  const description = getField('description');
  const image = getFile('image');

  try {
    let sql = 'UPDATE tbl_galery SET caption = ?, category = ?, description = ?, slug = ?';
    const params: any[] = [caption, category, description, slugify(caption || '')];

    if (image && image.data.length > 0) {
      // 1. Hapus gambar lama
      const [rows]: any = await db.query('SELECT images_url FROM tbl_galery WHERE id = ?', [id]);
      if (rows.length > 0 && rows[0].images_url?.startsWith('/uploads/')) {
        const oldPath = path.join(process.cwd(), 'public', rows[0].images_url);
        try { await fs.unlink(oldPath); } catch (e) {}
      }

      // 2. Upload gambar baru
      const fileData = await saveFile(image, 'gallery');
      if (fileData) {
        sql += ', images = ?, images_url = ?';
        params.push(fileData.filename, fileData.url);
      }
    }

    sql += ' WHERE id = ?';
    params.push(id);

    await db.query(sql, params);

    return { status: 'success', message: 'Gallery updated successfully' };
  } catch (error: any) {
    console.error('Update Gallery Error:', error);
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
