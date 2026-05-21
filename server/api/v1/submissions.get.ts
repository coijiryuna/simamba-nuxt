export default defineEventHandler(async (event) => {
  const db = getDb();
  try {
    const [rows]: any = await db.query(`
      SELECT 
        s.ID,
        s.submission_uid,
        s.submission_date,
        s.status,
        a.fullname as applicant_name,
        a.phone_number,
        r.request as request_type
      FROM tbl_submissions s
      LEFT JOIN tbl_applicant a ON a.ID = s.applicant_id
      LEFT JOIN tbl_request r ON r.ID = s.request_id
      ORDER BY s.submission_date DESC
    `);

    return rows;
  } catch (error: any) {
    console.error('Submissions API Error:', error);
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
