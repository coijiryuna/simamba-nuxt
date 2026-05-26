<script setup>
import { 
  Heart, ArrowRight, Filter, 
  Search, Calendar, Target,
  TrendingUp, CreditCard
} from 'lucide-vue-next'

const config = useRuntimeConfig()
const { data: campaigns, pending } = await useAsyncData('all-campaigns', () => $fetch('/api/v1/campaigns'))

const searchQuery = ref('')
const selectedCategory = ref('Semua')

const categories = computed(() => {
  if (!campaigns.value) return ['Semua']
  const cats = ['Semua', ...new Set(campaigns.value.map(c => c.category_name).filter(Boolean))]
  return cats
})

const filteredCampaigns = computed(() => {
  if (!campaigns.value) return []
  return campaigns.value.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchCategory = selectedCategory.value === 'Semua' || c.category_name === selectedCategory.value
    return matchSearch && matchCategory
  })
})

const formatIDR = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val || 0)
}

const calculateProgress = (current, target) => {
  if (!target || target <= 0) return 0
  const progress = (current / target) * 100
  return Math.min(progress, 100).toFixed(1)
}

useSeoMeta({
  title: 'Pilih Program Kebaikan - BAZNAS Kabupaten Tangerang',
  description: 'Salurkan Zakat, Infaq, dan Sedekah Anda melalui berbagai program kemanusiaan dan pemberdayaan umat.'
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-12">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
      <div class="max-w-2xl">
        <h1 class="text-xl md:text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none mb-2">
          Program Kebaikan
        </h1>
        <div class="w-20 h-2 bg-[#fecb00] rounded-sm mb-4"></div>
        <p class="text-slate-600 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs">
          Pilih program penyaluran yang paling dekat di hati Anda untuk membantu sesama.
        </p>
      </div>
      
      <!-- Quick Stats -->
      <div class="flex gap-4">
        <div class="bg-[#01803d] text-center p-4 rounded-sm text-white shadow-xl shadow-emerald-900/10 min-w-35">
          <p class="text-[8px] font-black uppercase tracking-widest text-emerald-300 mb-1">Total Program</p>
          <p class="text-4xl text-center font-black ">{{ campaigns?.length || 0 }}</p>
        </div>
        <div class="bg-white text-center p-4 rounded-sm border border-slate-100 shadow-xl shadow-slate-200/50 min-w-35">
          <p class="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</p>
          <p class="text-2xl text-center font-black text-[#01803d]">Aktif</p>
        </div>
      </div>
    </div>

    <!-- Filter & Search Bar -->
    <div class="bg-white p-4 rounded-sm border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-4 mb-12 sticky top-24 z-30">
      <div class="flex-1 relative">
        <Search :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Cari program kebaikan..."
          class="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-sm text-sm focus:outline-none focus:border-[#01803d] font-bold text-slate-700"
        >
      </div>
      <div class="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
        <button 
          v-for="cat in categories" 
          :key="cat"
          @click="selectedCategory = cat"
          :class="selectedCategory === cat ? 'bg-[#01803d] text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'"
          class="px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border border-transparent"
        >
          {{ cat }}
        </button>
      </div>
    </div>

    <!-- Campaigns Grid -->
    <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div v-for="i in 6" :key="i" class="bg-white rounded-sm h-100 animate-pulse border border-slate-100"></div>
    </div>

    <div v-else-if="filteredCampaigns.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div 
        v-for="campaign in filteredCampaigns" 
        :key="campaign.id"
        class="group bg-white rounded-sm border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col"
      >
        <!-- Image Area -->
        <div class="relative h-56 overflow-hidden">
          <img 
            :src="campaign.cover_image_url || 'https://via.placeholder.com/600x400?text=BAZNAS+Program'" 
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div class="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
          
          <div class="absolute top-4 left-4">
            <span class="px-3 py-1 bg-[#fecb00] text-slate-900 text-[8px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg">
              {{ campaign.category_name }}
            </span>
          </div>
        </div>

        <!-- Content Area -->
        <div class="p-6 flex-1 flex flex-col">
          <h3 class="text-sm font-black text-slate-800 uppercase tracking-tight leading-snug mb-4 line-clamp-2 min-h-10 group-hover:text-[#01803d] transition-colors italic">
            {{ campaign.title }}
          </h3>

          <div v-if="campaign.target_amount > 0" class="space-y-3 mb-6">
            <div class="flex justify-between items-end">
              <div>
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Terkumpul</p>
                <p class="text-sm font-black text-[#01803d]">{{ formatIDR(campaign.current_amount) }}</p>
              </div>
              <p class="text-[10px] font-black text-slate-800 italic">{{ calculateProgress(campaign.current_amount, campaign.target_amount) }}%</p>
            </div>
            <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                class="h-full bg-linear-to-r from-[#01803d] to-emerald-400 transition-all duration-1000"
                :style="{ width: `${calculateProgress(campaign.current_amount, campaign.target_amount)}%` }"
              ></div>
            </div>
          </div>
          
          <div v-else class="mb-6 py-3 border-y border-slate-50 flex items-center gap-3">
             <TrendingUp :size="16" class="text-emerald-500" />
             <p class="text-[10px] font-bold text-slate-500 italic">Program Berkelanjutan</p>
          </div>

          <div class="mt-auto pt-6 flex items-center justify-between border-t border-slate-50">
            <div class="flex items-center gap-2">
               <Heart :size="14" class="text-red-500 fill-red-500" />
               <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ayo Bantu!</p>
            </div>
            <a 
              :href="`${config.public.donasiBase}/campaign/${campaign.slug}`"
              target="_blank"
              class="flex items-center gap-2 text-[10px] font-black text-[#01803d] uppercase tracking-widest group/btn"
            >
              Donasi Sekarang
              <ArrowRight :size="14" class="group-hover/btn:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-20 bg-slate-50 rounded-sm border border-slate-100">
      <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
        <Search :size="24" class="text-slate-300" />
      </div>
      <h3 class="text-sm font-black text-slate-800 uppercase tracking-widest mb-2">Program Tidak Ditemukan</h3>
      <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Coba gunakan kata kunci pencarian atau kategori lain</p>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
