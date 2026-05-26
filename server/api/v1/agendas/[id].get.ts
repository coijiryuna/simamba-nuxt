
export default defineEventHandler(async (event) => {
  const db = getDb();
  const idOrSlug = getRouterParam(event, 'id');

  try {
    // Tentukan apakah mencari berdasarkan ID atau Slug
    const isId = !isNaN(Number(idOrSlug));
    const column = isId ? 'p.ID' : 'p.agenda_name';

    console.log(`Fetching agenda by ${isId ? 'ID' : 'Slug'}: ${idOrSlug}`);

    const [rows]: any = await db.query(
      `
      SELECT 
        p.*, p.agenda_name as slug,
        u.display_name as author,
        -- Ambil semua gambar galeri dari tbl_agendameta dan gabungkan dengan separator |
        (
          SELECT GROUP_CONCAT(meta_value SEPARATOR '|')
          FROM tbl_agendameta m
          WHERE m.agenda_id = p.ID AND m.meta_key = 'gallery_image'
        ) as gallery_images
      FROM tbl_agendas p
      LEFT JOIN tbl_users u ON u.ID = p.agenda_author
      WHERE ${column} = ?
      LIMIT 1
    `,
      [idOrSlug],
    );

    if (rows.length === 0) {
      console.warn(`Agenda not found for ${column}: ${idOrSlug}`);
      throw createError({ statusCode: 404, statusMessage: "Agenda not found" });
    }

    const agenda = rows[0];

    // Ubah string separator | menjadi array agar bisa di-loop di frontend
    if (agenda.gallery_images && typeof agenda.gallery_images === "string") {
      agenda.gallery_images = agenda.gallery_images.split("|").filter(Boolean);
    } else {
      agenda.gallery_images = [];
    }

    return agenda;
  } catch (error: any) {
    console.error('agenda Detail API Error:', error.message);
    throw createError({ statusCode: error.statusCode || 500, statusMessage: error.message });
  }
});
