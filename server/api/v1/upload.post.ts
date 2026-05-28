export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event);
  if (!formData)
    throw createError({ statusCode: 400, statusMessage: "No file uploaded" });

  const file = formData.find((f) => f.name === "file");
  if (!file)
    throw createError({
      statusCode: 400,
      statusMessage: 'Field "file" is required',
    });

  const folderField = formData.find((f) => f.name === "folder");
  const folder = folderField ? folderField.data.toString() : "general";

  const convertWebpField = formData.find((f) => f.name === "convertWebp");
  const shouldConvert = convertWebpField
    ? convertWebpField.data.toString() !== "no"
    : true;

  try {
    const result = await saveFile(file, folder, shouldConvert);

    if (!result || !result.url) {
      throw new Error("Proses simpan file gagal atau response tidak valid");
    }
    return { url: result.url };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Gagal memproses gambar pada server",
    });
  }
});
