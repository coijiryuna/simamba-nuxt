<script setup>
definePageMeta({
  layout: 'admin'
})

import { 
  FolderHeart, 
  Megaphone,
  Plus, 
  Trash2, 
  Edit3, 
  Save,
  X,
  ChevronRight,
  TrendingUp
} from 'lucide-vue-next'

import Swal from 'sweetalert2'

const { data: categories, refresh: refreshCategories } = await useFetch('/api/v1/campaign-categories')
const { data: allCampaigns, refresh: refreshCampaigns } = await useFetch('/api/v1/campaigns')

const selectedCategory = ref(null)
const isUploading = ref(false)

// Campaigns filtered by category
const campaigns = computed(() => {
  if (!selectedCategory.value) return []
  return allCampaigns.value?.filter(c => c.category_id === selectedCategory.value.id) || []
})

// === MODAL KATEGORI ===
const showCatModal = ref(false)
const catForm = reactive({ id: null, name: '', description: '', categories_type: 'donasi', is_active: 1 })

const openAddCat = () => {
  Object.assign(catForm, { id: null, name: '', description: '', categories_type: 'donasi', is_active: 1 })
  showCatModal.value = true
}

const openEditCat = (item) => {
  Object.assign(catForm, item)
  showCatModal.value = true
}

const saveCategory = async () => {
  try {
    if (catForm.id) {
      await $fetch(`/api/v1/campaign-categories/${catForm.id}`, { method: 'PUT', body: catForm })
    } else {
      await $fetch('/api/v1/campaign-categories', { method: 'POST', body: catForm })
    }
    showCatModal.value = false
    refreshCategories()
    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Kategori berhasil disimpan',
      timer: 1500,
      showConfirmButton: false
    })
  } catch (e) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Gagal menyimpan kategori'
    })
  }
}

const deleteCategory = async (id) => {
  const result = await Swal.fire({
    title: 'Hapus kategori?',
    text: "Pastikan tidak ada program di dalamnya.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#047857',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  })

  if (result.isConfirmed) {
    try {
      await $fetch(`/api/v1/campaign-categories/${id}`, { method: 'DELETE' })
      refreshCategories()
      if (selectedCategory.value?.id === id) selectedCategory.value = null
      Swal.fire({
        icon: 'success',
        title: 'Terhapus!',
        text: 'Kategori berhasil dihapus.',
        timer: 1500,
        showConfirmButton: false
      })
    } catch (e) {
      Swal.fire('Gagal!', 'Gagal menghapus kategori.', 'error')
    }
  }
}

// === MODAL CAMPAIGN ===
const showCampModal = ref(false)
const campForm = reactive({
  id: null, category_id: null, title: '', 
  description: '', full_description: '', specifications: '',
  weight: '', age: '', health: '',
  target_amount: 0, default_amount: 0,
  start_date: '', end_date: '',
  status: 'active', cover_image_url: '',
  unit: '', is_multiple: 1, available_slots: 0,
  booked_slots: 0, remaining_slots: 0,
  default: 0, image_url: ''
})

const openAddCamp = () => {
  Object.assign(campForm, {
    id: null, category_id: selectedCategory.value?.id, title: '', 
    description: '', full_description: '', specifications: '',
    weight: '', age: '', health: '',
    target_amount: 0, default_amount: 0,
    start_date: '', end_date: '',
    status: 'active', cover_image_url: '',
    unit: '', is_multiple: 1, available_slots: 0,
    booked_slots: 0, remaining_slots: 0,
    default: 0, image_url: ''
  })
  showCampModal.value = true
}

const openEditCamp = (item) => {
  Object.assign(campForm, item)
  showCampModal.value = true
}

const handleFileUpload = async (e, field = 'cover_image_url') => {
  const file = e.target.files[0]
  if (!file) return
  
  isUploading.value = true
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', 'campaigns')
  
  try {
    const res = await $fetch('/api/v1/upload', { method: 'POST', body: formData })
    campForm[field] = res.url
  } catch (error) {
    Swal.fire('Gagal!', 'Gagal mengupload foto.', 'error')
  } finally {
    isUploading.value = false
    e.target.value = ''
  }
}

const saveCampaign = async () => {
  try {
    if (campForm.id) {
      await $fetch(`/api/v1/campaigns/${campForm.id}`, { method: 'PUT', body: campForm })
    } else {
      await $fetch('/api/v1/campaigns', { method: 'POST', body: campForm })
    }
    showCampModal.value = false
    refreshCampaigns()
    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Program berhasil disimpan',
      timer: 1500,
      showConfirmButton: false
    })
  } catch (e) {
    Swal.fire('Gagal!', 'Gagal menyimpan program.', 'error')
  }
}

