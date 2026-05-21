
export default defineEventHandler(async (event) => {
  const db = getDb();
  const idOrSlug = getRouterParam(event, 'id');

  try {
    // Tentukan apakah mencari berdasarkan ID atau Slug
    const isId = !isNaN(Number(idOrSlug));
    const column = isId ? 'p.ID' : 'p.agenda_name';

    console.log(`Fetching agenda by ${isId ? 'ID' : 'Slug'}: ${idOrSlug}`);

    const [rows]: any = await db.query(`
      SELECT 
        p.*, p.agenda_name as slug,
        u.display_name as author
      FROM tbl_agendas p
      LEFT JOIN tbl_users u ON u.ID = p.agenda_author
      WHERE ${column} = ?
      LIMIT 1
    `, [idOrSlug]);

    if (rows.length === 0) {
      console.warn(`Agenda not found for ${column}: ${idOrSlug}`);
      throw createError({ statusCode: 404, statusMessage: 'Agenda not found' });
    }

    const agenda = rows[0];
    return agenda;
  } catch (error: any) {
    console.error('agenda Detail API Error:', error.message);
    throw createError({ statusCode: error.statusCode || 500, statusMessage: error.message });
  }
});
