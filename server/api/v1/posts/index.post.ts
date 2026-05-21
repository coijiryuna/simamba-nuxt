export default defineEventHandler(async (event) => {
  const db = getDb();
  const formData = await readMultipartFormData(event);
  
  if (!formData) {
    throw createError({ statusCode: 400, statusMessage: 'No form data found' });
  }

  // Helper untuk ambil field dari formData
  const getField = (name: string) => formData.find(f => f.name === name)?.data.toString();
  const getFile = (name: string) => formData.find(f => f.name === name);

  const title = getField('post_title') || '';
  const content = getField('post_content') || '';
  const status = getField('post_status') || 'draft';
  const post_type = getField('post_type') || 'post';
    const categories = getField('categories')?.split(',') || [];
    const tagsString = getField('tags') || '';
    const tags = tagsString.split(',').map(t => t.trim()).filter(t => t !== '');

    const slug = slugify(title);

    // Cek duplikasi judul atau slug
    const [existing]: any = await db.query('SELECT ID FROM tbl_posts WHERE post_title = ? OR post_name = ?', [title, slug]);
    if (existing.length > 0) {
      throw createError({ statusCode: 400, statusMessage: 'Judul atau Slug berita ini sudah digunakan' });
    }

    const featuredImage = getFile('featured_image');
    let imageUrl = '';

    try {
      // 1. Upload Gambar jika ada
      if (featuredImage) {
        const fileData = await saveFile(featuredImage, 'posts');
        imageUrl = fileData?.url || '';
      }

      const session = await getUserSession(event)
      const authorId = (session.user as any)?.id || 1

      // 2. Insert ke tbl_posts
      const [result]: any = await db.query(`
        INSERT INTO tbl_posts 
          (post_title, post_name, post_content, post_status, post_type, post_author, featured_image_url, post_date, post_modified)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [title, slug, content, status, post_type, authorId, imageUrl]);

      const postId = result.insertId;

      // 3. Simpan Relasi Kategori
      if (categories.length > 0) {
        for (const catId of categories) {
          if (catId) {
            await db.query('INSERT INTO tbl_term_relationships (object_id, term_taxonomy_id) VALUES (?, ?)', [postId, catId]);
          }
        }
      }

      // 4. Simpan Relasi Tags (WordPress Style)
      if (tags.length > 0) {
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
          await db.query('INSERT IGNORE INTO tbl_term_relationships (object_id, term_taxonomy_id) VALUES (?, ?)', [postId, termTaxonomyId]);
          
          // Update hitungan (count)
          await db.query('UPDATE tbl_term_taxonomy SET count = count + 1 WHERE term_taxonomy_id = ?', [termTaxonomyId]);
        }
      }

    return {
      status: 'success',
      message: 'Post created successfully',
      id: postId
    };
  } catch (error: any) {
    console.error('Create Post Error:', error);
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
