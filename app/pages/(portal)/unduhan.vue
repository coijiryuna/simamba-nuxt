<script setup>
const { data: downloadsRes } = await useFetch('/api/v1/downloads')
const downloads = computed(() => downloadsRes.value?.data || [])

useSeoMeta({
  title: 'Pusat Unduhan - BAZNAS Kabupaten Tangerang',
  description: 'Akses laporan keuangan, laporan tahunan, dan formulir resmi BAZNAS Kabupaten Tangerang secara transparan.',
  ogTitle: 'Pusat Unduhan Dokumen BAZNAS Kabupaten Tangerang',
  ogImage: '/logo.png'
})

import { 
  Download, 
  FileText, 
  ExternalLink,
  Search,
  Calendar,
  FileCheck
} from 'lucide-vue-next'

const searchQuery = ref('')
const selectedCategory = ref('Semua')

const categories = computed(() => {
  const cats = ['Semua', ...new Set(downloads.value.map(d => d.file_category))]
  return cats
})

const filteredDownloads = computed(() => {
  return downloads.value.filter(d => {
    const matchSearch = d.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchCat = selectedCategory.value === 'Semua' || d.file_category === selectedCategory.value
    return matchSearch && matchCat
  })
})

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}
</script>

<template>
  <div class="bg-slate-50 min-h-screen py-12">
    <div class="max-w-7xl mx-auto px-4">
      <div class="mb-12">
        <h1 class="text-xl md:text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none mb-4">Pusat Unduhan</h1>
        <div class="w-20 h-2 bg-[#fecb00] rounded-sm mb-6"></div>
        <p class="text-slate-500 font-medium uppercase tracking-[0.3em] text-[10px]">Transparansi & Akuntabilitas BAZNAS Kabupaten Tangerang</p>
      </div>

      <!-- Filter & Search -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div class="md:col-span-2 relative">
          <Search class="absolute left-4 top-4 w-5 h-5 text-slate-300" />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Cari judul dokumen atau laporan..." 
            class="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-sm focus:outline-none focus:border-[#01803d] shadow-sm font-bold text-sm"
          >
        </div>
        <select 
          v-model="selectedCategory"
          class="w-full px-6 py-4 bg-white border border-slate-200 rounded-sm focus:outline-none focus:border-[#01803d] shadow-sm font-bold text-sm"
        >
          <option v-for="cat in categories" :key="cat">{{ cat }}</option>
        </select>
      </div>

      <!-- Download Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div 
          v-for="item in filteredDownloads" 
          :key="item.id"
          class="bg-white rounded-sm border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col"
        >
          <div class="p-8 flex-1">
            <div class="flex justify-between items-start mb-6">
              <div class="p-3 bg-emerald-50 text-[#01803d] rounded-sm group-hover:scale-110 transition-transform">
                <FileText v-if="item.file_category === 'Laporan'" class="w-6 h-6" />
                <FileCheck v-else-if="item.file_category === 'Formulir'" class="w-6 h-6" />
                <Download v-else class="w-6 h-6" />
              </div>
              <span class="text-[9px] font-black uppercase tracking-widest text-slate-300">{{ item.file_category }}</span>
            </div>
            
            <h3 class="text-lg font-black text-slate-800 uppercase leading-tight mb-3 group-hover:text-[#01803d] transition-colors">
              {{ item.title }}
            </h3>
            <p class="text-xs text-slate-500 leading-relaxed italic mb-6">
              {{ item.description || 'Tidak ada deskripsi tambahan.' }}
            </p>
            
            <div class="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              <Calendar class="w-3 h-3" />
              Dipublikasi: {{ formatDate(item.created_at) }}
            </div>
          </div>
          
          <a 
            :href="item.file_url" 
            target="_blank"
            class="block p-5 bg-slate-50 border-t border-slate-100 text-center text-[10px] font-black uppercase tracking-[0.2em] text-[#01803d] hover:bg-[#01803d] hover:text-white transition-all"
          >
            Unduh Dokumen Sekarang
          </a>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredDownloads.length === 0" class="py-32 text-center">
        <div class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 opacity-30">
          <Download class="w-10 h-10 text-slate-400" />
        </div>
        <h3 class="text-sm font-black text-slate-400 uppercase tracking-widest">Dokumen Tidak Ditemukan</h3>
        <p class="text-[10px] font-medium text-slate-400 mt-2">Coba gunakan kata kunci lain atau pilih kategori yang berbeda.</p>
      </div>
    </div>
  </div>
</template>
