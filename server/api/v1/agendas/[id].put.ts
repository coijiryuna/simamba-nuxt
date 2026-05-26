export default defineEventHandler(async (event) => {
  const db = getDb();
  const id = getRouterParam(event, 'id');
  const formData = await readMultipartFormData(event);

  if (!formData) {
    throw createError({ statusCode: 400, statusMessage: 'No form data found' });
  }

  const getField = (name: string) => formData.find(f => f.name === name)?.data.toString();
  const getFile = (name: string) => formData.find(f => f.name === name);
  const getFiles = (name: string) => formData.filter(f => f.name === name);

  const title = getField('agenda_title');
  const content = getField('agenda_content');
  const status = getField('agenda_status');
  const agendaType = getField('agenda_type');
  const featuredImage = getFile('featured_image');
  const existingGalleriesRaw = getField('existing_galleries');
  const newGalleryFiles = getFiles('gallery_images');

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
    if (agendaType) {
      sql += ', agenda_type = ?';
      params.push(agendaType);
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

    // 3. Sinkronisasi Galeri (Hapus yang tidak ada di list existing)
    if (existingGalleriesRaw !== undefined) {
      const existingGalleries: string[] = JSON.parse(existingGalleriesRaw);
      
      if (existingGalleries.length > 0) {
        const placeholders = existingGalleries.map(() => '?').join(',');
        await db.query(
          `DELETE FROM tbl_agendameta WHERE agenda_id = ? AND meta_key = 'gallery_image' AND meta_value NOT IN (${placeholders})`,
          [id, ...existingGalleries]
        );
      } else {
        // Jika kosong, hapus semua galeri untuk agenda ini
        await db.query(`DELETE FROM tbl_agendameta WHERE agenda_id = ? AND meta_key = 'gallery_image'`, [id]);
      }
    }

    // 4. Upload file galeri baru jika ada
    if (newGalleryFiles.length > 0) {
      for (const file of newGalleryFiles) {
        const fileData = await saveFile(file, 'agendas');
        if (fileData?.url) {
          await db.query(`INSERT INTO tbl_agendameta (agenda_id, meta_key, meta_value) VALUES (?, 'gallery_image', ?)`, [id, fileData.url]);
        }
      }
    }

    return { status: 'success', message: 'agenda updated successfully' };
  } catch (error: any) {
    console.error('Update agenda Error:', error);
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
