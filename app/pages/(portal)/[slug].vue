<script setup>
definePageMeta({
  layout: 'default'
})
const { data: settingsRes } = await useFetch('/api/v1/settings')
const settings = computed(() => settingsRes.value?.data || {})

const route = useRoute()
const slug = route.params.slug

// 1. Prioritas: Cari sebagai postingan tunggal
const { data: fallbackPost, pending: postPending } = await useAsyncData(`post-${slug}`, async () => {
  try {
    return await $fetch(`/api/v1/posts/${slug}`)
  } catch (e) {
    return null
  }
})

// 2. Fallback: Cari info kategori jika bukan postingan atau ingin cek redirect
const { data: categories } = await useFetch('/api/v1/categories')
const currentCategory = computed(() => {
  return categories.value?.find(c => c.slug === slug)
})

// Fetch posts by category slug (hanya jika tidak ada postingan tunggal)
const { data: categoryData, pending: catPending } = useFetch('/api/v1/posts', {
  query: { category: slug, limit: 12 },
  immediate: !fallbackPost.value
})

const { data: latestPosts } = await useFetch('/api/v1/news', {
  query: { limit: 5 }
})

// Fetch categories for sidebar
const { data: sidebarCategories } = await useFetch('/api/v1/categories')

const pending = computed(() => postPending.value || (catPending.value && !fallbackPost.value))

// Redirect tetap berjalan jika ada term_link yang berbeda
watch(currentCategory, (newCat) => {
  if (newCat?.term_link && newCat.term_link !== '#' && newCat.term_link !== '' && newCat.term_link !== `/${slug}`) {
    navigateTo(newCat.term_link, { external: newCat.term_link.startsWith('http') })
  }
}, { immediate: true })

