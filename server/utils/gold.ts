import axios from 'axios';

const GOLD_API_URL = 'https://logam-mulia.rifacomputer.my.id/api/prices/hargaemas-com';
let cachedPrice: number | null = null;
let lastFetch: number = 0;
const CACHE_DURATION = 3600 * 1000; // 1 hour

export const getGoldPrice = async (): Promise<number> => {
  const now = Date.now();
  if (cachedPrice && (now - lastFetch < CACHE_DURATION)) {
    return cachedPrice;
  }

  try {
    const response = await axios.get(GOLD_API_URL, { timeout: 5000 });
    if (response.status === 200 && response.data?.data?.[0]?.sell) {
      cachedPrice = parseFloat(response.data.data[0].sell);
      lastFetch = now;
      return cachedPrice;
    }
  } catch (error) {
    console.error('Failed to fetch gold price:', error);
  }

  return 0;
};
