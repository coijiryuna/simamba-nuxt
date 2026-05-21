export default defineEventHandler(async (event) => {
  const cacheKey = 'gold_price_data'
  const cacheDuration = 3600 // 1 hour
  
  // Try to get from storage (cache)
  const cached = await useStorage().getItem(cacheKey)
  if (cached && (Date.now() - cached.timestamp < cacheDuration * 1000)) {
    return cached.price
  }

  try {
    const response = await $fetch('https://logam-mulia.rifacomputer.my.id/api/prices/hargaemas-com', {
      timeout: 5000
    })

    if (response && response.data && response.data[0] && response.data[0].sell) {
      const price = parseFloat(response.data[0].sell)
      
      // Save to cache
      await useStorage().setItem(cacheKey, {
        price,
        timestamp: Date.now()
      })
      
      return price
    }
  } catch (e) {
    console.error('Failed to fetch gold price:', e)
    // Fallback if needed, or return cached if exists even if expired
    if (cached) return cached.price
  }

  return 1200000 // Fallback estimate if everything fails
})
