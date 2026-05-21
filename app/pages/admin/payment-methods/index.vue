<script setup>
definePageMeta({
  layout: 'admin'
})

import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Edit3, 
  Save,
  X,
  Building2,
  QrCode
} from 'lucide-vue-next'

import Swal from 'sweetalert2'

const { data: methods, refresh, pending } = await useFetch('/api/v1/payment-methods')

const showModal = ref(false)
const isEdit = ref(false)
const isUploading = ref(false)
const form = reactive({
  id: null,
  name: '',
  account_number: '',
  account_name: '',
  description: '',
  type: 'transfer',
  is_active: 1,
  admin_fee: 0,
  icon_url: ''
})

const openAdd = () => {
  isEdit.value = false
  Object.assign(form, { id: null, name: '', account_number: '', account_name: '', description: '', type: 'transfer', is_active: 1, admin_fee: 0, icon_url: '' })
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
  formData.append('folder', 'payment-methods')
  
  try {
    const res = await $fetch('/api/v1/upload', { method: 'POST', body: formData })
    form.icon_url = res.url
  } catch (error) {
    Swal.fire('Gagal!', 'Gagal mengupload logo', 'error')
  } finally {
    isUploading.value = false
    e.target.value = ''
  }
}

const saveMethod = async () => {
  try {
    if (isEdit.value) {
      await $fetch(`/api/v1/payment-methods/${form.id}`, { method: 'PUT', body: form })
    } else {
      await $fetch('/api/v1/payment-methods', { method: 'POST', body: form })
    }
    showModal.value = false
    refresh()
    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Metode pembayaran berhasil disimpan',
      timer: 1500,
      showConfirmButton: false
    })
  } catch (error) {
    Swal.fire('Gagal!', 'Gagal menyimpan data metode pembayaran', 'error')
  }
}

