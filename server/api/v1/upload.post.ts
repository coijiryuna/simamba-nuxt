export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event);
  if (!formData) throw createError({ statusCode: 400, statusMessage: 'No file uploaded' });

  const file = formData.find(f => f.name === 'file');
  if (!file) throw createError({ statusCode: 400, statusMessage: 'Field "file" is required' });

  const folderField = formData.find(f => f.name === 'folder');
  const folder = folderField ? folderField.data.toString() : 'general';

  // Pakai utility saveFile yang tadi sudah kita buat (otomatis resize/compress jadi WebP)
  const result = await saveFile(file, folder);

  if (!result) throw createError({ statusCode: 500, statusMessage: 'Gagal memproses gambar' });

  return { url: result.url };
});