useSeoMeta({
  title: () => {
    if (fallbackPost.value) return `${fallbackPost.value.post_title} - ${settings.value.blogname}`
    if (currentCategory.value) return `${currentCategory.value.name} - ${settings.value.blogname}`
    return 'Halaman Tidak Ditemukan'
  },
  description: () => fallbackPost.value?.post_excerpt || `Informasi dari ${settings.value.blogname}.`,
  ogImage: () => fallbackPost.value?.featured_image_url || settings.value.site_logo || '/logo.png'
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-12">
    
    <!-- PRIORITAS 1: Tampilkan Konten Postingan Tunggal (Jika Ditemukan) -->
    <div v-if="fallbackPost" class="max-w-7xl mx-auto">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <!-- Main Content -->
        <div class="lg:col-span-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div class="space-y-6">
            <nav class="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <NuxtLink to="/" class="hover:text-[#01803d]">Beranda</NuxtLink>
              <span class="text-slate-300">/</span>
              <span class="text-[#01803d]">{{ fallbackPost.post_title }}</span>
            </nav>
            <h1 class="text-xl md:text-3xl font-black text-slate-900 tracking-tighter leading-none">
              {{ fallbackPost.post_title }}
            </h1>
            <div class="w-20 h-2 bg-[#fecb00] rounded-sm"></div>
          </div>

          <div v-if="fallbackPost.featured_image_url" class="rounded-sm overflow-hidden shadow-2xl border border-slate-100 group">
            <img :src="fallbackPost.featured_image_url"
              class="w-auto h-auto group-hover:scale-105 transition-transform duration-1000"
              :alt="fallbackPost.post_title" />
          </div>

          <div 
            class="prose prose-slate prose-lg max-w-none prose-img:rounded-sm prose-a:text-[#01803d] prose-strong:font-black text-slate-800 font-medium leading-relaxed article-content text-base md:text-lg text-justify" 
            v-html="fallbackPost.post_content"
          >
          </div>
        </div>

        <!-- Sidebar -->
        <aside class="lg:col-span-4 space-y-10">
          <!-- Search Widget -->
          <div class="bg-white p-6 rounded-sm border border-slate-100 shadow-sm">
            <h4 class="text-xs font-black uppercase tracking-widest text-slate-800 mb-4 flex items-center gap-2">
              <div class="w-1.5 h-4 bg-[#fecb00] rounded-full"></div> Cari Informasi
            </h4>
            <div class="relative">
              <input type="text" placeholder="Ketik kata kunci..." class="w-full bg-slate-50 border border-slate-200 rounded-sm py-3 px-4 text-xs font-bold outline-none focus:border-[#01803d] transition-all" />
              <button class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </button>
            </div>
          </div>

          <!-- Categories Widget -->
          <div class="bg-white p-6 rounded-sm border border-slate-100 shadow-sm">
            <h4 class="text-xs font-black uppercase tracking-widest text-slate-800 mb-6 flex items-center gap-2">
              <div class="w-1.5 h-4 bg-[#fecb00] rounded-full"></div> Kategori
            </h4>
            <div class="space-y-2">
              <NuxtLink 
                v-for="cat in sidebarCategories?.slice(0, 8)" 
                :key="cat.id" 
                :to="`/${cat.slug}`"
                class="flex items-center justify-between p-3 rounded-sm hover:bg-emerald-50 text-slate-600 hover:text-[#01803d] transition-all group border border-transparent hover:border-emerald-100"
              >
                <span class="text-[10px] font-bold uppercase tracking-wider">{{ cat.name }}</span>
                <span class="text-[9px] font-black bg-slate-50 group-hover:bg-white px-2 py-0.5 rounded-full text-slate-400 group-hover:text-[#01803d] transition-colors border border-slate-100">
                  {{ cat.post_count }}
                </span>
              </NuxtLink>
            </div>
          </div>

          <!-- Latest News Widget -->
          <div class="bg-white p-6 rounded-sm border border-slate-100 shadow-sm">
            <h4 class="text-xs font-black uppercase tracking-widest text-slate-800 mb-6 flex items-center gap-2">
              <div class="w-1.5 h-4 bg-[#fecb00] rounded-full"></div> Berita Terbaru
            </h4>
            <div class="space-y-6">
              <NuxtLink v-for="news in latestPosts?.data" :key="news.id" :to="`/berita/${news.slug}`" class="flex gap-4 group cursor-pointer">
                <div class="w-20 h-20 shrink-0 rounded-sm overflow-hidden bg-slate-100 border border-slate-50">
                  <img :src="news.featured_image_url || '/logo.png'" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div class="space-y-1">
                  <h5 class="text-[11px] font-black text-slate-800 leading-tight line-clamp-2 uppercase group-hover:text-[#01803d] transition-colors tracking-tighter">
                    {{ news.post_title }}
                  </h5>
                  <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">
                    {{ news.post_date ? new Date(news.post_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Terbaru' }}
                  </p>
                </div>
              </NuxtLink>
            </div>
            <NuxtLink to="/berita" class="block w-full text-center mt-8 py-3 border-2 border-dashed border-emerald-100 text-[#01803d] text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 transition-all rounded-sm">
              Lihat Semua Berita
            </NuxtLink>
          </div>

          <!-- Sticky Donation CTA -->
          <div class="sticky top-24 space-y-6">
            <div class="bg-[#01803d] p-8 rounded-sm shadow-2xl relative overflow-hidden group">
              <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
              <div class="relative z-10 space-y-6">
                <div class="w-12 h-12 bg-[#fecb00] rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <svg class="w-6 h-6 text-[#01803d]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                </div>
                <div class="space-y-2">
                  <h4 class="text-xl font-black text-white leading-tight uppercase italic tracking-tighter">Mari Berbagi Kebahagiaan</h4>
                  <p class="text-[10px] text-emerald-100 font-bold uppercase tracking-widest leading-relaxed">Salurkan Zakat, Infaq dan Sedekah Anda untuk membantu sesama melalui portal resmi BAZNAS.</p>
                </div>
                <a href="https://donasi.baznastangerangkab.or.id" target="_blank" class="block w-full bg-[#fecb00] text-slate-900 py-4 rounded-sm text-center font-black text-[11px] uppercase tracking-[0.2em] hover:bg-white transition-all shadow-xl">
                  Donasi Sekarang
                </a>
              </div>
            </div>

            <!-- Social Media Widget -->
            <div class="bg-green-900 p-6 rounded-sm shadow-xl space-y-4">
              <h4 class="text-[10px] font-black uppercase tracking-[0.3em] text-[#fecb00]">Ikuti Kami</h4>
              <div class="flex items-center gap-3">
                <a href="#" class="w-10 h-10 rounded-sm bg-white/5 flex items-center justify-center hover:bg-[#01803d] hover:text-white transition-all group border border-white/5">
                  <svg class="w-5 h-5 opacity-70 group-hover:opacity-100" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="#" class="w-10 h-10 rounded-sm bg-white/5 flex items-center justify-center hover:bg-[#E1306C] hover:text-white transition-all group border border-white/5">
                  <svg class="w-5 h-5 opacity-70 group-hover:opacity-100" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="#" class="w-10 h-10 rounded-sm bg-white/5 flex items-center justify-center hover:bg-[#25D366] hover:text-white transition-all group border border-white/5">
                  <svg class="w-5 h-5 opacity-70 group-hover:opacity-100" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>

    <!-- PRIORITAS 2: Tampilkan Arsip Kategori (Jika tidak ada postingan tunggal) -->
    <template v-else-if="currentCategory">
      <div class="mb-8">
        <h1 class="text-xl md:text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none mb-3">{{ currentCategory.name }}</h1>
        <div class="w-16 h-1.5 bg-[#fecb00] rounded-sm"></div>
        <p class="mt-3 text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Arsip Kategori: {{ currentCategory.name }}</p>
      </div>

      <div v-if="pending" class="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div v-for="i in 6" :key="i" class="h-96 bg-slate-100 animate-pulse rounded-sm"></div>
      </div>

      <div v-else-if="categoryData?.data?.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-12">
        <NuxtLink v-for="post in categoryData.data" :key="post.ID" :to="`/berita/${post.slug}`" class="group flex flex-col h-full bg-white rounded-sm overflow-hidden border border-slate-100 hover:border-[#01803d]/50 hover:shadow-2xl transition-all duration-500">
          <div class="aspect-video relative overflow-hidden">
            <img :src="post.featured_image_url || 'https://via.placeholder.com/600x400?text=BAZNAS+Berita'" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
          </div>
          <div class="p-5 flex flex-col flex-1">
            <div class="flex items-center gap-3 mb-3">
              <span class="text-[8px] font-black text-[#fecb00] uppercase tracking-widest px-2 py-0.5 bg-[#fecb00]/10 rounded-sm">BERITA</span>
              <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                {{ post.post_date ? new Date(post.post_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Terbaru' }}
              </span>
            </div>
            <h3 class="text-base font-bold mb-3 line-clamp-2 leading-tight group-hover:text-[#01803d] transition-colors uppercase tracking-tighter">{{ post.post_title }}</h3>
            <div class="text-slate-500 text-[11px] line-clamp-3 mb-4 font-medium leading-relaxed" v-html="post.post_content"></div>
            <div class="mt-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#01803d] group-hover:gap-4 transition-all">
              Selengkapnya <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </div>
          </div>
        </NuxtLink>
      </div>

      <div v-else class="text-center py-40 bg-emerald-50/30 rounded-sm border-2 border-dashed border-emerald-100 animate-pulse">
        <div class="max-w-md mx-auto space-y-8">
          <div class="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <svg class="w-12 h-12 text-[#01803d]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2zM14 2v4h4M7 9h10M7 13h10M7 17h10"/></svg>
          </div>
          <div class="space-y-4">
            <h2 class="text-3xl font-black text-[#01803d] uppercase tracking-tighter">Belum Ada Informasi</h2>
            <p class="text-slate-500 text-sm font-medium leading-relaxed italic">Mohon maaf, saat ini belum ada konten yang tersedia untuk kategori "{{ slug }}". Tim kami sedang menyiapkan informasi terbaru untuk Anda.</p>
          </div>
          <NuxtLink to="/" class="inline-block bg-[#01803d] text-white px-8 py-3 rounded-sm font-black text-xs uppercase tracking-widest hover:bg-[#016932] transition-all shadow-lg shadow-emerald-500/20">Kembali ke Beranda</NuxtLink>
        </div>
      </div>
    </template>

    <!-- PRIORITAS 3: 404 jika tidak ada keduanya -->
    <div v-else class="text-center py-40">
       <h2 class="text-2xl font-black text-slate-300 uppercase tracking-widest">Halaman Tidak Ditemukan</h2>
       <NuxtLink to="/" class="text-xs font-black text-[#01803d] uppercase tracking-widest hover:underline mt-4 inline-block">Kembali ke Beranda</NuxtLink>
    </div>

  </div>
</template>
