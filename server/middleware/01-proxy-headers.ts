/**
 * Middleware untuk handle X-Forwarded headers dari Nginx reverse proxy
 * Penting untuk OAuth redirect URI yang benar
 */
export default defineEventHandler((event) => {
  // Force protocol ke https di production
  if (process.env.NODE_ENV === 'production') {
    const proto = getHeader(event, 'x-forwarded-proto')
    if (proto && proto !== 'https') {
      // Override ke https
      event.node.req.headers['x-forwarded-proto'] = 'https'
    }
  }
  
  // Debug logging di development
  if (process.env.NODE_ENV === 'development') {
    const proto = getHeader(event, 'x-forwarded-proto')
    const host = getHeader(event, 'x-forwarded-host')
    if (proto || host) {
      console.log('[Proxy Headers]', {
        'x-forwarded-proto': proto,
        'x-forwarded-host': host,
        'host': getHeader(event, 'host'),
      })
    }
  }
})

