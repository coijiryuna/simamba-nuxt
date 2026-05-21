// Force rebuild - updated at 2026-05-13 20:47
export default defineEventHandler(async (event) => {
  const db = getDb();
  const id = getRouterParam(event, 'id');

  try {
    // 1. Ambil data utama submission, applicant, dan request
    const [submissionRows]: any = await db.query(`
      SELECT 
        s.ID, 
        s.submission_uid, 
        s.submission_date, 
        s.status,
        s.notes,
        a.fullname as applicant_name,
        a.nik as applicant_nik,
        a.phone_number,
        a.address,
        a.village,
        a.district,
        a.city,
        a.province,
        r.request as request_type
      FROM tbl_submissions s
      LEFT JOIN tbl_applicant a ON s.applicant_id = a.ID
      LEFT JOIN tbl_request r ON s.request_id = r.ID
      WHERE s.submission_uid = ? OR s.ID = ?
    `, [id, id]);

    if (submissionRows.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Submission not found' });
    }

    const submission = submissionRows[0];

    // 2. Ambil persyaratan (Requirements) untuk jenis request ini
    const [requirements]: any = await db.query(`
      SELECT req.ID as id, req.requirements as name
      FROM tbl_requirements req
      WHERE req.request_id = ? AND req.status = 1
    `, [submission.request_id]);

    // 3. Ambil file yang sudah di-upload
    const [uploads]: any = await db.query(`
      SELECT requirement_id, data_upload_url as data_upload
      FROM tbl_upload_requirement
      WHERE submission_id = ?
    `, [submission.ID]);

    // Mapping upload ke requirements
    const uploadsMap = uploads.reduce((acc: any, u: any) => {
      acc[u.requirement_id] = u.data_upload;
      return acc;
    }, {});

    return {
      ...submission,
      requirements: requirements.map((r: any) => ({
        ...r,
        file: uploadsMap[r.id] || null
      }))
    };
  } catch (error: any) {
    console.error('DEBUG - Submission Detail Fetch Error:', error);
    throw createError({ statusCode: error.statusCode || 500, statusMessage: error.message });
  }
});
