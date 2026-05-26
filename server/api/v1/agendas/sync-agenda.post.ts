import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { getUploadBaseDir } from "../../../utils/upload";

const entities: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ldquo: "\u201c",
  rdquo: "\u201d",
  lsquo: "\u2018",
  rsquo: "\u2019",
  ndash: "\u2013",
  mdash: "\u2014",
  hellip: "\u2026",
  middot: "\u00b7",
  copy: "\u00a9",
  reg: "\u00ae",
  trade: "\u2122",
  deg: "\u00b0",
  plusmn: "\u00b1",
  para: "\u00b6",
};

function decodeHtmlEntities(str: string): string {
  if (!str) return "";
  return str.replace(
    /&(#(?:\d+|x[a-fA-F0-9]+)|[a-zA-Z0-9]+);/g,
    (match, entity) => {
      if (entity.startsWith("#")) {
        const code = entity.startsWith("#x")
          ? parseInt(entity.substring(2), 16)
          : parseInt(entity.substring(1), 10);
        return isNaN(code) ? match : String.fromCharCode(code);
      }
      return entities[entity.toLowerCase()] || match;
    },
  );
}

export default defineEventHandler(async (event) => {
  // Hanya admin/pengguna terautentikasi yang boleh mengakses endpoint ini
  const session = await getUserSession(event);
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const config = useRuntimeConfig();
  const simbaBase = config.simbaUrl;
  const org = config.simbaOrg;
  const key = config.simbaKey;

  if (!simbaBase || !org || !key) {
    throw createError({
      statusCode: 500,
      statusMessage:
        "SIMBA API Base atau Org atau Key belum dikonfigurasi di server",
    });
  }

  const db = getDb();
  let syncedCount = 0;
  const errors: string[] = [];

  try {
    // 1. Ambil list agendas dari SIMBA
    // hal per 20 agendas
    let page = 1;
    let limit = 20;

    // Parse page and limit from query parameters (?page=X&limit=Y)
    const query = getQuery(event);
    if (query) {
      if (query.page) page = Math.max(1, parseInt(String(query.page), 10) || 1);
      if (query.limit)
        limit = Math.max(1, parseInt(String(query.limit), 10) || 20);
    }

    // Parse page and limit from request body if it is a agenda request
    if (event.node.req.method === "POST") {
      try {
        const body = await readBody(event);
        if (body) {
          if (body.page)
            page = Math.max(1, parseInt(String(body.page), 10) || page);
          if (body.limit)
            limit = Math.max(1, parseInt(String(body.limit), 10) || limit);
        }
      } catch (e) {
        // Ignored: empty or non-JSON body
      }
    }

    const listUrl = `${simbaBase}/api2/agenda_list?org=${org}&key=${encodeURIComponent(key)}&hal=${page}`;
    const listResponse = await $fetch<any>(listUrl);

    if (
      !listResponse ||
      listResponse.status !== "Sukses" ||
      !Array.isArray(listResponse.list)
    ) {
      throw createError({
        statusCode: 500,
        statusMessage: `Gagal mengambil daftar agendas dari SIMBA. Response: ${JSON.stringify(listResponse)}`,
      });
    }

    const newsList = listResponse.list;
    // Potong list agendas berdasarkan limit yang ditentukan oleh user di admin dashboard
    const processedList = newsList.slice(0, limit);

    for (const item of processedList) {
      if (!item.id) continue;

      // 2. Cek apakah sudah disinkronkan sebelumnya berdasarkan id_simba
      const [existing]: any = await db.query(
        'SELECT agenda_id FROM tbl_agendameta WHERE meta_key = "id_simba" AND meta_value = ?',
        [String(item.id)],
      );

      if (existing.length > 0) {
        // Sudah ada, lewati
        continue;
      }

      // 3. Ambil detail agenda dari SIMBA
      const detailUrl = `${simbaBase}/api2/agenda_detail?org=${org}&key=${encodeURIComponent(key)}&idx=${item.id}`;
      const detailResponse = await $fetch<any>(detailUrl);

      if (
        !detailResponse ||
        detailResponse.status !== "Sukses" ||
        !detailResponse.detail
      ) {
        errors.push(`Gagal mengambil detail agenda ID ${item.id}`);
        continue;
      }

      const agendaDetail = detailResponse.detail;

      // Mulai transaksi untuk agenda ini
      const connection = await db.getConnection();
      try {
        await connection.beginTransaction();

        // 4. Download gambar(s) dan simpan ke lokal dikonversi ke WebP
        //    - API bisa mengembalikan string (single url) atau array of objects
        //    - Pilih gambar dengan `jenis === 'utama'` sebagai featured, fallback ke pertama
        //    - Simpan semua gambar yang berhasil diproses ke folder uploads/agendas
        let featuredImageUrl = "";
        let featuredImage = "";
        const galleryImages: { filename: string; url: string; jenis?: string }[] = [];

        const imagesRaw = Array.isArray(agendaDetail.gambar)
          ? agendaDetail.gambar
          : agendaDetail.gambar
          ? [agendaDetail.gambar]
          : [];

        if (imagesRaw.length > 0) {
          // Pastikan upload dir ada
          const uploadBaseDir = getUploadBaseDir();
          const uploadDir = path.join(uploadBaseDir, "agendas");
          await fs.mkdir(uploadDir, { recursive: true });

          // Proses gambar satu per satu (bisa diubah ke Promise.allSettled dengan limit jika perlu)
          for (const imgItem of imagesRaw) {
            // imgItem bisa berupa string URL atau object { gambar: url, jenis }
            const imageUrlSrc = typeof imgItem === "string" ? imgItem : imgItem?.gambar || null;
            const jenis = typeof imgItem === "object" && imgItem ? imgItem.jenis : undefined;
            if (!imageUrlSrc) continue;

            try {
              const imageBuffer = await $fetch<ArrayBuffer>(imageUrlSrc, { responseType: "arrayBuffer" });
              const buffer = Buffer.from(imageBuffer);

              const baseName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
              const fileName = `${baseName}.webp`;
              const filePath = path.join(uploadDir, fileName);

              await sharp(buffer).webp({ quality: 80 }).toFile(filePath);

              const fileUrl = `/uploads/agendas/${fileName}`;
              galleryImages.push({ filename: fileName, url: fileUrl, jenis });
            } catch (imgErr: any) {
              console.error(`Gagal memproses gambar untuk agenda ID ${item.id}:`, imgErr);
              // lanjutkan tanpa gagal seluruh proses
            }
          }

          // Tentukan featured image: cari `jenis === 'utama'`, kalau tidak pakai index 0
          const primaryIndex = galleryImages.findIndex((g) => g.jenis === "utama");
          const primary = galleryImages[primaryIndex !== -1 ? primaryIndex : 0];
          if (primary) {
            featuredImage = primary.filename;
            featuredImageUrl = primary.url;
          }
        }

        // Tentukan tipe agenda berdasarkan kategori
        let agendaType = "pimpinan";

        // Tentukan tanggal rilis agendas
        let agendaDate = new Date();
        if (agendaDetail.tanggal) {
          const parts = agendaDetail.tanggal.split("/");
          if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            const dateObj = new Date(year, month, day, 12, 0, 0);
            if (!isNaN(dateObj.getTime())) {
              agendaDate = dateObj;
            }
          }
        }

        // Dekode HTML Content
        const decodedContent = decodeHtmlEntities(agendaDetail.berita || "");
        const slug = agendaDetail.slug
          ? slugify(agendaDetail.slug)
          : slugify(agendaDetail.judul);

        // Cari ID Author
        const authorId = (session.user as any)?.id || 1;

        // 5. Simpan ke tbl_agendas
        const [agendaResult]: any = await connection.query(
          `
          INSERT INTO tbl_agendas 
            (agenda_author, agenda_date, agenda_date_gmt, agenda_content, agenda_title, agenda_excerpt, agenda_status, agenda_name, featured_image, featured_image_url, agenda_modified, agenda_modified_gmt, agenda_type, to_ping, pinged, agenda_content_filtered, guid)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [
            authorId,
            agendaDate,
            agendaDate,
            decodedContent,
            agendaDetail.judul || "",
            agendaDetail.abstrak || "",
            "publish",
            slug,
            featuredImage || null,
            featuredImageUrl || null,
            new Date(),
            new Date(),
            agendaType,
            "", // to_ping
            "", // pinged
            "", // agenda_content_filtered
            "", // guid
          ],
        );

        const agendaId = agendaResult.insertId;

        // 6. Simpan meta data id_simba di tbl_agendameta
        await connection.query(
          `
          INSERT INTO tbl_agendameta (agenda_id, meta_key, meta_value)
          VALUES (?, 'id_simba', ?)
        `,
          [agendaId, String(item.id)],
        );

        // Simpan gallery images (jika ada) sebagai meta entries
        if (galleryImages && galleryImages.length > 0) {
          for (const g of galleryImages) {
            try {
              await connection.query(
                `INSERT INTO tbl_agendameta (agenda_id, meta_key, meta_value) VALUES (?, 'gallery_image', ?)`,
                [agendaId, g.url],
              );
            } catch (metaErr: any) {
              console.error('Gagal menyimpan gallery image meta:', metaErr);
            }
          }
        }



        await connection.commit();
        syncedCount++;
      } catch (err: any) {
        await connection.rollback();
        console.error(`Gagal memproses agendas ID ${item.id}:`, err);
        errors.push(`Gagal memproses agendas ID ${item.id}: ${err.message}`);
      } finally {
        connection.release();
      }
    }

    return {
      status: "success",
      syncedCount,
      errors,
    };
  } catch (error: any) {
    console.error("SIMBA Sync Error:", error);
    throw createError({
      statusCode: 500,
      statusMessage:
        error.message || "Terjadi kesalahan sistem saat melakukan sinkronisasi",
    });
  }
});
