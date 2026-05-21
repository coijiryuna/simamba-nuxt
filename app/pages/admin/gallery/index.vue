<script setup>
definePageMeta({
  layout: 'admin'
})

import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Edit3, 
  Search,
  Grid,
  List
} from 'lucide-vue-next'

import Swal from 'sweetalert2'

const { data: gallery, refresh } = await useFetch('/api/v1/gallery')

const viewMode = ref('grid')
const searchQuery = ref('')

const filteredGallery = computed(() => {
  if (!searchQuery.value) return gallery.value
  return gallery.value?.filter(item => 
    item.caption?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const deleteItem = async (id) => {
  const result = await Swal.fire({
    title: 'Hapus foto?',
    text: "Foto yang dihapus tidak bisa dikembalikan.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#047857',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  })

  if (result.isConfirmed) {
    try {
      await $fetch(`/api/v1/gallery/${id}`, { method: 'DELETE' })
      refresh()
      Swal.fire({
        icon: 'success',
        title: 'Terhapus!',
        text: 'Foto berhasil dihapus.',
        timer: 1500,
        showConfirmButton: false
      })
    } catch (err) {
      Swal.fire('Gagal!', 'Gagal menghapus foto', 'error')
    }
  }
}
</script>

<template>
  <div>
    <div class="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 mb-1">Galeri Foto</h1>
        <p class="text-sm text-slate-500 italic">Dokumentasi kegiatan dan penyaluran BAZNAS Kabupaten Tangerang.</p>
      </div>
      <div class="flex items-center gap-2">
        <div class="relative">
          <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Cari foto..." 
            class="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-sm text-sm focus:border-emerald-600 outline-none w-64 shadow-sm" 
          />
        </div>
        <div class="flex border border-slate-200 rounded-sm overflow-hidden shadow-sm bg-white">
          <button @click="viewMode = 'grid'" :class="[viewMode === 'grid' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:text-slate-600']" class="p-2 transition-all border-r border-slate-100">
            <Grid class="w-4 h-4" />
          </button>
          <button @click="viewMode = 'list'" :class="[viewMode === 'list' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:text-slate-600']" class="p-2 transition-all">
            <List class="w-4 h-4" />
          </button>
        </div>
        <NuxtLink to="/admin/gallery/new" class="bg-[#fecb00] hover:bg-yellow-500 text-slate-900 px-4 py-2 rounded-sm font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm">
          <Plus class="w-4 h-4" /> Tambah Foto
        </NuxtLink>
      </div>
    </div>

    <!-- Grid View -->
    <div v-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="item in filteredGallery" :key="item.id" class="group bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-all">
        <div class="aspect-square relative overflow-hidden bg-slate-100">
          <img :src="item.images_url" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <NuxtLink :to="`/admin/gallery/${item.id}`" class="p-2 bg-white text-slate-700 rounded-sm hover:bg-emerald-600 hover:text-white transition-all shadow-lg">
              <Edit3 class="w-4 h-4" />
            </NuxtLink>
            <button @click="deleteItem(item.id)" class="p-2 bg-white text-red-600 rounded-sm hover:bg-red-600 hover:text-white transition-all shadow-lg">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
        <div class="p-4">
          <p class="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1">{{ item.category }}</p>
          <h4 class="font-bold text-slate-800 text-sm line-clamp-1">{{ item.caption }}</h4>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!gallery || gallery.length === 0" class="bg-white border border-slate-200 rounded-sm p-16 text-center shadow-sm">
      <ImageIcon class="w-16 h-16 text-slate-100 mx-auto mb-4" />
      <h3 class="text-slate-400 font-black uppercase tracking-widest">Belum ada koleksi foto</h3>
      <p class="text-xs text-slate-400 mt-1">Mulai upload foto kegiatan BAZNAS pertama kamu.</p>
    </div>
  </div>
</template>
