export default defineEventHandler(async (event) => {
    const db = getDb();
    const formData = await readMultipartFormData(event);

    if (!formData) {
        throw createError({ statusCode: 400, statusMessage: "No form data found" });
    }
    const getField = (name: string) => formData.find((f) => f.name === name)?.data.toString();
    const getFile = (name: string) => formData.find((f) => f.name === name);
    const id = parseInt(getField("id") || "0");
    const bank_name = getField("bank_name") || "";
    const bank_account_number = getField("bank_account_number") || "";
    const bank_account_name = getField("bank_account_name") || "";
    const bank_logo = getFile("bank_logo");

    let bank_logo_url = "";
    try {
        if (bank_logo) {
            const fileData = await saveFile(bank_logo, "banks");
            bank_logo_url = fileData?.url || "";
        }
        const sql = `UPDATE tbl_bank SET bank_name = ?, bank_account_number = ?, bank_account_name = ?, bank_logo = ?, bank_logo_url = ? WHERE ID = ?`;
        await db.query(sql, [
            bank_name,
            bank_account_number,
            bank_account_name,
            bank_logo,
            bank_logo_url,
            id
        ]);
        return {
            status: "success",
            message: "Bank record updated successfully",
        };
    } catch (error) {
        console.error("Bank API Error:", error);
        return {
            status: "error",
            message: "Failed to update bank record"
        };
    }
});