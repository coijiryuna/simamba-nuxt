import { getDb } from "../../utils/db";

export default defineEventHandler(async (event) => {
  const tahun = new Date().getFullYear()
  const db = getDb();
  
  try {
    // 1. Ambil data dari SIMAMBA Backend (Public Stats)
    const config = useRuntimeConfig()
    const dashboardRes: any = await $fetch(`${config.public.apiBase}/dashboard-stats`, {
      query: { tahun }
    }).catch(() => ({ data: {} }));

    const publicData = dashboardRes?.data || {}

    // 2. Ambil data internal untuk Admin Dashboard
    const [[postCount]]: any = await db.query('SELECT COUNT(*) as count FROM tbl_posts WHERE post_status = "publish"');
    const [[submissionCount]]: any = await db.query('SELECT COUNT(*) as count FROM tbl_submissions');
    const [[pendingCount]]: any = await db.query('SELECT COUNT(*) as count FROM tbl_submissions WHERE status = "pending"');
    const [[categoryCount]]: any = await db.query('SELECT COUNT(*) as count FROM tbl_term_taxonomy WHERE taxonomy = "category"');
    const [[messageCount]]: any = await db.query('SELECT COUNT(*) as count FROM tbl_messages WHERE is_read = 0');

    // Recent submissions for admin
    const [recentSubmissions]: any = await db.query(`
      SELECT 
        s.ID, s.submission_uid, s.submission_date, s.status,
        a.fullname
      FROM tbl_submissions s
      LEFT JOIN tbl_applicant a ON a.ID = s.applicant_id
      ORDER BY s.submission_date DESC
      LIMIT 5
    `);

    // Recent messages for admin
    const [recentMessages]: any = await db.query(`
      SELECT id, name, subject, created_at, is_read
      FROM tbl_messages
      ORDER BY created_at DESC
      LIMIT 5
    `);

    // 3. Gabungkan hasil
    const totalPenyaluran = publicData.total_realisasi_ytd || 
                           ((publicData.penyaluran_dist || []).reduce((s: number, i: any) => s + (i.realisasi || 0), 0) + 
                            (publicData.penyaluran_daya || []).reduce((s: number, i: any) => s + (i.realisasi || 0), 0))
    
    const totalDonasi = (publicData.pengumpulan || []).reduce((s: number, i: any) => s + (i.realisasi || 0), 0)

    return {
      // Public Stats (for Homepage)
      total_donasi: totalDonasi,
      total_penyaluran: totalPenyaluran,
      total_muzakki: publicData.total_muzakki || 0,
      total_mustahik: publicData.total_mustahik_perorangan || 0,
      total_upz: publicData.total_upz || 0,

      // Admin Stats (for Dashboard)
      stats: {
        posts: postCount?.count || 0,
        submissions: submissionCount?.count || 0,
        pending: pendingCount?.count || 0,
        categories: categoryCount?.count || 0,
        messages: messageCount?.count || 0
      },
      recentSubmissions: recentSubmissions || [],
      recentMessages: recentMessages || []
    }
  } catch (error: any) {
    console.error('Stats API Error:', error)
    return {
      total_donasi: 0,
      total_penyaluran: 0,
      total_muzakki: '-',
      total_mustahik: '-',
      stats: { posts: 0, submissions: 0, pending: 0, categories: 0, messages: 0 },
      recentSubmissions: [],
      recentMessages: []
    }
  }
})
