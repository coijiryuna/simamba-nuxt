export default defineEventHandler(async (event) => {
  const db = getDb();
  const formData = await readMultipartFormData(event);

  if (!formData) {
    throw createError({ statusCode: 400, statusMessage: "No form data found" });
  }

  const getField = (name: string) =>
    formData.find((f) => f.name === name)?.data.toString();
  const getFile = (name: string) => formData.find((f) => f.name === name);
  const bank_name = getField("bank_name") || "";
  const bank_account_number = getField("bank_account_number") || "";
  const bank_account_name = getField("bank_account_name") || "";
  const bank_logo = getFile("bank_logo");

  const bankLogo = getFile("bank_logo");
  let bank_logo_url = "";
  try {
    if (bankLogo) {
      const fileData = await saveFile(bankLogo, "banks");
      bank_logo_url = fileData?.url || "";
    }
    const sql = `INSERT INTO tbl_bank (bank_name, bank_account_number, bank_account_name, bank_logo, bank_logo_url) VALUES (?, ?, ?, ?, ?)`;
    await db.query(sql, [
      bank_name,
      bank_account_number,
      bank_account_name,
      bank_logo,
      bank_logo_url,
    ]);
    return {
      status: "success",
      message: "Bank record created successfully",
    };
  } catch (error) {
    console.error("Bank API Error:", error);
      return {
          status: "error",
          message: "Failed to create bank record"
      };
  }
});
