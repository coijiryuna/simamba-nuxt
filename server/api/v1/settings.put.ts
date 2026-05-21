
export default defineEventHandler(async (event) => {
  const db = getDb()
  const body = await readBody(event)

  try {
    // Loop through each key-value and update the database
    for (const [key, value] of Object.entries(body)) {
      await db.query(
        'UPDATE tbl_options SET option_value = ? WHERE option_name = ?',
        [value, key]
      )
    }

    return { 
      success: true, 
      message: 'Settings updated successfully' 
    }
  } catch (error: any) {
    console.error('Update Settings Error:', error)
    throw createError({ 
      statusCode: 500, 
      statusMessage: error.message 
    })
  }
})
