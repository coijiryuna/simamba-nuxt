import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const db = getDb()
  const body = await readBody(event)
  const { username, password } = body

  try {
    console.log('--- LOGIN DEBUG START ---')
    console.log('Username provided:', username)
    
    // 1. Database Check
    const [rows]: any = await db.query(
      'SELECT ID as id, user_pass as password, display_name as name, role, user_email as email FROM tbl_users WHERE user_login = ?',
      [username]
    ).catch(e => {
      console.error('Database Query Error:', e)
      throw createError({ statusCode: 500, message: 'Database Error: ' + e.message })
    })

    console.log('Rows found:', rows.length)

    if (rows.length === 0) {
      console.log('User not found in table tbl_users')
      throw createError({ statusCode: 401, statusMessage: 'Username atau password salah' })
    }

    const dbUser = rows[0]
    console.log('User ID found:', dbUser.id)

    // 2. Password Check
    const isMatch = await bcrypt.compare(password, dbUser.password).catch(e => {
      console.error('Bcrypt Error:', e)
      throw createError({ statusCode: 500, message: 'Encryption Error: ' + e.message })
    })
    
    console.log('Password match:', isMatch)
    
    if (!isMatch) {
      throw createError({ statusCode: 401, statusMessage: 'Username atau password salah' })
    }

    // 3. Session Check
    try {
      await setUserSession(event, {
        user: {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role
        },
        loggedInAt: new Date().toISOString()
      })
      console.log('Session created successfully')
    } catch (e: any) {
      console.error('Session Error:', e)
      throw createError({ statusCode: 500, message: 'Session Error: ' + e.message })
    }

    return { status: 'success', message: 'Logged in successfully' }
  } catch (error: any) {
    console.error('--- LOGIN DEBUG ERROR ---')
    console.error(error)
    throw createError({ 
      statusCode: error.statusCode || 500, 
      statusMessage: error.message || error.statusMessage || 'Internal Server Error',
      data: error
    })
  }
})
