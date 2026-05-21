export default defineEventHandler(async (event) => {
  const db = getDb();
  const body = await readBody(event);
  const { id, status, notes } = body;

  if (!id || !status) {
    throw createError({ statusCode: 400, statusMessage: 'ID and Status are required' });
  }

  try {
    await db.query(
      'UPDATE tbl_submissions SET status = ?, notes = ? WHERE ID = ?',
      [status, notes || '', id]
    );

    return { status: 'success', message: `Submission ${status} successfully` };
  } catch (error: any) {
    console.error('Update Submission Status Error:', error);
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
