export default defineEventHandler(async (event) => {
  const db = getDb();
  const id = getRouterParam(event, 'id');
  const formData = await readMultipartFormData(event);

  if (!formData) {
    throw createError({ statusCode: 400, statusMessage: 'No form data found' });
  }

  const getField = (name: string) => formData.find(f => f.name === name)?.data.toString();
  const getFile = (name: string) => formData.find(f => f.name === name);

  const title = getField('agenda_title');
  const content = getField('agenda_content');
  const status = getField('agenda_status');
  const featuredImage = getFile('featured_image');

  try {
    // 1. Update basic data
    let sql = 'UPDATE tbl_agendas SET agenda_modified = NOW()';
    const params: any[] = [];

    if (title) {
      const slug = slugify(title);
      // Cek duplikasi (kecuali dirinya sendiri)
      const [existing]: any = await db.query('SELECT ID FROM tbl_agendas WHERE (agenda_title = ? OR agenda_name = ?) AND ID != ?', [title, slug, id]);
      if (existing.length > 0) {
        throw createError({ statusCode: 400, statusMessage: 'Judul atau Slug ini sudah digunakan oleh agenda lain' });
      }
      sql += ', agenda_title = ?, agenda_name = ?';
      params.push(title, slug);
    }
    if (content) {
      sql += ', agenda_content = ?';
      params.push(content);
    }
    if (status) {
      sql += ', agenda_status = ?';
      params.push(status);
    }

    // 2. Handle Image jika ada upload baru
    if (featuredImage) {
      console.log('featuredImage received for update:', featuredImage.filename, featuredImage.type);
      const fileData = await saveFile(featuredImage, 'agendas');
      if (fileData) {
        sql += ', featured_image_url = ?';
        params.push(fileData.url);
        console.log('Image updated successfully:', fileData.url);
      } else {
        console.log('saveFile returned null/undefined for update');
      }
    } else {
      console.log('No new featuredImage received for update');
    }

    sql += ' WHERE ID = ?';
    params.push(id);

    await db.query(sql, params);

    return { status: 'success', message: 'agenda updated successfully' };
  } catch (error: any) {
    console.error('Update agenda Error:', error);
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
