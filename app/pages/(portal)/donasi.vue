<script setup>
definePageMeta({
  layout: 'default'
})

const { data: campaigns, pending } = useFetch('/api/v1/campaigns')

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount || 0)
}

const calculateProgress = (current, goal) => {
  if (!goal) return 0
  return Math.min(Math.round((current / goal) * 100), 100)
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-12">
    <div class="mb-16">
      <h1 class="text-4xl md:text-6xl font-black text-slate-800 uppercase tracking-tighter leading-none mb-4 italic">Program Donasi</h1>
      <div class="w-32 h-3 bg-[#fecb00] rounded-sm"></div>
      <p class="mt-6 text-slate-500 font-medium uppercase tracking-[0.3em] text-xs">Ulurkan Tangan, Bantu Sesama</p>
    </div>

    <div v-if="pending" class="grid grid-cols-1 md:grid-cols-3 gap-12">
      <div v-for="i in 6" :key="i" class="h-96 bg-slate-100 animate-pulse rounded-sm"></div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-12">
      <div v-for="item in campaigns" :key="item.id" class="bg-white rounded-sm shadow-sm border border-slate-100 overflow-hidden group hover:shadow-2xl transition-all duration-500">
        <div class="aspect-video relative overflow-hidden">
          <img :src="item.cover_image_url || 'https://via.placeholder.com/600x400?text=Program+BAZNAS'" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          <div class="absolute top-4 left-4 bg-[#fecb00] text-slate-900 text-[9px] font-black px-3 py-1 rounded-sm uppercase tracking-widest">
            {{ item.category_name || 'Program' }}
          </div>
        </div>
        <div class="p-8 space-y-6">
          <h3 class="font-black text-slate-800 text-xl line-clamp-2 min-h-[3.5rem]">{{ item.title }}</h3>
          
          <div class="space-y-3">
            <div class="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
              <span>Terkumpul</span>
              <span class="text-[#01803d]">{{ calculateProgress(item.current_amount, item.target_amount) }}%</span>
            </div>
            <div class="h-2.5 bg-slate-100 rounded-sm overflow-hidden">
              <div class="h-full bg-[#01803d] transition-all duration-1000" :style="{ width: calculateProgress(item.current_amount, item.target_amount) + '%' }"></div>
            </div>
            <div class="flex justify-between items-end">
              <div>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target</p>
                <p class="text-sm font-black text-slate-800">{{ formatCurrency(item.target_amount) }}</p>
              </div>
              <div class="text-right">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Terkumpul</p>
                <p class="text-sm font-black text-[#01803d]">{{ formatCurrency(item.current_amount) }}</p>
              </div>
            </div>
          </div>

          <NuxtLink :to="`/donasi/${item.slug}`" class="block w-full bg-[#01803d] text-white text-center py-4 rounded-sm font-black text-[11px] uppercase tracking-[0.2em] hover:bg-[#016932] transition-colors shadow-lg shadow-emerald-500/20">
            Donasi Sekarang
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
