export default defineEventHandler(async (event) => {
  const db = getDb();
  const id = getRouterParam(event, 'id');

  try {
    // Note: Idealy we should check if there are existing submissions linked to this request
    await db.query('DELETE FROM tbl_request WHERE ID = ?', [id]);
    return { status: 'success' };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
