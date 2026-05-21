export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const data = await $fetch(`${config.public.apiBase}/pimpinan`)
    return data
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
})
