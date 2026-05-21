export default defineEventHandler(async (event) => {
  const db = getDb();
  const { table } = getQuery(event);
  try {
    const [rows]: any = await db.query(`SELECT * FROM ${table} LIMIT 10`);
    return rows;
  } catch (error: any) {
    return { error: error.message };
  }
});
