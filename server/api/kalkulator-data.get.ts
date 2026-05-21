import { getGoldPrice } from '../utils/gold'
import { getDb } from '../utils/db'

export default defineEventHandler(async (event) => {
  const goldPrice = await getGoldPrice()
  
  let fitrahPrice = 45000 // Default if not found
  let fitrahCampaign = null

  try {
    const db = getDb()
    const [rows] = await db.query(`
      SELECT c.id, c.title, c.slug, c.default_amount 
      FROM tbl_campaigns c
      JOIN tbl_categories cat ON cat.id = c.category_id
      WHERE cat.categories_type = 'zakat_fitrah'
      ORDER BY c.is_default DESC, c.created_at DESC
      LIMIT 1
    `)

    const results = rows as any[]
    if (results && results.length > 0) {
      fitrahPrice = results[0].default_amount || 45000
      fitrahCampaign = {
        id: results[0].id,
        title: results[0].title,
        slug: results[0].slug
      }
    }
  } catch (e) {
    console.error('Failed to fetch fitrah price:', e)
  }

  return {
    goldPrice,
    fitrahPrice,
    fitrahCampaign
  }
})
