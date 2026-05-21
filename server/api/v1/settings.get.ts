export default defineEventHandler(async (event) => {
  const db = getDb()
  try {
    const [rows] = await db.query('SELECT option_name, option_value FROM tbl_options WHERE autoload = "yes" OR option_name IN ("vision", "mission", "purpose", "target", "speech", "site_address", "site_phone", "admin_email", "site_facebook", "site_instagram", "site_twitter", "flyer_active", "flyer_image", "flyer_link", "submission_enabled")') as any
    
    // Transform array of rows into a clean object { option_name: option_value }
    const settings = rows.reduce((acc: any, row: any) => {
      acc[row.option_name] = row.option_value
      return acc
    }, {})

    return {
      success: true,
      data: settings
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }
})
