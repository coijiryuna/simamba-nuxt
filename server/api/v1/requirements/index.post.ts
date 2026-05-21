export default defineEventHandler(async (event) => {
  const db = getDb();
  const body = await readBody(event);

  if (!body.request_id || !body.requirements) {
    throw createError({ statusCode: 400, statusMessage: 'Request ID dan Persyaratan wajib diisi' });
  }

  try {
    const [result]: any = await db.query(
      'INSERT INTO tbl_requirements (request_id, requirements, status, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())', 
      [body.request_id, body.requirements, body.status || 1]
    );
    return { status: 'success', id: result.insertId };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
