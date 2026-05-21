export default defineEventHandler(async (event) => {
  const db = getDb();
  const body = await readBody(event);

  if (!body.request) throw createError({ statusCode: 400, statusMessage: 'Nama bantuan wajib diisi' });

  try {
    const [result]: any = await db.query('INSERT INTO tbl_request (request, status) VALUES (?, ?)', [body.request, body.status || 1]);
    return { status: 'success', id: result.insertId };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
