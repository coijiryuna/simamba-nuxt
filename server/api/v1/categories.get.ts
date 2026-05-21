import { getDb } from '../../utils/db';

export default defineEventHandler(async (event) => {
  const db = getDb();
  try {
    const [rows] = await db.query(`
      SELECT 
        tt.term_taxonomy_id as id,
        t.name,
        t.slug,
        t.term_navbar,
        t.term_link,
        tt.parent,
        tt.count as post_count
      FROM tbl_term_taxonomy tt
      JOIN tbl_terms t ON t.term_id = tt.term_id
      WHERE tt.taxonomy = 'category'
      ORDER BY t.name ASC
    `);
    return rows;
  } catch (error) {
    console.error('Categories API Error:', error);
    return [];
  }
});
