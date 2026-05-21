export default defineEventHandler(async (event) => {
  const db = getByzisDb();
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);

  try {
    await db.query(`
      UPDATE tbl_payment_methods 
      SET name = ?, account_number = ?, account_name = ?, description = ?, 
          type = ?, is_active = ?, admin_fee = ?, icon_url = ?
      WHERE id = ?
    `, [
      body.name, body.account_number, body.account_name, 
      body.description, body.type, body.is_active, 
      body.admin_fee, body.icon_url, id
    ]);
    return { status: 'success' };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
