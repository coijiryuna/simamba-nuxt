import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { getUploadBaseDir } from '../../../utils/upload';

const entities: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'",
  nbsp: ' ', ldquo: '\u201c', rdquo: '\u201d', lsquo: '\u2018', rsquo: '\u2019',
  ndash: '\u2013', mdash: '\u2014', hellip: '\u2026', middot: '\u00b7',
  copy: '\u00a9', reg: '\u00ae', trade: '\u2122', deg: '\u00b0',
  plusmn: '\u00b1', para: '\u00b6'
};

function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str.replace(/&(#(?:\d+|x[a-fA-F0-9]+)|[a-zA-Z0-9]+);/g, (match, entity) => {
    if (entity.startsWith('#')) {
      const code = entity.startsWith('#x')
        ? parseInt(entity.substring(2), 16)
        : parseInt(entity.substring(1), 10);
      return isNaN(code) ? match : String.fromCharCode(code);
    }
    return entities[entity.toLowerCase()] || match;
  });
}

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

  try {
    // 1. Ambil list berita dari SIMBA
    // hal per 20 berita
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

    const listUrl = `${simbaBase}/api2/news_list?org=${org}&key=${encodeURIComponent(key)}&hal=${page}`;
    const listResponse = await $fetch<any>(listUrl);

    if (!listResponse || listResponse.status !== 'Sukses' || !Array.isArray(listResponse.list)) {
      throw createError({
        statusCode: 500,
        statusMessage: `Gagal mengambil daftar berita dari SIMBA. Response: ${JSON.stringify(listResponse)}`
      });
    }

    const newsList = listResponse.list;
    // Potong list berita berdasarkan limit yang ditentukan oleh user di admin dashboard
    const processedList = newsList.slice(0, limit);

    for (const item of processedList) {
      if (!item.id) continue;

      // 2. Cek apakah sudah disinkronkan sebelumnya berdasarkan id_simba
      const [existing]: any = await db.query(
        'SELECT post_id FROM tbl_postmeta WHERE meta_key = "id_simba" AND meta_value = ?',
        [String(item.id)]
      );

      if (existing.length > 0) {
        // Sudah ada, lewati
        continue;
      }

      // 3. Ambil detail berita dari SIMBA
      const detailUrl = `${simbaBase}/api2/news_detail?org=${org}&key=${encodeURIComponent(key)}&idx=${item.id}`;
      const detailResponse = await $fetch<any>(detailUrl);

      if (!detailResponse || detailResponse.status !== 'Sukses' || !detailResponse.detail) {
        errors.push(`Gagal mengambil detail berita ID ${item.id}`);
        continue;
      }

      const newsDetail = detailResponse.detail;

      // Mulai transaksi untuk berita ini
      const connection = await db.getConnection();
      try {
        await connection.beginTransaction();

        // 4. Download gambar dan simpan ke lokal dikonversi ke WebP
        let featuredImageUrl = '';
        let featuredImage = '';

        if (newsDetail.gambar) {
          try {
            const imageBuffer = await $fetch<ArrayBuffer>(newsDetail.gambar, {
              responseType: 'arrayBuffer'
            });
            const buffer = Buffer.from(imageBuffer);

            const baseName = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
            const fileName = `${baseName}.webp`;

            // Gunakan UPLOAD_DIR jika tersedia (production), fallback ke public/uploads
            // Di production, set UPLOAD_DIR=/home/www/baznas/uploads (di luar .output/)
            // Kemudian konfigurasi Nginx: location /uploads { alias /home/www/baznas/uploads/; }
            const uploadBaseDir = getUploadBaseDir();
            const uploadDir = path.join(uploadBaseDir, 'berita');

            // Buat folder jika belum ada
            await fs.mkdir(uploadDir, { recursive: true });

            const filePath = path.join(uploadDir, fileName);

            // Konversi ke WebP
            await sharp(buffer)
              .webp({ quality: 80 })
              .toFile(filePath);

            featuredImageUrl = `/uploads/berita/${fileName}`;
            featuredImage = fileName;
          } catch (imgErr: any) {
            console.error(`Gagal memproses gambar untuk berita ID ${item.id}:`, imgErr);
            // Tetap lanjut tanpa gambar jika gagal memproses gambar
          }
        }

        // Tentukan tipe post berdasarkan kategori
        let postType = 'post';
        if (newsDetail.kategori === 'artikel') {
          postType = 'article';
        }

        // Tentukan tanggal rilis berita
        let postDate = new Date();
        if (newsDetail.tanggal) {
          const parts = newsDetail.tanggal.split('/');
          if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            const dateObj = new Date(year, month, day, 12, 0, 0);
            if (!isNaN(dateObj.getTime())) {
              postDate = dateObj;
            }
          }
        }

        // Dekode HTML Content
        const decodedContent = decodeHtmlEntities(newsDetail.deskripsi || '');
        const slug = newsDetail.slug ? slugify(newsDetail.slug) : slugify(newsDetail.judul);

        // Cari ID Author
        const authorId = (session.user as any)?.id || 1;

        // 5. Simpan ke tbl_posts
        const [postResult]: any = await connection.query(`
          INSERT INTO tbl_posts 
            (post_author, post_date, post_date_gmt, post_content, post_title, post_excerpt, post_status, post_name, featured_image, featured_image_url, post_modified, post_modified_gmt, post_type, to_ping, pinged, post_content_filtered, guid)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          authorId,
          postDate,
          postDate,
          decodedContent,
          newsDetail.judul || '',
          newsDetail.abstrak || '',
          'publish',
          slug,
          featuredImage || null,
          featuredImageUrl || null,
          new Date(),
          new Date(),
          postType,
          '', // to_ping
          '', // pinged
          '', // post_content_filtered
          ''  // guid
        ]);

        const postId = postResult.insertId;

        // 6. Simpan meta data id_simba di tbl_postmeta
        await connection.query(`
          INSERT INTO tbl_postmeta (post_id, meta_key, meta_value)
          VALUES (?, 'id_simba', ?)
        `, [postId, String(item.id)]);

        // 7. Simpan relasi kategori
        const catName = newsDetail.kategori || 'Berita';
        const catSlug = slugify(catName);

        // Cari atau buat term kategori
        let [catTermRows]: any = await connection.query('SELECT term_id FROM tbl_terms WHERE slug = ?', [catSlug]);
        let catTermId;
        if (catTermRows.length === 0) {
          const [newTerm]: any = await connection.query('INSERT INTO tbl_terms (name, slug) VALUES (?, ?)', [catName, catSlug]);
          catTermId = newTerm.insertId;
        } else {
          catTermId = catTermRows[0].term_id;
        }

        // Cari atau buat taxonomy record kategori
        let [catTaxRows]: any = await connection.query('SELECT term_taxonomy_id FROM tbl_term_taxonomy WHERE term_id = ? AND taxonomy = "category"', [catTermId]);
        let catTaxonomyId;
        if (catTaxRows.length === 0) {
          const [newTax]: any = await connection.query('INSERT INTO tbl_term_taxonomy (term_id, taxonomy, description) VALUES (?, "category", "")', [catTermId]);
          catTaxonomyId = newTax.insertId;
        } else {
          catTaxonomyId = catTaxRows[0].term_taxonomy_id;
        }

        // Simpan relasi kategori
        await connection.query('INSERT IGNORE INTO tbl_term_relationships (object_id, term_taxonomy_id) VALUES (?, ?)', [postId, catTaxonomyId]);

        // 8. Simpan relasi tags
        if (newsDetail.tag) {
          const tags = newsDetail.tag.split(',').map((t: string) => t.trim()).filter((t: string) => t !== '');
          for (const tagName of tags) {
            const tagSlug = slugify(tagName);

            // Cari atau buat term tag
            let [tagTermRows]: any = await connection.query('SELECT term_id FROM tbl_terms WHERE slug = ?', [tagSlug]);
            let tagTermId;
            if (tagTermRows.length === 0) {
              const [newTerm]: any = await connection.query('INSERT INTO tbl_terms (name, slug) VALUES (?, ?)', [tagName, tagSlug]);
              tagTermId = newTerm.insertId;
            } else {
              tagTermId = tagTermRows[0].term_id;
            }

            // Cari atau buat taxonomy record tag
            let [tagTaxRows]: any = await connection.query('SELECT term_taxonomy_id FROM tbl_term_taxonomy WHERE term_id = ? AND taxonomy = "post_tag"', [tagTermId]);
            let tagTaxonomyId;
            if (tagTaxRows.length === 0) {
              const [newTax]: any = await connection.query('INSERT INTO tbl_term_taxonomy (term_id, taxonomy, description) VALUES (?, "post_tag", "")', [tagTermId]);
              tagTaxonomyId = newTax.insertId;
            } else {
              tagTaxonomyId = tagTaxRows[0].term_taxonomy_id;
            }

            // Simpan relasi tag
            await connection.query('INSERT IGNORE INTO tbl_term_relationships (object_id, term_taxonomy_id) VALUES (?, ?)', [postId, tagTaxonomyId]);

            // Update tag count
            await connection.query('UPDATE tbl_term_taxonomy SET count = count + 1 WHERE term_taxonomy_id = ?', [tagTaxonomyId]);
          }
        }

        await connection.commit();
        syncedCount++;
      } catch (err: any) {
        await connection.rollback();
        console.error(`Gagal memproses berita ID ${item.id}:`, err);
        errors.push(`Gagal memproses berita ID ${item.id}: ${err.message}`);
      } finally {
        connection.release();
      }
    }

    return {
      status: 'success',
      syncedCount,
      errors
    };
  } catch (error: any) {
    console.error('SIMBA Sync Error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Terjadi kesalahan sistem saat melakukan sinkronisasi'
    });
  }
});
