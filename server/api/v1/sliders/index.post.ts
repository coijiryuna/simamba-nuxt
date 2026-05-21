export default defineEventHandler(async (event) => {
  const db = getDb();
  const formData = await readMultipartFormData(event);
  
  if (!formData) {
    throw createError({ statusCode: 400, statusMessage: 'No form data found' });
  }

  const getField = (name: string) => formData.find(f => f.name === name)?.data.toString();
  const getFile = (name: string) => formData.find(f => f.name === name);

  const title = getField('title') || '';
  const caption = getField('caption') || '';
  const link_url = getField('link_url') || '';
  const display_order = parseInt(getField('display_order') || '0');
  const status = getField('status') || 'active';
  const image = getFile('image');

  if (!image) {
    throw createError({ statusCode: 400, statusMessage: 'Banner image is required' });
  }

  try {
    const fileData = await saveFile(image, 'sliders');
    if (!fileData) throw new Error('Failed to save file');

    await db.query(`
      INSERT INTO tbl_sliders (title, caption, image, image_url, link_url, display_order, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [title, caption, fileData.filename, fileData.url, link_url, display_order, status]);

    return { status: 'success', message: 'Slider banner uploaded successfully' };
  } catch (error: any) {
    console.error('Slider Upload Error:', error);
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
