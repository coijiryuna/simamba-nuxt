import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const db = getDb();
  try {
    // Pastikan password di-hash dengan benar
    const hashedPassword = await bcrypt.hash('admin123', 12);
    await db.query("UPDATE tbl_users SET user_pass = ? WHERE ID = 1", [hashedPassword]);
    return { status: 'success', message: 'Password admin ID 1 has been reset to: admin123. SEGERA HAPUS FILE INI!' };
  } catch (error: any) {
    return { status: 'error', message: error.message };
  }
});
