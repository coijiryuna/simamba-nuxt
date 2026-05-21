export default defineEventHandler(async (event) => {
  const db = getDb();
  const id = getRouterParam(event, 'id');

  try {
    await db.query('DELETE FROM tbl_links WHERE link_id = ?', [id]);
    return { status: 'success', message: 'Link deleted successfully' };
  } catch (error: any) {
    console.error('Delete Link Error:', error);
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
