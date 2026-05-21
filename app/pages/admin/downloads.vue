<script setup>
definePageMeta({
  layout: 'admin'
})

import { 
  Download, 
  Plus, 
  Trash2, 
  Edit, 
  ExternalLink, 
  FileText,
  Upload,
  Link as LinkIcon
} from 'lucide-vue-next'
import Swal from 'sweetalert2'

const { data: downloadsRes, refresh } = await useFetch('/api/v1/downloads')
const downloads = computed(() => downloadsRes.value?.data || [])

const uniqueCategories = computed(() => {
  const cats = [...new Set(downloads.value.map(item => item.file_category))]
  // Ensure default ones are included if not present
  const defaults = ['Laporan', 'Formulir', 'Regulasi']
  return [...new Set([...defaults, ...cats])]
})

const isModalOpen = ref(false)
const isSubmitting = ref(false)
const isUploading = ref(false)

const form = ref({
  id: null,
  title: '',
  description: '',
  file_url: '',
  file_category: 'Laporan'
})

const openModal = (item = null) => {
  if (item) {
    form.value = { ...item }
  } else {
    form.value = {
      id: null,
      title: '',
      description: '',
      file_url: '',
      file_category: 'Laporan'
    }
  }
  isModalOpen.value = true
}

const onFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  isUploading.value = true
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', 'documents')

  try {
    const res = await $fetch('/api/v1/upload', {
      method: 'POST',
      body: formData
    })
    form.value.file_url = res.url
    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'File berhasil diunggah',
      timer: 2000,
      showConfirmButton: false
    })
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: 'Gagal mengunggah file'
    })
  } finally {
    isUploading.value = false
  }
}

const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    await $fetch('/api/v1/downloads', {
      method: 'POST',
      body: form.value
    })
    
    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Data unduhan berhasil disimpan',
      timer: 2000,
      showConfirmButton: false
    })
    
    isModalOpen.value = false
    refresh()
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: error.data?.statusMessage || 'Terjadi kesalahan'
    })
  } finally {
    isSubmitting.value = false
  }
}

const deleteItem = (id) => {
  Swal.fire({
    title: 'Apakah Anda yakin?',
    text: "Data yang dihapus tidak dapat dikembalikan!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await $fetch(`/api/v1/downloads?id=${id}`, { method: 'DELETE' })
        refresh()
        Swal.fire('Terhapus!', 'Data berhasil dihapus.', 'success')
      } catch (error) {
        Swal.fire('Gagal!', 'Terjadi kesalahan saat menghapus.', 'error')
      }
    }
  })
}
</script>

