export default defineEventHandler(async (event) => {
  const db = getDb();
  const query = getQuery(event);

  const search = query.search as string;
  const page = parseInt((query.page as string) || "1");
  const limit = parseInt((query.limit as string) || "10");
  const offset = (page - 1) * limit;

  try {
    let slq = `
SELECT  p.ID, p.bank_name, p.bank_account_number, p.bank_account_name, p.bank_logo, p.bank_logo_url
FROM tbl_bank p
WHERE p.bank_name LIKE ? OR p.bank_account_number LIKE ? OR p.bank_account_name LIKE ?
ORDER BY p.ID DESC
LIMIT ? OFFSET ?
        `;
    if (!search) {
      slq = `
SELECT  p.ID, p.bank_name, p.bank_account_number, p.bank_account_name, p.bank_logo, p.bank_logo_url
FROM tbl_bank p
ORDER BY p.ID DESC
LIMIT ? OFFSET ?
        `;
    }
    const params: any[] = search ? [`%${search}%`, `%${search}%`, `%${search}%`, limit, offset] : [limit, offset];
    const [rows] = await db.query(slq, params);

    return {
      page,
      limit,
      data: rows,
    };
  } catch (error) {
    console.error("Bank API Error:", error);
    return { error: "Failed to fetch bank data" };
  }
});
