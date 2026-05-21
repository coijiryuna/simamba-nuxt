<script setup>
definePageMeta({
  layout: 'default'
})

const { data: gallery, pending } = useFetch('/api/v1/gallery')
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-12">
    <div class="mb-16">
      <h1 class="text-4xl md:text-6xl font-black text-slate-800 uppercase tracking-tighter leading-none mb-4 italic">Galeri Kegiatan</h1>
      <div class="w-32 h-3 bg-[#fecb00] rounded-sm"></div>
      <p class="mt-6 text-slate-500 font-medium uppercase tracking-[0.3em] text-xs">Dokumentasi Program & Penyaluran</p>
    </div>

    <div v-if="pending" class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="i in 12" :key="i" class="aspect-square bg-slate-100 animate-pulse rounded-sm"></div>
    </div>

    <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="item in gallery" :key="item.id" class="aspect-square bg-white rounded-sm overflow-hidden group relative border border-slate-100 shadow-sm">
        <img :src="item.images_url || 'https://via.placeholder.com/600'" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div class="absolute inset-0 bg-gradient-to-t from-[#012a14]/90 via-[#012a14]/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6">
          <p class="text-[9px] font-black text-[#fecb00] uppercase tracking-widest mb-1">{{ item.category || 'Kegiatan' }}</p>
          <h3 class="text-white text-xs font-black uppercase leading-tight">{{ item.caption }}</h3>
        </div>
      </div>
    </div>

    <div v-if="!pending && gallery?.length === 0" class="text-center py-32 text-slate-400">
      <p class="italic">Belum ada foto galeri.</p>
    </div>
  </div>
</template>
