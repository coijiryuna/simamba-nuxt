import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { getUploadBaseDir } from '../../../utils/upload';
export default defineEventHandler(async (event) => {
  // Hanya admin/pengguna terautentikasi yang boleh mengakses endpoint ini
  const session = await getUserSession(event);
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const config = useRuntimeConfig();
  const simbaBase = config.simbaUrl;
  const org = config.simbaOrg;
  const key = config.simbaKey;

  if (!simbaBase || !org || !key) {
    throw createError({
      statusCode: 500,
      statusMessage: 'SIMBA API Base atau Org atau Key belum dikonfigurasi di server'
    });
  }

  const db = getDb();
  let syncedCount = 0;
  const errors: string[] = [];

  try{
    let page = 1;
    let limit = 20;

    // Parse page and limit from query parameters (?page=X&limit=Y)
    const query = getQuery(event);
    if (query) {
      if (query.page) page = Math.max(1, parseInt(String(query.page), 10) || 1);
      if (query.limit) limit = Math.max(1, parseInt(String(query.limit), 10) || 20);
    }

    // Parse page and limit from request body if it is a POST request
    if (event.node.req.method === 'POST') {
      try {
        const body = await readBody(event);
        if (body) {
          if (body.page) page = Math.max(1, parseInt(String(body.page), 10) || page);
          if (body.limit) limit = Math.max(1, parseInt(String(body.limit), 10) || limit);
        }
      } catch (e) {
        // Ignored: empty or non-JSON body
      }
    }

    // Ambil daftar banner dari SIMBA
    const listUrl = `${simbaBase}/api2/banner_list?org=${org}&key=${encodeURIComponent(key)}&tipe=banner`;
    const listResponse = await $fetch<any>(listUrl);
    if (!listResponse || listResponse.status !== 'Sukses' || !Array.isArray(listResponse.list)) {
      throw createError({
        statusCode: 500,
        statusMessage: `Gagal mengambil daftar banner dari SIMBA. Response: ${JSON.stringify(listResponse)}`
      });
    }

    const bannerList = listResponse.list;
    // Potong list banner berdasarkan halaman dan limit yang ditentukan oleh user di admin dashboard
    const processedList = bannerList.slice(0, limit);
    
    for (let idx = 0; idx < processedList.length; idx++) {
      const item = processedList[idx];
      if (!item.id) continue;
      
      try {
        // Cek apakah sudah disinkronkan sebelumnya berdasarkan id_simba
        const [existing]: any = await db.query(
          'SELECT slider_id FROM tbl_slidermeta WHERE meta_key = "id_simba" AND meta_value = ?',
          [String(item.id)]
        );

        if (existing.length > 0) {
          // Sudah ada, lewati
          continue;
        }

        // Download dan convert gambar ke WebP
        let localImagePath = null;
        let namefile = null;
        if (item.gambar) {
          try {
            const imageUrl = item.gambar;
            const uploadBaseDir = getUploadBaseDir();
            const slidersDir = path.join(uploadBaseDir, 'sliders');
            
            // Buat folder jika belum ada
            await fs.mkdir(slidersDir, { recursive: true });
            
            // Generate filename unik
            const timestamp = Date.now();
            const filename = `slider-${item.id}-${timestamp}.webp`;
            const localPath = path.join(slidersDir, filename);
            
            // Download image
            const imageBuffer = await $fetch<Buffer>(imageUrl, {
              responseType: 'arrayBuffer'
            });
            
            // Convert ke WebP menggunakan sharp
            await sharp(imageBuffer)
              .webp({ quality: 80 })
              .toFile(localPath);
            
            localImagePath = `/uploads/sliders/${filename}`;
            namefile = filename
            console.log(`✓ Image downloaded & converted: ${filename}`);
          } catch (imgErr) {
            console.error(`✗ Failed to download image for banner ${item.id}:`, (imgErr as Error).message);
            errors.push(`Banner ${item.id}: Gagal download gambar - ${(imgErr as Error).message}`);
            // Continue tanpa gambar
          }
        }

        // Insert ke tbl_sliders
        const title = item.headlines ? `Banner ${item.id}` : `Banner ${item.id}`;
        const caption = item.tag || '';
        const linkUrl = item.url || '';
        const status = item.status === 'publish' ? 'active' : 'inactive';
        const displayOrder = idx; // Urutan dari list

        const [sliderResult]: any = await db.query(
          `INSERT INTO tbl_sliders (title, caption, image_url, image, link_url, display_order, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [title, caption, localImagePath, namefile, linkUrl, displayOrder, status]
        );

        const sliderId = sliderResult.insertId;

        // Insert metadata (id_simba)
        await db.query(
          `INSERT INTO tbl_slidermeta (slider_id, meta_key, meta_value)
           VALUES (?, ?, ?)`,
          [sliderId, 'id_simba', String(item.id)]
        );

        syncedCount++;
        console.log(`✓ Banner ${item.id} synced (slider_id: ${sliderId})`);

      } catch (itemErr) {
        console.error(`✗ Error syncing banner ${item.id}:`, (itemErr as Error).message);
        errors.push(`Banner ${item.id}: ${(itemErr as Error).message}`);
      }
    }

    return {
      status: "success",
      syncedCount,
      errors,
    };

  }catch (error) {
    return {
      success: false,
      message: `Gagal sinkronisasi dengan SIMBA: ${(error as Error).message}`,
    };
  }

});