const deleteMethod = async (id) => {
  const result = await Swal.fire({
    title: 'Hapus metode pembayaran?',
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
      await $fetch(`/api/v1/payment-methods/${id}`, { method: 'DELETE' })
      refresh()
      Swal.fire({
        icon: 'success',
        title: 'Terhapus!',
        text: 'Metode pembayaran berhasil dihapus.',
        timer: 1500,
        showConfirmButton: false
      })
    } catch (error) {
      Swal.fire('Gagal!', 'Gagal menghapus data', 'error')
    }
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto">
    <div class="mb-8 flex justify-between items-end">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 mb-1">Metode Pembayaran</h1>
        <p class="text-sm text-slate-500 italic">Kelola rekening bank dan payment gateway untuk donasi.</p>
      </div>
      <button @click="openAdd" class="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-sm font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-sm shadow-emerald-700/20">
        <Plus class="w-4 h-4" /> Tambah Metode
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="item in methods" :key="item.id" class="bg-white border border-slate-200 rounded-sm shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div class="h-2 w-full absolute top-0 left-0" :class="item.is_active ? 'bg-emerald-500' : 'bg-slate-300'"></div>
        
        <div class="p-6">
          <div class="flex justify-between items-start mb-4">
            <div class="w-12 h-12 rounded-sm flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden" :class="item.type === 'qris' ? 'bg-blue-50' : 'bg-emerald-50'">
              <img v-if="item.icon_url" :src="item.icon_url" class="w-full h-full object-contain p-1 bg-white" />
              <template v-else>
                <QrCode v-if="item.type === 'qris'" class="w-6 h-6 text-blue-600" />
                <Building2 v-else class="w-6 h-6 text-emerald-600" />
              </template>
            </div>
            <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button @click="openEdit(item)" class="p-1.5 text-slate-400 hover:text-emerald-600 bg-slate-50 rounded-sm"><Edit3 class="w-4 h-4" /></button>
              <button @click="deleteMethod(item.id)" class="p-1.5 text-slate-400 hover:text-red-600 bg-slate-50 rounded-sm"><Trash2 class="w-4 h-4" /></button>
            </div>
          </div>
          
          <h3 class="font-black text-lg text-slate-800 tracking-tight">{{ item.name }}</h3>
          <p class="text-xs font-bold text-slate-500 mb-4">{{ item.account_number || '-' }} a.n {{ item.account_name || '-' }}</p>
          
          <div class="space-y-1.5">
            <div class="flex justify-between text-[10px] font-bold uppercase tracking-widest">
              <span class="text-slate-400">Tipe</span>
              <span class="text-slate-700">{{ item.type }}</span>
            </div>
            <div class="flex justify-between text-[10px] font-bold uppercase tracking-widest">
              <span class="text-slate-400">Biaya Admin</span>
              <span class="text-slate-700">Rp {{ item.admin_fee }}</span>
            </div>
            <div class="flex justify-between text-[10px] font-bold uppercase tracking-widest">
              <span class="text-slate-400">Status</span>
              <span :class="item.is_active ? 'text-emerald-600' : 'text-slate-400'">{{ item.is_active ? 'AKTIF' : 'NON-AKTIF' }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="!methods || methods.length === 0" class="col-span-full py-16 text-center border border-dashed border-slate-300 rounded-sm">
        <CreditCard class="w-12 h-12 text-slate-200 mx-auto mb-3" />
        <p class="text-sm font-bold text-slate-500">Belum ada metode pembayaran.</p>
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div class="bg-white w-full max-w-lg rounded-sm shadow-2xl overflow-hidden border border-slate-200">
         <div class="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
           <h3 class="font-black text-xs uppercase tracking-widest text-slate-800">{{ isEdit ? 'Edit' : 'Tambah' }} Metode Pembayaran</h3>
           <button @click="showModal = false" class="text-slate-400 hover:text-red-500"><X class="w-4 h-4"/></button>
         </div>
         <div class="p-6 grid grid-cols-2 gap-4">
           <div class="col-span-2 md:col-span-1">
             <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Nama Bank / e-Wallet</label>
             <input v-model="form.name" type="text" class="w-full border border-slate-200 p-2 rounded-sm text-sm outline-none focus:border-emerald-500 font-bold" placeholder="Misal: Bank BSI / QRIS">
           </div>
           <div class="col-span-2 md:col-span-1">
             <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Tipe</label>
             <select v-model="form.type" class="w-full border border-slate-200 p-2 rounded-sm text-sm outline-none focus:border-emerald-500 font-bold">
               <option value="transfer">Transfer Bank (Manual)</option>
               <option value="qris">QRIS</option>
               <option value="payment_gateway">Payment Gateway (Midtrans)</option>
             </select>
           </div>
           <div class="col-span-2 md:col-span-1">
             <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">No. Rekening</label>
             <input v-model="form.account_number" type="text" class="w-full border border-slate-200 p-2 rounded-sm text-sm outline-none focus:border-emerald-500 font-bold" placeholder="1234567890">
           </div>
           <div class="col-span-2 md:col-span-1">
             <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Atas Nama</label>
             <input v-model="form.account_name" type="text" class="w-full border border-slate-200 p-2 rounded-sm text-sm outline-none focus:border-emerald-500 font-bold" placeholder="BAZNAS">
           </div>
           <div class="col-span-2">
             <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Deskripsi / Instruksi</label>
             <textarea v-model="form.description" class="w-full border border-slate-200 p-2 rounded-sm text-sm outline-none focus:border-emerald-500 font-bold" rows="2" placeholder="Instruksi transfer..."></textarea>
           </div>
           <div class="col-span-2 md:col-span-1">
             <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Biaya Admin (Rp)</label>
             <input v-model="form.admin_fee" type="number" class="w-full border border-slate-200 p-2 rounded-sm text-sm outline-none focus:border-emerald-500 font-bold">
           </div>
           <div class="col-span-2 md:col-span-1">
             <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Status</label>
             <select v-model="form.is_active" class="w-full border border-slate-200 p-2 rounded-sm text-sm outline-none focus:border-emerald-500 font-bold">
               <option :value="1">Aktif</option>
               <option :value="0">Non-Aktif</option>
             </select>
           </div>
           <div class="col-span-2">
             <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block flex justify-between">
               <span>Logo / Icon (Opsional)</span>
               <span v-if="isUploading" class="text-emerald-500 animate-pulse">Mengupload...</span>
             </label>
             <input type="file" @change="handleFileUpload" accept="image/*" class="w-full border border-slate-200 p-2 rounded-sm text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-sm file:border-0 file:text-[10px] file:uppercase file:font-black file:tracking-widest file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer outline-none text-slate-500">
             <div v-if="form.icon_url" class="mt-2 p-2 border border-slate-200 rounded-sm bg-slate-50 w-fit relative group">
               <img :src="form.icon_url" class="h-8 object-contain" />
               <button @click="form.icon_url = ''" class="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X class="w-3 h-3"/></button>
             </div>
           </div>
         </div>
         <div class="p-5 border-t border-slate-100 bg-slate-50 flex justify-end">
           <button @click="saveMethod" class="bg-emerald-700 text-white px-6 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
             <Save class="w-4 h-4"/> Simpan
           </button>
         </div>
      </div>
    </div>
  </div>
</template>