const deleteCampaign = async (id) => {
  const result = await Swal.fire({
    title: 'Hapus program?',
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
      await $fetch(`/api/v1/campaigns/${id}`, { method: 'DELETE' })
      refreshCampaigns()
      Swal.fire({
        icon: 'success',
        title: 'Terhapus!',
        text: 'Program berhasil dihapus.',
        timer: 1500,
        showConfirmButton: false
      })
    } catch (e) {
      Swal.fire('Gagal!', 'Gagal menghapus program.', 'error')
    }
  }
}

const formatCurrency = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0)
</script>

<template>
  <div class="max-w-7xl mx-auto">
    <div class="mb-8 flex justify-between items-end">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 mb-1">Manajemen Program Donasi</h1>
        <p class="text-sm text-slate-500 italic">Atur kategori dan daftar program kampanye untuk donatur.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      <!-- Kiri: Kategori -->
      <div class="lg:col-span-4 space-y-4">
        <div class="flex items-center justify-between bg-white p-4 border border-slate-200 rounded-sm shadow-sm">
          <h2 class="font-bold text-slate-800 text-sm uppercase tracking-widest flex items-center gap-2">
            <FolderHeart class="w-4 h-4 text-emerald-600" /> Kategori Program
          </h2>
          <button @click="openAddCat" class="bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white p-1.5 rounded-sm transition-colors">
            <Plus class="w-4 h-4" />
          </button>
        </div>

        <div class="space-y-2">
          <div 
            v-for="cat in categories" :key="cat.id"
            @click="selectedCategory = cat"
            :class="[
              'p-4 border rounded-sm cursor-pointer transition-all flex items-center justify-between group',
              selectedCategory?.id === cat.id ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:shadow-sm'
            ]"
          >
            <div>
              <p class="font-bold text-sm">{{ cat.name }}</p>
              <p :class="selectedCategory?.id === cat.id ? 'text-emerald-200' : 'text-slate-400'" class="text-[10px] uppercase tracking-widest mt-1">
                {{ cat.active ? 'Aktif' : 'Non-Aktif' }}
              </p>
            </div>
            
            <div class="flex items-center gap-2">
              <div :class="selectedCategory?.id === cat.id ? 'opacity-100 flex gap-1' : 'opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity'">
                <button @click.stop="openEditCat(cat)" :class="selectedCategory?.id === cat.id ? 'text-emerald-200 hover:text-white' : 'text-slate-400 hover:text-emerald-600'" class="p-1"><Edit3 class="w-4 h-4" /></button>
                <button @click.stop="deleteCategory(cat.id)" :class="selectedCategory?.id === cat.id ? 'text-red-300 hover:text-white' : 'text-slate-400 hover:text-red-600'" class="p-1"><Trash2 class="w-4 h-4" /></button>
              </div>
              <ChevronRight v-if="selectedCategory?.id !== cat.id" class="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
            </div>
          </div>
        </div>
      </div>

      <!-- Kanan: Program Donasi (Campaigns) -->
      <div class="lg:col-span-8">
        <div v-if="!selectedCategory" class="bg-white border border-slate-200 rounded-sm h-[400px] flex flex-col items-center justify-center shadow-sm">
           <Megaphone class="w-16 h-16 text-slate-100 mb-4" />
           <p class="text-slate-400 font-bold uppercase tracking-widest text-xs">Pilih Kategori</p>
           <p class="text-slate-400 text-[10px] mt-1 italic">Klik salah satu kategori di kiri untuk melihat program di dalamnya.</p>
        </div>

        <div v-else class="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden flex flex-col h-full min-h-[400px]">
          <div class="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <div>
              <p class="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">Daftar Program Untuk</p>
              <h2 class="font-bold text-slate-800 text-lg leading-tight">{{ selectedCategory.name }}</h2>
            </div>
            <button @click="openAddCamp" class="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-sm font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-sm shadow-emerald-700/20">
              <Plus class="w-3.5 h-3.5" /> Tambah Program
            </button>
          </div>

          <div class="flex-1 p-6">
            <div v-if="campaigns.length === 0" class="text-center py-12 border border-dashed border-slate-200 rounded-sm">
               <p class="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">Belum ada program</p>
               <p class="text-slate-400 text-[10px] italic">Silakan buat program donasi baru di kategori ini.</p>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="camp in campaigns" :key="camp.id" class="border border-slate-200 rounded-sm hover:border-emerald-300 transition-all group bg-white relative overflow-hidden flex flex-col">
                <div class="h-1 w-full absolute top-0 left-0 z-10" :class="camp.is_active ? 'bg-emerald-500' : 'bg-red-400'"></div>
                
                <div class="h-32 w-full bg-slate-100 overflow-hidden relative shrink-0">
                  <img v-if="camp.cover_image_url" :src="camp.cover_image_url" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div v-else class="w-full h-full flex items-center justify-center text-slate-300">
                     <Megaphone class="w-8 h-8 opacity-50" />
                  </div>
                </div>

                <div class="p-5 flex-1 flex flex-col">
                  <div class="flex justify-between items-start mb-2">
                    <h3 class="font-bold text-slate-800 text-sm line-clamp-2 pr-4">{{ camp.title }}</h3>
                    <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button @click="openEditCamp(camp)" class="text-slate-400 hover:text-emerald-600 bg-slate-50 p-1.5 rounded-sm"><Edit3 class="w-3.5 h-3.5" /></button>
                      <button @click="deleteCampaign(camp.id)" class="text-slate-400 hover:text-red-600 bg-slate-50 p-1.5 rounded-sm"><Trash2 class="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  
                  <p class="text-[10px] text-slate-500 line-clamp-2 mb-4 h-7">{{ camp.description || 'Tidak ada deskripsi.' }}</p>
                  
                  <div class="mt-auto space-y-1 bg-slate-50 p-2 rounded-sm border border-slate-100">
                    <div class="flex justify-between text-[9px] font-black uppercase tracking-widest">
                      <span class="text-slate-400">Target</span>
                      <span class="text-slate-700">{{ formatCurrency(camp.target_amount) }}</span>
                    </div>
                    <div class="flex justify-between text-[9px] font-black uppercase tracking-widest">
                      <span class="text-slate-400">Status</span>
                      <span :class="camp.status === 'active' ? 'text-emerald-600' : camp.status === 'closed' ? 'text-red-500' : 'text-amber-500'">{{ camp.status }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Kategori -->
    <div v-if="showCatModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div class="bg-white w-full max-w-sm rounded-sm shadow-2xl overflow-hidden border border-slate-200">
         <div class="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
           <h3 class="font-black text-xs uppercase tracking-widest text-slate-800">Kategori Program</h3>
           <button @click="showCatModal = false" class="text-slate-400 hover:text-red-500"><X class="w-4 h-4"/></button>
         </div>
         <div class="p-6 space-y-4">
           <div>
             <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Nama Kategori</label>
             <input v-model="catForm.name" type="text" class="w-full border border-slate-200 p-2.5 rounded-sm text-sm outline-none focus:border-emerald-500 font-bold" placeholder="Misal: Zakat Fitrah">
           </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Tipe Kategori</label>
              <select v-model="catForm.categories_type" class="w-full border border-slate-200 p-2.5 rounded-sm text-sm outline-none focus:border-emerald-500 font-bold">
                <option value="donasi">Umum (Donasi/Infaq)</option>
                <option value="zakat">Zakat</option>
                <option value="kurban">Kurban</option>
              </select>
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Status</label>
              <select v-model="catForm.is_active" class="w-full border border-slate-200 p-2.5 rounded-sm text-sm outline-none focus:border-emerald-500 font-bold">
                <option :value="1">Aktif</option>
                <option :value="0">Non-Aktif</option>
              </select>
            </div>
         </div>
         <div class="p-5 border-t border-slate-100 bg-slate-50 flex justify-end">
           <button @click="saveCategory" class="bg-emerald-700 text-white px-6 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Save class="w-4 h-4"/> Simpan</button>
         </div>
      </div>
    </div>

    <!-- Modal Campaign -->
    <div v-if="showCampModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div class="bg-white w-full max-w-2xl rounded-sm shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
         <div class="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
           <h3 class="font-black text-xs uppercase tracking-widest text-slate-800">Program Donasi</h3>
           <button @click="showCampModal = false" class="text-slate-400 hover:text-red-500"><X class="w-4 h-4"/></button>
         </div>
         <div class="p-6 space-y-4 overflow-y-auto custom-scrollbar">
           <div class="grid grid-cols-2 gap-4">
             <div>
               <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Kategori Program</label>
               <select v-model="campForm.category_id" class="w-full border border-slate-200 p-2.5 rounded-sm text-sm outline-none focus:border-emerald-500 font-bold">
                 <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
               </select>
             </div>
             <div>
               <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Judul Program</label>
               <input v-model="campForm.title" type="text" class="w-full border border-slate-200 p-2.5 rounded-sm text-sm outline-none focus:border-emerald-500 font-bold" placeholder="Misal: Sedekah Jumat Berkah">
             </div>
           </div>
           <div class="grid grid-cols-2 gap-4">
             <div>
               <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block flex justify-between">
                 <span>Cover Foto (Thumbnail)</span>
                 <span v-if="isUploading" class="text-emerald-500 animate-pulse">Mengupload...</span>
               </label>
               <input type="file" @change="e => handleFileUpload(e, 'cover_image_url')" accept="image/*" class="w-full border border-slate-200 p-2 rounded-sm text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-sm file:border-0 file:text-[10px] file:uppercase file:font-black file:tracking-widest file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer outline-none text-slate-500">
               <div v-if="campForm.cover_image_url" class="mt-2 h-32 overflow-hidden rounded-sm border border-slate-200 bg-slate-50 flex items-center justify-center relative group">
                 <img :src="campForm.cover_image_url" class="w-full h-full object-cover" />
                 <button @click="campForm.cover_image_url = ''" class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X class="w-4 h-4"/></button>
               </div>
             </div>
             <div>
               <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block flex justify-between">
                 <span>Foto Detail (Content)</span>
               </label>
               <input type="file" @change="e => handleFileUpload(e, 'image_url')" accept="image/*" class="w-full border border-slate-200 p-2 rounded-sm text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-sm file:border-0 file:text-[10px] file:uppercase file:font-black file:tracking-widest file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer outline-none text-slate-500">
               <div v-if="campForm.image_url" class="mt-2 h-32 overflow-hidden rounded-sm border border-slate-200 bg-slate-50 flex items-center justify-center relative group">
                 <img :src="campForm.image_url" class="w-full h-full object-cover" />
                 <button @click="campForm.image_url = ''" class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X class="w-4 h-4"/></button>
               </div>
             </div>
           </div>
           <div class="grid grid-cols-2 gap-4">
             <div>
               <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Target Dana (Rp)</label>
               <input v-model="campForm.target_amount" type="number" class="w-full border border-slate-200 p-2.5 rounded-sm text-sm outline-none focus:border-emerald-500 font-bold">
             </div>
             <div>
               <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Status Penayangan</label>
                <select v-model="campForm.status" class="w-full border border-slate-200 p-2.5 rounded-sm text-sm outline-none focus:border-emerald-500 font-bold">
                  <option value="active">Aktif (Tampil di Portal)</option>
                  <option value="draft">Draft (Sembunyikan)</option>
                  <option value="closed">Ditutup</option>
                </select>
             </div>
           </div>

           <!-- Tanggal Program -->
           <div class="grid grid-cols-2 gap-4">
             <div>
               <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Tanggal Mulai</label>
               <input v-model="campForm.start_date" type="datetime-local" class="w-full border border-slate-200 p-2.5 rounded-sm text-sm outline-none focus:border-emerald-500 font-bold">
             </div>
             <div>
               <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Tanggal Berakhir</label>
               <input v-model="campForm.end_date" type="datetime-local" class="w-full border border-slate-200 p-2.5 rounded-sm text-sm outline-none focus:border-emerald-500 font-bold">
             </div>
           </div>
           <div>
             <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Deskripsi Singkat</label>
              <textarea v-model="campForm.description" class="w-full border border-slate-200 p-2.5 rounded-sm text-sm outline-none focus:border-emerald-500" rows="2"></textarea>
           </div>
           
           <!-- Default Campaign -->
           <label class="flex items-center gap-3 cursor-pointer p-3 border border-slate-200 rounded-sm hover:border-emerald-400 transition-colors">
             <input type="checkbox" v-model="campForm.default" :true-value="1" :false-value="0" class="w-4 h-4 accent-emerald-600">
             <div>
               <p class="text-xs font-bold text-slate-700">Program Unggulan (Default)</p>
               <p class="text-[10px] text-slate-400">Tampil di halaman utama sebagai program unggulan.</p>
             </div>
           </label>
           
           <hr class="border-slate-100 my-4" />
           
           <details class="group bg-slate-50 border border-slate-200 rounded-sm overflow-hidden">
             <summary class="p-4 cursor-pointer font-bold text-xs uppercase tracking-widest text-emerald-800 list-none flex justify-between items-center">
               Pengaturan Lanjutan (Zakat / Kurban)
               <ChevronRight class="w-4 h-4 text-emerald-600 transition-transform group-open:rotate-90" />
             </summary>
             <div class="p-4 border-t border-slate-200 space-y-4 bg-white">
               <div class="grid grid-cols-2 gap-4">
                 <div>
                   <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Nominal Default (Rp)</label>
                   <input v-model="campForm.default_amount" type="number" class="w-full border border-slate-200 p-2.5 rounded-sm text-sm outline-none focus:border-emerald-500 font-bold" placeholder="Misal: 45000 untuk Zakat Fitrah">
                 </div>
                 <div>
                   <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Satuan (Unit)</label>
                    <select v-model="campForm.unit" class="w-full border border-slate-200 p-2.5 rounded-sm text-sm outline-none focus:border-emerald-500 font-bold">
                      <option value="">- Tanpa Stok -</option>
                      <option value="paket">Paket (Stok Terbatas)</option>
                      <option value="ekor">Ekor (Kurban)</option>
                    </select>
                  </div>
                  <div class="col-span-2 grid grid-cols-3 gap-4">
                    <div>
                      <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Total Kuota</label>
                      <input v-model="campForm.available_slots" type="number" class="w-full border border-slate-200 p-2.5 rounded-sm text-sm outline-none focus:border-emerald-500 font-bold">
                    </div>
                    <div>
                      <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Terisi (Booked)</label>
                      <input :value="campForm.booked_slots" type="number" readonly class="w-full border border-slate-200 p-2.5 rounded-sm text-sm bg-slate-50 text-slate-500 outline-none font-bold">
                    </div>
                    <div>
                      <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Sisa (Remaining)</label>
                      <input :value="campForm.remaining_slots" type="number" readonly class="w-full border border-slate-200 p-2.5 rounded-sm text-sm bg-slate-50 text-slate-500 outline-none font-bold">
                    </div>
                  </div>
                  <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Model Donasi</label>
                    <select v-model="campForm.is_multiple" class="w-full border border-slate-200 p-2.5 rounded-sm text-sm outline-none focus:border-emerald-500 font-bold">
                      <option :value="1">Patungan (1 Qty = 1 Nama)</option>
                      <option :value="0">Utuh (1 Qty = Maks 7 Nama)</option>
                    </select>
                  </div>
                </div>
               
               <!-- Qurban Specs -->
               <div v-if="selectedCategory?.categories_type?.includes('kurban') || campForm.unit === 'ekor'" class="p-4 border border-emerald-100 bg-emerald-50/50 rounded-sm space-y-4">
                 <h4 class="font-bold text-[10px] uppercase tracking-widest text-emerald-800 mb-2 border-b border-emerald-100 pb-2">Spesifikasi Hewan Kurban</h4>
                 <div>
                   <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Deskripsi Lengkap</label>
                   <textarea v-model="campForm.full_description" class="w-full border border-slate-200 p-2.5 rounded-sm text-sm outline-none focus:border-emerald-500" rows="3" placeholder="Deskripsi lengkap hewan kurban..."></textarea>
                 </div>
                 <div class="grid grid-cols-3 gap-4">
                   <div>
                     <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Berat</label>
                     <input v-model="campForm.weight" type="text" class="w-full border border-slate-200 p-2.5 rounded-sm text-sm outline-none focus:border-emerald-500" placeholder="Misal: 25-30 Kg">
                   </div>
                   <div>
                     <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Umur</label>
                     <input v-model="campForm.age" type="text" class="w-full border border-slate-200 p-2.5 rounded-sm text-sm outline-none focus:border-emerald-500" placeholder="> 1 Tahun">
                   </div>
                   <div>
                     <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Kesehatan</label>
                     <input v-model="campForm.health" type="text" class="w-full border border-slate-200 p-2.5 rounded-sm text-sm outline-none focus:border-emerald-500" placeholder="Sehat/Layak">
                   </div>
                 </div>
                 <div>
                   <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Spesifikasi Tambahan</label>
                   <textarea v-model="campForm.specifications" class="w-full border border-slate-200 p-2.5 rounded-sm text-sm outline-none focus:border-emerald-500" rows="2"></textarea>
                 </div>
               </div>
             </div>
           </details>
         </div>
         <div class="p-5 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
           <button @click="saveCampaign" class="bg-emerald-700 text-white px-6 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Save class="w-4 h-4"/> Simpan</button>
         </div>
      </div>
    </div>
  </div>
</template>
