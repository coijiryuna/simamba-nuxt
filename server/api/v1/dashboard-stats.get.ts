export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const tahun = query.tahun || new Date().getFullYear()
  const config = useRuntimeConfig()
  try {
    const data = await $fetch(`${config.public.apiBase}/dashboard-stats`, {
      query: { tahun }
    })
    return data
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
})
