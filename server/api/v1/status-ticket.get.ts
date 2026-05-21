export default defineEventHandler(async (event) => {
  const db = getDb()
  const query = getQuery(event)
  const ticket = query.ticket as string

  if (!ticket) {
    throw createError({
      statusCode: 400,
      message: 'Nomor tiket wajib diisi.'
    })
  }

  try {
    const [rows]: any = await db.query(`
      SELECT 
        s.ID,
        s.submission_uid as nomor_tiket,
        s.status as status_pengajuan,
        s.submission_date as created_at,
        s.max_edit_date,
        s.request_id,
        a.fullname as nama_penerima,
        r.request as jenis_bantuan,
        s.notes as perihal
      FROM tbl_submissions s
      JOIN tbl_applicant a ON s.applicant_id = a.ID
      JOIN tbl_request r ON s.request_id = r.ID
      WHERE s.submission_uid = ?
    `, [ticket])

    if (rows.length === 0) {
      // Fallback: Check external production API (for offline tickets)
      try {
        const config = useRuntimeConfig()
        const externalApiBase = config.public.apiBase || 'https://simamba.baznastangerangkab.or.id/api'
        const externalRes: any = await $fetch(`${externalApiBase}/status-ticket`, {
          params: { ticket }
        })
        
        if (externalRes.status === 'success') {
          return externalRes
        }
      } catch (e) {
        console.error('External Status Check Failed:', e)
      }

      return {
        status: 'error',
        message: 'Nomor tiket tidak ditemukan.'
      }
    }

    const data = rows[0]
    return {
      status: 'success',
      data: {
        ...data,
        nomor_surat: data.nomor_tiket,
        pengirim_surat: data.nama_penerima,
        status_surat: data.status_pengajuan,
        jenis_surat: data.jenis_bantuan,
        status_pengajuan: mapStatus(data.status_pengajuan)
      }
    }

  } catch (error: any) {
    console.error('Status Ticket Error:', error)
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }
})

function mapStatus(status: string) {
  const s = status.toLowerCase()
  if (s === 'pending') return 'Masuk'
  if (s === 'verified') return 'Verivikasi'
  if (s === 'survey') return 'Survai'
  if (s === 'processing') return 'Proses Pencairan'
  if (s === 'completed') return 'Selesai'
  return 'Masuk'
}
