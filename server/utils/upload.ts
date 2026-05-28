import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

/**
 * Resolve direktori upload:
 * - Production: gunakan UPLOAD_DIR (env var) yang menunjuk ke path absolut
 *   di luar .output/, misalnya /home/www/baznas/uploads
 *   Kemudian konfigurasikan Nginx: location /uploads { alias /home/www/baznas/uploads/; }
 * - Development: fallback ke public/uploads relative dari CWD
 */
export const getUploadBaseDir = () => {
  const config = useRuntimeConfig();
  const uploadDir = config.uploadDir || process.env.UPLOAD_DIR || process.env.NUXT_UPLOAD_DIR;
  if (uploadDir) {
    return uploadDir;
  }
  return path.join(process.cwd(), 'public/uploads');
};

export const saveFile = async (
  file: any,
  folder: string = "posts",
  shouldConvert: boolean = true,
) => {
  if (!file || !file.data) return null;

  const baseName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

  // Tentukan ekstensi: jika tidak convert, ambil dari file asli, default ke png
  const originalExt = file.filename
    ? path.extname(file.filename).slice(1)
    : "png";
  const extension = shouldConvert ? "webp" : originalExt;
  const fileName = `${baseName}.${extension}`;

  const uploadDir = path.join(getUploadBaseDir(), folder);
  await fs.mkdir(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, fileName);
  let pipeline = sharp(file.data);

  if (shouldConvert) {
    pipeline = pipeline.webp({ quality: 80 });
  } else {
    // Jika tidak convert ke webp, pastikan sharp tetap memproses ke format aslinya
    pipeline = pipeline.toFormat(extension as any);
  }

  // Simpan file. Sharp akan otomatis menyesuaikan format berdasarkan ekstensi di filePath
  await pipeline.toFile(filePath);

  return {
    filename: fileName,
    url: `/uploads/${folder}/${fileName}`,
  };
};
