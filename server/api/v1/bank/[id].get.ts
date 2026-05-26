export default defineEventHandler(async (event) => {
  const db = getDb();
  const id = getRouterParam(event, 'id');
    try {
      const [rows]: any = await db.query(`
        SELECT p.ID, p.bank_name, p.bank_account_number, p.bank_account_name, p.bank_logo, p.bank_logo_url
        FROM tbl_bank p
        WHERE p.ID = ?
        LIMIT 1
      `, [id]);

      if (rows.length === 0) {
        console.warn(`Bank not found for ID: ${id}`);
        throw createError({ statusCode: 404, statusMessage: 'Bank not found' });
      }

      const bank = rows[0];
      return bank;
    } catch (error: any) {
      console.error('Bank Detail API Error:', error.message);
      throw createError({ statusCode: error.statusCode || 500, statusMessage: error.message });
    }
});