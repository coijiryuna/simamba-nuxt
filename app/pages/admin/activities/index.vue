<script setup>
definePageMeta({
  layout: 'admin'
})

import { 
  Activity, 
  Plus, 
  Trash2, 
  Edit3, 
  Save,
  X
} from 'lucide-vue-next'

import Swal from 'sweetalert2'

const { data: activities, refresh } = await useFetch('/api/v1/activities')
const { data: campaigns } = await useFetch('/api/v1/campaigns')

const showModal = ref(false)
const isEdit = ref(false)
const isUploading = ref(false)
const form = reactive({
  id: null, campaign_id: null, title: '', description: '', 
  activity_date: '', cost_used: 0, attachment_url: ''
})

const openAdd = () => {
  isEdit.value = false
  Object.assign(form, { id: null, campaign_id: null, title: '', description: '', activity_date: new Date().toISOString().slice(0,10), cost_used: 0, attachment_url: '' })
  showModal.value = true
}

const openEdit = (item) => {
  isEdit.value = true
  Object.assign(form, { ...item, activity_date: item.activity_date ? new Date(item.activity_date).toISOString().slice(0,10) : '' })
  showModal.value = true
}

const handleFileUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  
  isUploading.value = true
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', 'activities')
  
  try {
    const res = await $fetch('/api/v1/upload', { method: 'POST', body: formData })
    form.attachment_url = res.url
  } catch (error) {
    Swal.fire('Gagal!', 'Gagal mengupload lampiran', 'error')
  } finally {
    isUploading.value = false
    e.target.value = ''
  }
}

const saveActivity = async () => {
  try {
    if (isEdit.value) {
      await $fetch(`/api/v1/activities/${form.id}`, { method: 'PUT', body: form })
    } else {
      await $fetch('/api/v1/activities', { method: 'POST', body: form })
    }
    showModal.value = false
    refresh()
    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Laporan penyaluran berhasil disimpan',
      timer: 1500,
      showConfirmButton: false
    })
  } catch (e) {
    Swal.fire('Gagal!', 'Gagal menyimpan aktivitas', 'error')
  }
}

const deleteActivity = async (id) => {
  const result = await Swal.fire({
    title: 'Hapus laporan?',
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
      await $fetch(`/api/v1/activities/${id}`, { method: 'DELETE' })
      refresh()
      Swal.fire({
        icon: 'success',
        title: 'Terhapus!',
        text: 'Laporan berhasil dihapus.',
        timer: 1500,
        showConfirmButton: false
      })
    } catch (e) {
      Swal.fire('Gagal!', 'Gagal menghapus data', 'error')
    }
  }
}

const formatCurrency = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0)
const formatDate = (val) => new Date(val).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
</script>

<template>
  <div class="max-w-7xl mx-auto">
    <div class="mb-8 flex justify-between items-end">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 mb-1">Laporan Penyaluran</h1>
        <p class="text-sm text-slate-500 italic">Kelola dokumentasi penyaluran dana untuk setiap program.</p>
      </div>
      <button @click="openAdd" class="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-sm font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-sm">
        <Plus class="w-4 h-4" /> Tambah Laporan
      </button>
    </div>

    <div class="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-widest text-slate-500">
            <th class="p-4 font-black">Tanggal</th>
            <th class="p-4 font-black">Judul Aktivitas</th>
            <th class="p-4 font-black">Program (Campaign)</th>
            <th class="p-4 font-black text-right">Dana Disalurkan</th>
            <th class="p-4 font-black text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="text-sm">
          <tr v-for="item in activities" :key="item.id" class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
            <td class="p-4 text-slate-500">{{ formatDate(item.activity_date) }}</td>
            <td class="p-4 font-bold text-emerald-800">{{ item.title }}</td>
            <td class="p-4 text-slate-600">{{ item.campaign_title || 'Umum (Tidak terikat program)' }}</td>
            <td class="p-4 text-right font-black text-slate-700">{{ formatCurrency(item.cost_used) }}</td>
            <td class="p-4 text-center space-x-2">
              <button @click="openEdit(item)" class="text-emerald-600 hover:text-emerald-800"><Edit3 class="w-4 h-4 inline"/></button>
              <button @click="deleteActivity(item.id)" class="text-red-500 hover:text-red-700"><Trash2 class="w-4 h-4 inline"/></button>
            </td>
          </tr>
          <tr v-if="!activities?.length">
            <td colspan="5" class="p-8 text-center text-slate-400 italic">Belum ada laporan penyaluran.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Form -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div class="bg-white w-full max-w-5xl max-h-[90vh] rounded-sm shadow-2xl overflow-hidden border border-slate-200 flex flex-col">
         <div class="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
           <h3 class="font-black text-xs uppercase tracking-widest text-slate-800">{{ isEdit ? 'Edit' : 'Tambah' }} Laporan Penyaluran</h3>
           <button @click="showModal = false" class="text-slate-400 hover:text-red-500"><X class="w-4 h-4"/></button>
         </div>
         <div class="p-6 space-y-4 overflow-y-auto flex-1">
           <div>
             <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Program (Opsional)</label>
             <select v-model="form.campaign_id" class="w-full border border-slate-200 p-2.5 rounded-sm text-sm outline-none focus:border-emerald-500 font-bold">
               <option :value="null">- Pilih Program (Jika ada) -</option>
               <option v-for="c in campaigns" :key="c.id" :value="c.id">{{ c.title }}</option>
             </select>
           </div>
           <div>
             <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Judul Laporan</label>
             <input v-model="form.title" type="text" class="w-full border border-slate-200 p-2.5 rounded-sm text-sm outline-none focus:border-emerald-500 font-bold" placeholder="Misal: Penyaluran Bantuan Sembako">
           </div>
           <div class="grid grid-cols-2 gap-4">
             <div>
               <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Tanggal</label>
               <input v-model="form.activity_date" type="date" class="w-full border border-slate-200 p-2.5 rounded-sm text-sm outline-none focus:border-emerald-500 font-bold">
             </div>
             <div>
               <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Dana Disalurkan (Rp)</label>
               <input v-model="form.cost_used" type="number" class="w-full border border-slate-200 p-2.5 rounded-sm text-sm outline-none focus:border-emerald-500 font-bold">
             </div>
           </div>
           <div>
             <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Deskripsi Kegiatan</label>
             <AdminEditor v-model="form.description" />
           </div>
           <div>
             <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block flex justify-between">
               <span>Lampiran Foto Kegiatan (Opsional)</span>
               <span v-if="isUploading" class="text-emerald-500 animate-pulse">Mengupload...</span>
             </label>
             <input type="file" @change="handleFileUpload" accept="image/*" class="w-full border border-slate-200 p-2 rounded-sm text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-sm file:border-0 file:text-[10px] file:uppercase file:font-black file:tracking-widest file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer outline-none text-slate-500">
             <div v-if="form.attachment_url" class="mt-2 h-32 overflow-hidden rounded-sm border border-slate-200 bg-slate-50 flex items-center justify-center relative group">
               <img :src="form.attachment_url" class="w-full h-full object-cover" />
               <button @click="form.attachment_url = ''" class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X class="w-4 h-4"/></button>
             </div>
           </div>
         </div>
         <div class="p-5 border-t border-slate-100 bg-slate-50 flex justify-end">
           <button @click="saveActivity" class="bg-emerald-700 text-white px-6 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
             <Save class="w-4 h-4"/> Simpan
           </button>
         </div>
      </div>
    </div>
  </div>
</template>
