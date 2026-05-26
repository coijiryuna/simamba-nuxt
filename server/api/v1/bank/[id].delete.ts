export default defineEventHandler(async (event) => {
  const db = getDb();
  const id = getRouterParam(event, "id");

  try {
    await db.query("DELETE FROM tbl_bank WHERE ID = ?", [id]);

    return { status: "success", message: "Bank deleted successfully" };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
