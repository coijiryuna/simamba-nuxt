export default defineEventHandler(async (event) => {
  const user = verifyByzisToken(event);
  const db = getByzisDb();

  try {
    const [profiles]: any = await db.query('SELECT * FROM tbl_users WHERE id = ?', [user.id]);
    if (profiles.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Profil tidak ditemukan.' });
    }

    return {
      status: 'success',
      user: profiles[0]
    };
  } catch (error: any) {
    throw createError({ statusCode: error.statusCode || 500, statusMessage: error.message });
  }
});
