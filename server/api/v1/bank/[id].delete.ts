export default defineEventHandler(async (event) => {
  const db = getDb();
    const query = getQuery(event);
    const id = parseInt(query.id as string);

    try {
      const sql = `DELETE FROM tbl_bank WHERE ID = ?`;
      await db.query(sql, [id]);
      return { message: "Bank record deleted successfully" };
    } catch (error) {
      console.error("Bank API Error:", error);
      return { error: "Failed to delete bank record" };
    }
});