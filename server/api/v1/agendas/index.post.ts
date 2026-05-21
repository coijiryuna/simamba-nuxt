export default defineEventHandler(async (event) => {
  const db = getDb();
  const formData = await readMultipartFormData(event);

  if (!formData) {
    throw createError({ statusCode: 400, statusMessage: 'No form data found' });
  }

  // Helper untuk ambil field dari formData
  const getField = (name: string) => formData.find(f => f.name === name)?.data.toString();
  const getFile = (name: string) => formData.find(f => f.name === name);

  const title = getField('agenda_title') || '';
  const content = getField('agenda_content') || '';
  const status = getField('agenda_status') || 'draft';
  const agenda_type = getField('agenda_type') || 'agenda';

  const slug = slugify(title);

  // Cek duplikasi judul atau slug
  const [existing]: any = await db.query('SELECT ID FROM tbl_agendas WHERE agenda_title = ? OR agenda_name = ?', [title, slug]);
  if (existing.length > 0) {
    throw createError({ statusCode: 400, statusMessage: 'Judul atau Slug agenda ini sudah digunakan' });
  }

  const featuredImage = getFile('featured_image');
  let imageUrl = '';

  try {
    // 1. Upload Gambar jika ada
    if (featuredImage) {
      console.log('featuredImage received:', featuredImage.filename, featuredImage.type);
      const fileData = await saveFile(featuredImage, 'agendas');
      if (fileData) {
        imageUrl = fileData?.url || '';
        console.log('Image saved successfully:', imageUrl);
      } else {
        console.log('saveFile returned null/undefined');
      }
    } else {
      console.log('No featuredImage received');
    }

    const session = await getUserSession(event)
    const authorId = (session.user as any)?.id || 1

    // 2. Insert ke tbl_agendas
    const [result]: any = await db.query(`
        INSERT INTO tbl_agendas 
          (agenda_title, agenda_name, agenda_content, agenda_status, agenda_type, agenda_author, featured_image_url, agenda_date, agenda_modified)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [title, slug, content, status, agenda_type, authorId, imageUrl]);

    const agendaId = result.insertId;

    return {
      status: 'success',
      message: 'agenda created successfully',
      id: agendaId
    };
  } catch (error: any) {
    console.error('Create agenda Error:', error);
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
