export default defineEventHandler(async (event) => {
  const db = getDb()
  const body = await readBody(event)

  try {
    // 1. Check if submission is enabled
    const [options] = await db.query('SELECT option_value FROM tbl_options WHERE option_name = "submission_enabled"') as any
    if (!options[0] || options[0].option_value !== 'yes') {
      throw createError({
        statusCode: 403,
        message: 'Layanan pengajuan online sedang ditutup sementara.'
      })
    }

    const { 
      full_name, nik, phone, address, 
      province, city, district, village,
      request_id, notes, requirements 
    } = body

    if (!full_name || !nik || !request_id) {
      throw createError({
        statusCode: 400,
        message: 'Mohon lengkapi semua field wajib.'
      })
    }

    // 2. Upsert applicant
    const [applicants] = await db.query('SELECT ID FROM tbl_applicant WHERE nik = ?', [nik]) as any
    let applicantId: number

    if (applicants.length > 0) {
      applicantId = applicants[0].ID
      // Update data
      await db.query(
        'UPDATE tbl_applicant SET fullname = ?, phone_number = ?, address = ?, province = ?, city = ?, district = ?, village = ? WHERE ID = ?',
        [full_name, phone, address, province, city, district, village, applicantId]
      )
    } else {
      const [result] = await db.query(
        'INSERT INTO tbl_applicant (fullname, nik, phone_number, address, province, city, district, village) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [full_name, nik, phone, address, province, city, district, village]
      ) as any
      applicantId = result.insertId
    }

    // 3. Generate Submission UID (Format: BZ-YYYYMM-RANDOM)
    const datePart = new Date().toISOString().slice(0, 7).replace('-', '')
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase()
    const submissionUid = `BZ-${datePart}-${randomPart}`

    // 4. Create submission with 3-day edit limit
    const maxEditDate = new Date()
    maxEditDate.setDate(maxEditDate.getDate() + 3)

    const [subResult] = await db.query(
      'INSERT INTO tbl_submissions (submission_uid, applicant_id, request_id, notes, status, max_edit_date) VALUES (?, ?, ?, ?, ?, ?)',
      [submissionUid, applicantId, request_id, notes, 'pending', maxEditDate]
    ) as any
    const submissionId = subResult.insertId

    // 5. Save Requirements
    if (requirements && Array.isArray(requirements)) {
      for (const req of requirements) {
        await db.query(
          'INSERT INTO tbl_upload_requirement (submission_id, requirement_id, data_upload_url) VALUES (?, ?, ?)',
          [submissionId, req.requirement_id, req.url]
        )
      }
    }

    return {
      success: true,
      message: 'Pengajuan berhasil dikirim',
      submission_uid: submissionUid
    }

  } catch (error: any) {
    console.error('Create Submission Error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal Server Error'
    })
  }
})
