export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  return {
    status: 'success',
    message: 'Nuxt 4 Backend is running!',
    db_config: {
      host: config.databaseHost,
      database: config.databaseName
    }
  }
});
