import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  const pool = mysql.createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    port: Number(process.env.DATABASE_PORT || 3306),
  });

  try {
    const [subs]: any = await pool.query('SELECT * FROM tbl_submissions');
    console.log('Submissions:', subs);

    const [apps]: any = await pool.query('SELECT * FROM tbl_applicant');
    console.log('Applicants:', apps);

    const [reqs]: any = await pool.query('SELECT * FROM tbl_request');
    console.log('Requests:', reqs);

    const [requirements]: any = await pool.query('SELECT * FROM tbl_requirements');
    console.log('All Requirements:', requirements);

    const [uploads]: any = await pool.query('SELECT * FROM tbl_upload_requirement');
    console.log('All Uploads:', uploads);

    const [joined]: any = await pool.query(`
      SELECT 
        s.*, 
        a.fullname as full_name, 
        a.nik, 
        r.request as assistance_type
      FROM tbl_submissions s
      LEFT JOIN tbl_applicant a ON s.applicant_id = a.ID
      LEFT JOIN tbl_request r ON s.request_id = r.ID
      ORDER BY s.submission_date DESC
    `);
    console.log('Joined Rows:', joined);

  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}

check();
