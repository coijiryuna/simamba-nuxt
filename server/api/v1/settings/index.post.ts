export default defineEventHandler(async (event) => {
  const db = getDb();
  const body = await readBody(event); // Menerima objek { option_name: 'value', ... }

  try {
    for (const [key, value] of Object.entries(body)) {
      // Kita pakai REPLACE INTO (MySQL) biar kalau ada diupdate, kalau nggak ada ditambahin
      await db.query(
        'REPLACE INTO tbl_options (option_name, option_value, autoload) VALUES (?, ?, "yes")',
        [key, value]
      );
    }

    return { status: 'success', message: 'Settings updated' };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
