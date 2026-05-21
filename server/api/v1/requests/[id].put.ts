export default defineEventHandler(async (event) => {
  const db = getDb();
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);

  try {
    await db.query('UPDATE tbl_request SET request = ?, status = ? WHERE ID = ?', [body.request, body.status, id]);
    return { status: 'success' };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
