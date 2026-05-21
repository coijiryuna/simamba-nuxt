export default defineEventHandler(async (event) => {
  const db = getDb();
  const query = getQuery(event);

  const status = query.status as string;
  const requestId = query.request_id as string;
  const search = query.search as string;

  try {
    let sql = `
      SELECT 
        s.ID, 
        s.submission_uid, 
        s.submission_date, 
        s.status,
        a.fullname as applicant_name, 
        r.request as request_type
      FROM tbl_submissions s
      LEFT JOIN tbl_applicant a ON s.applicant_id = a.ID
      LEFT JOIN tbl_request r ON s.request_id = r.ID
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      sql += ' AND s.status = ?';
      params.push(status);
    }

    if (requestId && requestId !== 'all') {
      sql += ' AND s.request_id = ?';
      params.push(requestId);
    }

    if (search) {
      sql += ' AND (a.fullname LIKE ? OR a.nik LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY s.submission_date DESC';

    const [rows]: any = await db.query(sql, params);
    return rows;
  } catch (error: any) {
    console.error('Get Submissions Error:', error);
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
