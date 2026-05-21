<script setup>
definePageMeta({
  layout: 'admin'
})

import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  Edit3, 
  Save,
  X,
  Star
} from 'lucide-vue-next'

import Swal from 'sweetalert2'

const { data: testimonials, refresh } = await useFetch('/api/v1/testimonials')

const showModal = ref(false)
const isEdit = ref(false)
const isUploading = ref(false)
const form = reactive({
  id: null, name: '', message: '', rating: 5, avatar_url: ''
})

const openAdd = () => {
  isEdit.value = false
  Object.assign(form, { id: null, name: '', message: '', rating: 5, avatar_url: '' })
  showModal.value = true
}

const openEdit = (item) => {
  isEdit.value = true
  Object.assign(form, item)
  showModal.value = true
}

const handleFileUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  
  isUploading.value = true
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', 'testimonials')
  
  try {
    const res = await $fetch('/api/v1/upload', { method: 'POST', body: formData })
    form.avatar_url = res.url
  } catch (error) {
    Swal.fire('Gagal!', 'Gagal mengupload avatar', 'error')
  } finally {
    isUploading.value = false
    e.target.value = ''
  }
}

const saveTestimonial = async () => {
  try {
    if (isEdit.value) {
      await $fetch(`/api/v1/testimonials/${form.id}`, { method: 'PUT', body: form })
    } else {
      await $fetch('/api/v1/testimonials', { method: 'POST', body: form })
    }
    showModal.value = false
    refresh()
    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Testimoni berhasil disimpan',
      timer: 1500,
      showConfirmButton: false
    })
  } catch (e) {
    Swal.fire('Gagal!', 'Gagal menyimpan testimoni', 'error')
  }
}

const deleteTestimonial = async (id) => {
  const result = await Swal.fire({
    title: 'Hapus testimoni?',
    text: "Data yang dihapus tidak bisa dikembalikan.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#047857',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  })

  if (result.isConfirmed) {
    try {
      await $fetch(`/api/v1/testimonials/${id}`, { method: 'DELETE' })
      refresh()
      Swal.fire({
        icon: 'success',
        title: 'Terhapus!',
        text: 'Testimoni berhasil dihapus.',
        timer: 1500,
        showConfirmButton: false
      })
    } catch (e) {
      Swal.fire('Gagal!', 'Gagal menghapus data', 'error')
    }
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto">
    <div class="mb-8 flex justify-between items-end">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 mb-1">Testimoni Donatur</h1>
        <p class="text-sm text-slate-500 italic">Kelola ulasan dan testimoni dari donatur untuk ditampilkan di web.</p>
      </div>
      <button @click="openAdd" class="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-sm font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-sm">
        <Plus class="w-4 h-4" /> Tambah Testimoni
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="item in testimonials" :key="item.id" class="bg-white border border-slate-200 rounded-sm shadow-sm p-6 relative group">
        <div class="flex justify-between items-start mb-4">
          <div class="flex items-center gap-3">
            <img v-if="item.avatar_url" :src="item.avatar_url" class="w-10 h-10 rounded-full object-cover border border-slate-200" />
            <div v-else class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
              {{ item.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <h3 class="font-bold text-slate-800 text-sm">{{ item.name }}</h3>
              <div class="flex gap-0.5 mt-0.5">
                <Star v-for="i in 5" :key="i" class="w-3 h-3" :class="i <= item.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'" />
              </div>
            </div>
          </div>
          <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click="openEdit(item)" class="text-slate-400 hover:text-emerald-600"><Edit3 class="w-4 h-4" /></button>
            <button @click="deleteTestimonial(item.id)" class="text-slate-400 hover:text-red-600"><Trash2 class="w-4 h-4" /></button>
          </div>
        </div>
        <p class="text-slate-600 text-sm italic">"{{ item.message }}"</p>
      </div>
      
      <div v-if="!testimonials?.length" class="col-span-full py-12 text-center border border-dashed border-slate-300 rounded-sm">
        <MessageSquare class="w-12 h-12 text-slate-200 mx-auto mb-3" />
        <p class="text-sm font-bold text-slate-500">Belum ada testimoni.</p>
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div class="bg-white w-full max-w-md rounded-sm shadow-2xl overflow-hidden border border-slate-200">
         <div class="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
           <h3 class="font-black text-xs uppercase tracking-widest text-slate-800">{{ isEdit ? 'Edit' : 'Tambah' }} Testimoni</h3>
           <button @click="showModal = false" class="text-slate-400 hover:text-red-500"><X class="w-4 h-4"/></button>
         </div>
         <div class="p-6 space-y-4">
           <div>
             <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Nama Donatur</label>
             <input v-model="form.name" type="text" class="w-full border border-slate-200 p-2.5 rounded-sm text-sm outline-none focus:border-emerald-500 font-bold" placeholder="John Doe">
           </div>
           <div>
             <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Rating Bintang (1-5)</label>
             <input v-model="form.rating" type="number" min="1" max="5" class="w-full border border-slate-200 p-2.5 rounded-sm text-sm outline-none focus:border-emerald-500 font-bold">
           </div>
           <div>
             <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Pesan Testimoni</label>
             <textarea v-model="form.message" class="w-full border border-slate-200 p-2.5 rounded-sm text-sm outline-none focus:border-emerald-500" rows="3" placeholder="Sangat membantu..."></textarea>
           </div>
           <div>
             <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block flex justify-between">
               <span>Foto Profil / Avatar (Opsional)</span>
               <span v-if="isUploading" class="text-emerald-500 animate-pulse">Mengupload...</span>
             </label>
             <input type="file" @change="handleFileUpload" accept="image/*" class="w-full border border-slate-200 p-2 rounded-sm text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-sm file:border-0 file:text-[10px] file:uppercase file:font-black file:tracking-widest file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer outline-none text-slate-500">
             <div v-if="form.avatar_url" class="mt-2 h-16 w-16 overflow-hidden rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center relative group">
               <img :src="form.avatar_url" class="w-full h-full object-cover" />
               <button @click="form.avatar_url = ''" class="absolute inset-0 m-auto w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><X class="w-4 h-4"/></button>
             </div>
           </div>
         </div>
         <div class="p-5 border-t border-slate-100 bg-slate-50 flex justify-end">
           <button @click="saveTestimonial" class="bg-emerald-700 text-white px-6 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
             <Save class="w-4 h-4"/> Simpan
           </button>
         </div>
      </div>
    </div>
  </div>
</template>
