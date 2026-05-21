export default defineEventHandler(async (event) => {
  const db = getByzisDb();
  try {
    const [rows]: any = await db.query("SELECT * FROM tbl_payment_methods WHERE is_active = 1 ORDER BY id ASC");
    return {
      status: 'success',
      data: rows
    };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
