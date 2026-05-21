export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event);
  if (!formData) throw createError({ statusCode: 400, statusMessage: 'No file uploaded' });

  const file = formData.find(f => f.name === 'image');
  if (!file) throw createError({ statusCode: 400, statusMessage: 'Field "image" is required' });

  // Pakai utility saveFile yang tadi sudah kita update (otomatis jadi WebP)
  const url = await saveFile(file, 'editor');

  return { url };
});
