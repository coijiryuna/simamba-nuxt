export default defineEventHandler(async (event) => {
  const db = getDb();
  const query = getQuery(event);

  const status = query.status as string;
  const requestId = query.request_id as string;
  const search = query.search as string;

  try {
    let sql = `
      SELECT 
        s.submission_uid,
        DATE_FORMAT(s.submission_date, '%Y-%m-%d %H:%i:%s') as tgl_masuk,
        a.full_name as nama_mustahik, 
        a.nik, 
        r.request as jenis_bantuan,
        s.status,
        s.notes
      FROM tbl_submissions s
      JOIN tbl_applicants a ON s.applicant_id = a.id
      JOIN tbl_request r ON s.request_id = r.ID
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
      sql += ' AND (a.full_name LIKE ? OR a.nik LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY s.submission_date DESC';

    const [rows]: any = await db.query(sql, params);

    // Bikin Header CSV
    let csv = 'UID Permohonan,Tanggal Masuk,Nama Mustahik,NIK,Jenis Bantuan,Status,Catatan Tambahan\n';

    // Isi Data
    rows.forEach((row: any) => {
      // Bersihin koma atau enter biar gak ngerusak format CSV
      const notes = row.notes ? row.notes.replace(/[\n\r,]/g, ' ') : '';
      const name = row.nama_mustahik ? row.nama_mustahik.replace(/,/g, '') : '';
      
      csv += `"${row.submission_uid}","${row.tgl_masuk}","${name}","${row.nik}","${row.jenis_bantuan}","${row.status.toUpperCase()}","${notes}"\n`;
    });

    // Setup Header Response biar otomatis download file
    setResponseHeader(event, 'Content-Type', 'text/csv; charset=utf-8');
    setResponseHeader(event, 'Content-Disposition', `attachment; filename="Laporan_Permohonan_BAZNAS_${Date.now()}.csv"`);

    return csv;

  } catch (error: any) {
    console.error('Export Submissions Error:', error);
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
