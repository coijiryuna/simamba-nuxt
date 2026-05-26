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

  const title = getField('post_title');
  const content = getField('post_content');
  const status = getField('post_status');
  const categories = getField('categories')?.split(',') || [];
  const featuredImage = getFile('featured_image');
  const existingPostsRaw = getField("existing_posts");
  const newPostFiles = getFiles("post_images");

  try {
    // 1. Update basic data
    let sql = 'UPDATE tbl_posts SET post_modified = NOW()';
    const params: any[] = [];

    if (title) {
      const slug = slugify(title);
      // Cek duplikasi (kecuali dirinya sendiri)
      const [existing]: any = await db.query('SELECT ID FROM tbl_posts WHERE (post_title = ? OR post_name = ?) AND ID != ?', [title, slug, id]);
      if (existing.length > 0) {
        throw createError({ statusCode: 400, statusMessage: 'Judul atau Slug ini sudah digunakan oleh berita lain' });
      }
      sql += ', post_title = ?, post_name = ?';
      params.push(title, slug);
    }
    if (content) {
      sql += ', post_content = ?';
      params.push(content);
    }
    if (status) {
      sql += ', post_status = ?';
      params.push(status);
    }

    // 2. Handle Image jika ada upload baru
    if (featuredImage) {
      const fileData = await saveFile(featuredImage, 'posts');
      if (fileData) {
        sql += ', featured_image_url = ?';
        params.push(fileData.url);
      }
    }

    const tagsString = getField('tags') || '';
    const tags = tagsString.split(',').map(t => t.trim()).filter(t => t !== '');

    sql += ' WHERE ID = ?';
    params.push(id);
    await db.query(sql, params);

    // 3. Update Kategori (Hapus relasi kategori lama saja)
    if (categories.length > 0) {
      // Ambil ID taxonomy yang tipenya 'category' untuk post ini
      await db.query(`
        DELETE FROM tbl_term_relationships 
        WHERE object_id = ? AND term_taxonomy_id IN (
          SELECT term_taxonomy_id FROM tbl_term_taxonomy WHERE taxonomy = 'category'
        )
      `, [id]);

      for (const catId of categories) {
        await db.query('INSERT IGNORE INTO tbl_term_relationships (object_id, term_taxonomy_id) VALUES (?, ?)', [id, catId]);
      }
    }

    // 4. Update Tags (Hapus relasi tag lama saja, lalu isi baru)
    if (tagsString !== '') {
       // Hapus relasi tag lama
       await db.query(`
        DELETE FROM tbl_term_relationships 
        WHERE object_id = ? AND term_taxonomy_id IN (
          SELECT term_taxonomy_id FROM tbl_term_taxonomy WHERE taxonomy = 'post_tag'
        )
      `, [id]);

      for (const tagName of tags) {
          const tagSlug = slugify(tagName);
          
          // Cari atau buat term
          let [termRows]: any = await db.query('SELECT term_id FROM tbl_terms WHERE slug = ?', [tagSlug]);
          let termId;
          
          if (termRows.length === 0) {
            const [newTerm]: any = await db.query('INSERT INTO tbl_terms (name, slug) VALUES (?, ?)', [tagName, tagSlug]);
            termId = newTerm.insertId;
          } else {
            termId = termRows[0].term_id;
          }

          // Cari atau buat taxonomy record
          let [taxRows]: any = await db.query('SELECT term_taxonomy_id FROM tbl_term_taxonomy WHERE term_id = ? AND taxonomy = "post_tag"', [termId]);
          let termTaxonomyId;

          if (taxRows.length === 0) {
            const [newTax]: any = await db.query('INSERT INTO tbl_term_taxonomy (term_id, taxonomy, description) VALUES (?, "post_tag", "")', [termId]);
            termTaxonomyId = newTax.insertId;
          } else {
            termTaxonomyId = taxRows[0].term_taxonomy_id;
          }

          // Simpan relasi
          await db.query('INSERT IGNORE INTO tbl_term_relationships (object_id, term_taxonomy_id) VALUES (?, ?)', [id, termTaxonomyId]);
      }
    }

    // 3. Sinkronisasi Galeri (Hapus yang tidak ada di list existing)
    if (existingPostsRaw !== undefined) {
      const existingPost: string[] = JSON.parse(existingPostsRaw);
      
      if (existingPost.length > 0) {
        const placeholders = existingPost.map(() => '?').join(',');
        await db.query(
          `DELETE FROM tbl_postmeta WHERE post_id = ? AND meta_key = 'post_image' AND meta_value NOT IN (${placeholders})`,
          [id, ...existingPost]
        );
      } else {
        // Jika kosong, hapus semua galeri untuk agenda ini
        await db.query(`DELETE FROM tbl_postmeta WHERE post_id = ? AND meta_key = 'post_image'`, [id]);
      }
    }

    // 4. Upload file galeri baru jika ada
    if (newPostFiles.length > 0) {
      for (const file of newPostFiles) {
        const fileData = await saveFile(file, 'berita');
        if (fileData?.url) {
          await db.query(`INSERT INTO tbl_postmeta (post_id, meta_key, meta_value) VALUES (?, 'post_image', ?)`, [id, fileData.url]);
        }
      }
    }
    return { status: 'success', message: 'Post updated successfully' };
  } catch (error: any) {
    console.error('Update Post Error:', error);
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
