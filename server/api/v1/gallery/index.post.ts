export default defineEventHandler(async (event) => {
  const db = getDb();
  const formData = await readMultipartFormData(event);
  
  if (!formData) {
    throw createError({ statusCode: 400, statusMessage: 'No form data found' });
  }

  const getField = (name: string) => formData.find(f => f.name === name)?.data.toString();
  const getFile = (name: string) => formData.find(f => f.name === name);

  const caption = getField('caption') || '';
  const category = getField('category') || 'Umum';
  const description = getField('description') || '';
  const image = getFile('image');

  if (!image) {
    throw createError({ statusCode: 400, statusMessage: 'Image is required' });
  }

  try {
    const fileData = await saveFile(image, 'gallery');
    if (!fileData) throw new Error('Failed to save file');
    
    const slug = slugify(caption);

    await db.query(`
      INSERT INTO tbl_galery (caption, category, description, images, images_url, slug)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [caption, category, description, fileData.filename, fileData.url, slug]);

    return { status: 'success', message: 'Gallery image uploaded successfully' };
  } catch (error: any) {
    console.error('Gallery Upload Error:', error);
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
