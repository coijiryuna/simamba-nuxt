export default defineEventHandler((event) => {
  const origin = getHeader(event, 'origin');
  
  // Ambil daftar origin dari env (dipisah koma)
  const config = useRuntimeConfig();
  const allowedOrigins = config.corsAllowedOrigins?.split(',') || [];

  if (origin && allowedOrigins.includes(origin)) {
    setResponseHeaders(event, {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    });
  }

  // Handle preflight request (OPTIONS)
  if (event.method === 'OPTIONS') {
    event.node.res.statusCode = 204;
    event.node.res.statusMessage = 'No Content';
    return '';
  }
});
