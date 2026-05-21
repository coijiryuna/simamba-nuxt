export default defineEventHandler(async (event) => {
  const db = getByzisDb();
  const body = await readBody(event);

  try {
    const [result]: any = await db.query(`
      INSERT INTO tbl_payment_methods 
      (name, account_number, account_name, description, type, is_active, admin_fee, icon_url) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      body.name, body.account_number, body.account_name, 
      body.description, body.type || 'transfer', body.is_active || 1, 
      body.admin_fee || 0, body.icon_url || null
    ]);
    return { status: 'success', id: result.insertId };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
