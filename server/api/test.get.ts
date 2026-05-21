export default defineEventHandler(async (event) => {
  return {
    status: 'success',
    message: 'Nuxt 4 Backend is running!',
    db_config: {
      host: process.env.DATABASE_HOST,
      database: process.env.DATABASE_NAME
    }
  }
});
