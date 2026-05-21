export default defineEventHandler(async (event) => {
  const db = getDb()
  const uid = getRouterParam(event, 'uid')
  const body = await readBody(event)

  try {
    // 1. Get current submission to check max_edit_date
    const [submissions]: any = await db.query(
      'SELECT ID, max_edit_date, status FROM tbl_submissions WHERE submission_uid = ?',
      [uid]
    )

    if (submissions.length === 0) {
      throw createError({ statusCode: 404, message: 'Pengajuan tidak ditemukan.' })
    }

    const submission = submissions[0]
    const now = new Date()
    const maxEdit = new Date(submission.max_edit_date)

    if (now > maxEdit) {
      throw createError({ statusCode: 403, message: 'Batas waktu perbaikan data telah berakhir.' })
    }

    const { 
      full_name, phone, address, 
      province, city, district, village,
      notes, requirements 
    } = body

    // 2. Update applicant data
    await db.query(`
      UPDATE tbl_applicant a
      JOIN tbl_submissions s ON s.applicant_id = a.ID
      SET a.fullname = ?, a.phone_number = ?, a.address = ?, 
          a.province = ?, a.city = ?, a.district = ?, a.village = ?
      WHERE s.submission_uid = ?
    `, [full_name, phone, address, province, city, district, village, uid])

    // 3. Update submission notes
    await db.query(
      'UPDATE tbl_submissions SET notes = ? WHERE submission_uid = ?',
      [notes, uid]
    )

    // 4. Update Requirements
    if (requirements && Array.isArray(requirements)) {
      for (const req of requirements) {
        // Check if already exists
        const [existing] = await db.query(
          'SELECT ID FROM tbl_upload_requirement WHERE submission_id = ? AND requirement_id = ?',
          [submission.ID, req.requirement_id]
        ) as any

        if (existing.length > 0) {
          await db.query(
            'UPDATE tbl_upload_requirement SET data_upload = ?, data_upload_url = ? WHERE ID = ?',
            [req.url, req.url, existing[0].ID]
          )
        } else {
          await db.query(
            'INSERT INTO tbl_upload_requirement (submission_id, requirement_id, data_upload, data_upload_url) VALUES (?, ?, ?, ?)',
            [submission.ID, req.requirement_id, req.url, req.url]
          )
        }
      }
    }

    return {
      success: true,
      message: 'Data berhasil diperbarui.'
    }

  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message
    })
  }
})
