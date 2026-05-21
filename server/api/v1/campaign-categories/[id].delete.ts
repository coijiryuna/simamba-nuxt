export default defineEventHandler(async (event) => {
  const db = getByzisDb();
  const id = getRouterParam(event, 'id');

  try {
    await db.query('DELETE FROM tbl_categories WHERE id = ?', [id]);
    return { status: 'success' };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
