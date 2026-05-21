export default defineEventHandler(async (event) => {
  const db = getByzisDb();
  try {
    const [rows]: any = await db.query("SELECT * FROM tbl_testimoni ORDER BY created_at DESC LIMIT 10");
    return {
      status: 'success',
      data: rows
    };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
