<script setup>
definePageMeta({
  layout: 'default'
})

const { data: posts, pending } = useFetch('/api/news', {
  query: { limit: 20 }
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-12">
    <div class="mb-16">
      <h1 class="text-4xl md:text-6xl font-black text-slate-800 uppercase tracking-tighter leading-none mb-4 italic">Kabar BAZNAS</h1>
      <div class="w-32 h-3 bg-[#fecb00] rounded-sm"></div>
      <p class="mt-6 text-slate-500 font-medium uppercase tracking-[0.3em] text-xs">Arsip Berita & Informasi Terkini</p>
    </div>

    <div v-if="pending" class="grid grid-cols-1 md:grid-cols-3 gap-12">
      <div v-for="i in 6" :key="i" class="h-96 bg-slate-100 animate-pulse rounded-sm"></div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-12">
      <NuxtLink v-for="post in posts" :key="post.ID" :to="`/berita/${post.slug}`" class="group flex flex-col h-full bg-white rounded-sm overflow-hidden border border-slate-100 hover:border-[#01803d]/50 hover:shadow-2xl transition-all duration-500">
        <div class="aspect-video relative overflow-hidden">
          <img :src="post.featured_image_url || 'https://via.placeholder.com/600x400?text=BAZNAS+Berita'" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
        </div>
        <div class="p-8 flex flex-col flex-1">
          <div class="flex items-center gap-4 mb-4">
            <span class="text-[9px] font-black text-[#fecb00] uppercase tracking-widest px-2 py-0.5 bg-[#fecb00]/10 rounded-sm">BERITA</span>
            <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              {{ post.post_date ? new Date(post.post_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Terbaru' }}
            </span>
          </div>
          <h3 class="text-xl font-bold mb-4 line-clamp-2 leading-tight group-hover:text-[#01803d] transition-colors">{{ post.post_title }}</h3>
          <div class="text-slate-500 text-sm line-clamp-3 mb-6" v-html="post.post_content"></div>
          <div class="mt-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#01803d] group-hover:gap-4 transition-all">
            Baca Selengkapnya <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