<template>
  <div class="max-w-7xl">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 mb-1">Pusat Unduhan</h1>
        <p class="text-sm text-slate-500 italic">Kelola file laporan, formulir, dan dokumen publik lainnya.</p>
      </div>
      <button 
        @click="openModal()"
        class="bg-[#01803d] text-white px-6 py-3 rounded-sm font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-[#016932] transition-all shadow-lg shadow-emerald-500/20"
      >
        <Plus class="w-4 h-4" /> Tambah File
      </button>
    </div>

    <div class="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-slate-50 border-b border-slate-200">
            <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori</th>
            <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Judul & Deskripsi</th>
            <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipe Link</th>
            <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="item in downloads" :key="item.id" class="hover:bg-slate-50/50 transition-colors group">
            <td class="px-6 py-4">
              <span class="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                {{ item.file_category }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm font-bold text-slate-800">{{ item.title }}</div>
              <div class="text-[11px] text-slate-400 italic truncate max-w-md">{{ item.description || '-' }}</div>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                <Upload v-if="item.file_url.includes('/upload/')" class="w-3 h-3 text-emerald-500" />
                <LinkIcon v-else class="w-3 h-3 text-blue-500" />
                {{ item.file_url.includes('/upload/') ? 'File Lokal' : 'External Link' }}
              </div>
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex justify-end gap-2">
                <a :href="item.file_url" target="_blank" class="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                  <ExternalLink class="w-4 h-4" />
                </a>
                <button @click="openModal(item)" class="p-2 text-slate-400 hover:text-emerald-600 transition-colors">
                  <Edit class="w-4 h-4" />
                </button>
                <button @click="deleteItem(item.id)" class="p-2 text-slate-400 hover:text-red-600 transition-colors">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="downloads.length === 0">
            <td colspan="4" class="px-6 py-20 text-center text-slate-300 italic">
              <Download class="w-12 h-12 mx-auto mb-4 opacity-10" />
              Belum ada file yang ditambahkan.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Form -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div class="bg-white w-full max-w-xl rounded-sm shadow-2xl overflow-hidden">
        <div class="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 class="font-black text-xs uppercase tracking-widest text-slate-800">{{ form.id ? 'Edit File' : 'Tambah File Baru' }}</h2>
          <button @click="isModalOpen = false" class="text-slate-400 hover:text-slate-600"><X class="w-6 h-6" /></button>
        </div>
        
        <form @submit.prevent="handleSubmit" class="p-8 space-y-6">
          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-1">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori</label>
              <input 
                v-model="form.file_category" 
                list="category-list"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm text-xs font-bold focus:outline-none focus:border-[#01803d]"
                placeholder="Pilih atau ketik baru..."
              >
              <datalist id="category-list">
                <option v-for="cat in uniqueCategories" :key="cat" :value="cat" />
              </datalist>
            </div>
            <div class="space-y-1">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Judul Dokumen</label>
              <input v-model="form.title" required type="text" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm text-xs font-bold focus:outline-none focus:border-[#01803d]" placeholder="Contoh: Laporan Tahunan 2023">
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deskripsi Singkat</label>
            <textarea v-model="form.description" rows="2" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm text-xs font-bold focus:outline-none focus:border-[#01803d]" placeholder="Keterangan singkat mengenai isi file..."></textarea>
          </div>

          <div class="space-y-3">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Sumber File</label>
            <div class="flex flex-col gap-4 p-4 bg-slate-50 border border-slate-200 rounded-sm">
               <!-- Upload Option -->
               <div class="flex items-center gap-4">
                  <div class="flex-1">
                    <p class="text-[10px] font-black text-slate-800 uppercase mb-1">Unggah File Langsung</p>
                    <input type="file" @change="onFileUpload" class="text-[10px] text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-[10px] file:font-black file:bg-[#01803d] file:text-white hover:file:bg-[#016932]" />
                  </div>
                  <div v-if="isUploading" class="animate-spin rounded-full h-4 w-4 border-2 border-[#01803d] border-t-transparent"></div>
               </div>
               
               <div class="relative">
                  <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-slate-200"></div></div>
                  <div class="relative flex justify-center text-[8px] font-black uppercase text-slate-400 bg-slate-50 px-2">ATAU</div>
               </div>

               <!-- Link Option -->
               <div class="space-y-1">
                 <p class="text-[10px] font-black text-slate-800 uppercase mb-1">Input Link Manual (G-Drive/Dll)</p>
                 <div class="flex gap-2">
                    <div class="flex-1 relative">
                       <LinkIcon class="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                       <input v-model="form.file_url" required type="url" class="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-sm text-xs font-bold focus:outline-none focus:border-[#01803d]" placeholder="https://drive.google.com/...">
                    </div>
                 </div>
               </div>
            </div>
          </div>

          <div class="flex gap-3 pt-4">
            <button 
              type="submit" 
              :disabled="isSubmitting || isUploading"
              class="flex-1 bg-[#01803d] text-white py-4 rounded-sm font-black text-[10px] uppercase tracking-widest hover:bg-[#016932] transition-all shadow-lg disabled:bg-slate-300"
            >
              {{ isSubmitting ? 'Menyimpan...' : 'Simpan Data' }}
            </button>
            <button 
              type="button"
              @click="isModalOpen = false"
              class="flex-1 bg-slate-100 text-slate-600 py-4 rounded-sm font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
