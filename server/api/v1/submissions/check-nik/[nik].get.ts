export default defineEventHandler(async (event) => {
  const db = getDb()
  const nik = getRouterParam(event, 'nik')

  try {
    const [rows] = await db.query(
      `SELECT s.submission_uid, s.status 
       FROM tbl_submissions s
       JOIN tbl_applicant a ON s.applicant_id = a.ID
       WHERE a.nik = ? AND s.status IN ('pending', 'in_process', 'approved')
       ORDER BY s.submission_date DESC LIMIT 1`,
      [nik]
    ) as any

    if (rows.length > 0) {
      return {
        exists: true,
        submission: rows[0]
      }
    }

    return {
      exists: false
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }
})
