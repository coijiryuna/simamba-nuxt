export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = query.page || 1
  const search = query.search || ''
  const per_page = query.per_page || 10
  try {
    const config = useRuntimeConfig()
    const data = await $fetch(`${config.public.apiBase}/upz-baznas`, {
      query: { page, search, per_page }
    })
    return data
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
})
