export default defineEventHandler(async (event) => {
  const db = getByzisDb();
  const body = await readBody(event);

  try {
    const formatDate = (d: string) => d ? new Date(d).toISOString().slice(0, 19).replace('T', ' ') : null;
    const slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const unitValue = ['paket', 'ekor'].includes(body.unit) ? body.unit : null;
    const statusValue = ['active', 'closed', 'draft'].includes(body.status) ? body.status : 'draft';

    // Cek duplikasi
    const [existing]: any = await db.query('SELECT id FROM tbl_campaigns WHERE title = ? OR slug = ?', [body.title, slug]);
    if (existing.length > 0) {
      throw createError({ statusCode: 400, statusMessage: 'Judul atau Slug program ini sudah digunakan' });
    }

    const [result]: any = await db.query(`
      INSERT INTO tbl_campaigns 
      (category_id, title, slug, description, full_description, specifications, weight, age, health, target_amount, default_amount, start_date, end_date, status, unit, is_multiple, available_slots, booked_slots, remaining_slots, cover_image_url, image_url, \`default\`) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      body.category_id, body.title, slug,
      body.description || null, body.full_description || null, body.specifications || null,
      body.weight || null, body.age || null, body.health || null,
      body.target_amount || 0, body.default_amount || 0,
      formatDate(body.start_date), formatDate(body.end_date),
      statusValue, unitValue,
      body.is_multiple !== undefined ? body.is_multiple : 1,
      body.available_slots || 0, 0, body.available_slots || 0,
      body.cover_image_url || null,
      body.image_url || null,
      body['default'] || 0
    ]);
    return { status: 'success', id: result.insertId };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
