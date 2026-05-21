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

export const saveFile = async (file: any, folder = 'posts') => {
  if (!file || !file.data) return null;

  // Nama file selalu akhiri dengan .webp
  const baseName = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
  const fileName = `${baseName}.webp`;
  
  const uploadDir = path.join(getUploadBaseDir(), folder);
  await fs.mkdir(uploadDir, { recursive: true });
  
  const filePath = path.join(uploadDir, fileName);

  // Proses konversi ke WebP pakai Sharp
  await sharp(file.data)
    .webp({ quality: 80 })
    .toFile(filePath);
  
  return {
    filename: fileName,
    url: `/uploads/${folder}/${fileName}`
  };
};
