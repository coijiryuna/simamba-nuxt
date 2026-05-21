export default defineEventHandler(async (event) => {
  const db = getDb();
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);

  if (!body || !body.status) {
    throw createError({ statusCode: 400, statusMessage: 'Status is required' });
  }

  try {
    await db.query('UPDATE tbl_submissions SET status = ? WHERE id = ?', [body.status, id]);
    return { status: 'success', message: `Submission status updated to ${body.status}` };
  } catch (error: any) {
    console.error('Update Submission Status Error:', error);
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
