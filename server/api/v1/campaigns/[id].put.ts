export default defineEventHandler(async (event) => {
  const db = getByzisDb();
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);

  try {
    const formatDate = (d: string) => d ? new Date(d).toISOString().slice(0, 19).replace('T', ' ') : null;
    const slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const unitValue = ['paket', 'ekor'].includes(body.unit) ? body.unit : null;
    const statusValue = ['active', 'closed', 'draft'].includes(body.status) ? body.status : 'draft';

    // Cek duplikasi (kecuali dirinya sendiri)
    const [existing]: any = await db.query('SELECT id FROM tbl_campaigns WHERE (title = ? OR slug = ?) AND id != ?', [body.title, slug, id]);
    if (existing.length > 0) {
      throw createError({ statusCode: 400, statusMessage: 'Judul atau Slug program ini sudah digunakan oleh program lain' });
    }

    // Ambil data booked_slots saat ini untuk sinkronisasi remaining_slots
    const [current]: any = await db.query('SELECT booked_slots FROM tbl_campaigns WHERE id = ?', [id]);
    const booked = current[0]?.booked_slots || 0;
    const remaining = Math.max(0, (body.available_slots || 0) - booked);

    await db.query(`
      UPDATE tbl_campaigns 
      SET category_id = ?, title = ?, slug = ?, description = ?, full_description = ?, specifications = ?,
          weight = ?, age = ?, health = ?, target_amount = ?, default_amount = ?, start_date = ?, end_date = ?,
          status = ?, unit = ?, is_multiple = ?, available_slots = ?, remaining_slots = ?, cover_image_url = ?, image_url = ?, \`default\` = ?
      WHERE id = ?
    `, [
      body.category_id, body.title, slug, body.description, body.full_description, body.specifications,
      body.weight, body.age, body.health, body.target_amount, body.default_amount, 
      formatDate(body.start_date), formatDate(body.end_date),
      statusValue, unitValue, body.is_multiple, body.available_slots, remaining, body.cover_image_url, 
      body.image_url, body['default'] || 0, id
    ]);
    return { status: 'success' };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
