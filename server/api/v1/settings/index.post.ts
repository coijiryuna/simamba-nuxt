export default defineEventHandler(async (event) => {
  const db = getDb();
  const body = await readBody(event); // Menerima objek { option_name: 'value', ... }

  try {
    for (const [key, value] of Object.entries(body)) {
      // Lewati jika value null/undefined atau jika key adalah properti internal Vue/Nuxt
      if (value === null || value === undefined || key.startsWith("_"))
        continue;

      // Pastikan value diubah menjadi string. Jika berupa object, simpan sebagai JSON string.
      const processedValue =
        typeof value === "object" ? JSON.stringify(value) : String(value);

      /**
       * Menggunakan INSERT ... ON DUPLICATE KEY UPDATE jauh lebih aman daripada REPLACE INTO.
       * Pastikan kolom 'option_name' adalah UNIQUE atau PRIMARY KEY di database Anda.
       */
      await db.query(
        `INSERT INTO tbl_options (option_name, option_value, autoload) 
         VALUES (?, ?, 'yes') 
         ON DUPLICATE KEY UPDATE option_value = VALUES(option_value)`,
        [key, processedValue],
      );
    }

    return { status: 'success', message: 'Settings updated' };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
