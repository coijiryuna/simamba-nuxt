<script setup>
import { Search as SearchIcon } from 'lucide-vue-next'

definePageMeta({
  layout: 'default'
})

const route = useRoute()
const allPosts = ref([])
const currentPage = ref(1)
const itemsPerPage = 6
const hasMore = ref(true)
const loadMorePending = ref(false) // Untuk loading scroll (tambah data)
const isSearching = ref(false)    // Untuk loading pencarian baru (reset data)
const observerTarget = ref(null)

// Ambil kata kunci dari URL jika ada (misal: /berita?search=zakat)
const search = ref(route.query.search || '')

// Fetch awal menggunakan useFetch untuk SSR
const { data: initialData, pending } = await useFetch('/api/news', {
  query: { page: 1, limit: itemsPerPage, search: search.value, type:'program' }
})

// Inisialisasi data awal
watchEffect(() => {
  if (initialData.value) {
    allPosts.value = initialData.value.data || []
    hasMore.value = allPosts.value.length < (initialData.value.total || 0)
  }
})

// Fungsi untuk memuat data selanjutnya
const loadMore = async () => {
  if (loadMorePending.value || !hasMore.value) return

  loadMorePending.value = true
  currentPage.value++

  try {
    const response = await $fetch('/api/news', {
      query: { page: currentPage.value, limit: itemsPerPage, search: search.value }
    })

    if (response.data && response.data.length > 0) {
      allPosts.value.push(...response.data)
    }

    // Cek apakah masih ada data lagi di server
    hasMore.value = allPosts.value.length < (response.total || 0)
  } catch (error) {
    console.error('Error loading more posts:', error)
  } finally {
    loadMorePending.value = false
  }
}

// Watcher untuk pencarian dengan debounce
let searchTimeout = null
watch(search, (newSearch) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    currentPage.value = 1
    isSearching.value = true
    try {
      const response = await $fetch('/api/news', {
        query: { page: 1, limit: itemsPerPage, search: newSearch }
      })
      allPosts.value = response.data || []
      hasMore.value = allPosts.value.length < (response.total || 0)
    } catch (error) {
      console.error('Error searching posts:', error)
    } finally {
      isSearching.value = false
    }
  }, 500)
})

// Setup Intersection Observer
onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && hasMore.value && !pending.value) {
      loadMore()
    }
  }, { threshold: 0.5 })

  if (observerTarget.value) {
    observer.observe(observerTarget.value)
  }
})

useSeoMeta({
  title: 'Berita - BAZNAS Kabupaten Tangerang',
  description: 'Kumpulan berita, informasi, dan kabar terkini seputar kegiatan, program, dan inisiatif BAZNAS Kabupaten Tangerang.',
  ogImage: '/logo.png'
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-4">
    <div class="flex justify-between items-center gap-4 mb-8">
      <div>
        <h1 class="text-xl md:text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none mb-2 ">Kabar
          BAZNAS</h1>
        <div class="w-32 h-2 bg-[#fecb00] rounded-sm"></div>
        <p class="mt-6 text-slate-500 font-medium uppercase tracking-[0.3em] text-xs">Arsip Berita & Informasi Terkini
        </p>
      </div>
      <!-- Pencarian -->
      <div>
        <input v-model="search" type="text" placeholder="Cari berita..."
          class="w-auto border border-slate-600 rounded-sm py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#01803d] transition-all" />
      </div>
    </div>

    <!-- Skeleton saat memuat data awal atau sedang mencari -->
    <div v-if="pending || isSearching" class="grid grid-cols-1 md:grid-cols-3 gap-12">
      <div v-for="i in 6" :key="i" class="h-96 bg-slate-100 animate-pulse rounded-sm"></div>
    </div>

    <!-- Pesan jika hasil pencarian kosong -->
    <div v-else-if="allPosts.length === 0"
      class="text-center py-32 bg-slate-50 rounded-sm border border-dashed border-slate-200">
      <div class="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-sm mb-6">
        <SearchIcon class="w-10 h-10 text-slate-300" />
      </div>
      <h2 class="text-2xl font-black text-slate-800 uppercase tracking-tight">Berita Tidak Ditemukan</h2>
      <p class="text-sm text-slate-500 mt-2 max-w-sm mx-auto font-medium">
        Maaf, kami tidak menemukan berita yang cocok dengan kata kunci <span class="text-slate-900 font-bold">"{{ search
        }}"</span>.
      </p>
      <button @click="search = ''"
        class="mt-8 px-8 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-[#01803d] transition-all shadow-lg active:scale-95">
        Tampilkan Semua Berita
      </button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-12">
      <NuxtLink v-for="post in allPosts" :key="post.ID" :to="`/program/${post.slug}`"
        class="group flex flex-col h-auto bg-white rounded-sm overflow-hidden border border-slate-100 hover:border-[#01803d]/50 hover:shadow-2xl transition-all duration-500">
        <div class="aspect-video relative overflow-hidden">
          <img :src="post.featured_image_url || 'https://via.placeholder.com/600x400?text=BAZNAS+Berita'"
            class="w-auto h-auto object-cover group-hover:scale-110 transition-transform duration-1000" />
        </div>
        <div class="p-8 flex flex-col flex-1">
          <div class="flex items-center gap-4 mb-4">
            <span
              class="text-[9px] font-black text-[#fecb00] uppercase tracking-widest px-2 py-0.5 bg-[#fecb00]/10 rounded-sm">{{ post.post_type }}</span>
            <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              {{ post.post_date ? new Date(post.post_date).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'short',
                year: 'numeric'
              }) : 'Terbaru' }}
            </span>
          </div>
          <h3 class="text-xl font-bold mb-4 line-clamp-2 leading-tight group-hover:text-[#01803d] transition-colors">{{
            post.post_title }}</h3>
          <div class="text-slate-500 text-sm line-clamp-3 mb-6" v-html="post.post_content"></div>
          <div
            class="mt-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#01803d] group-hover:gap-4 transition-all">
            Baca Selengkapnya <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- Penanda untuk memicu load more -->
    <div ref="observerTarget" class="py-12 flex justify-center">
      <div v-if="loadMorePending" class="flex flex-col items-center gap-2">
        <div class="w-8 h-8 border-4 border-[#01803d] border-t-transparent rounded-full animate-spin"></div>
        <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Memuat Berita Lainnya...</p>
      </div>
      <p v-else-if="!hasMore && allPosts.length > 0"
        class="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Semua berita telah ditampilkan</p>
    </div>
  </div>
</template>
