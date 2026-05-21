<script setup>
definePageMeta({
  layout: 'admin'
})

import { 
  HeartHandshake, 
  Plus, 
  Trash2, 
  Edit3, 
  FileCheck,
  CheckCircle,
  XCircle,
  Save,
  X,
  ChevronRight
} from 'lucide-vue-next'

import Swal from 'sweetalert2'

const { data: requests, refresh: refreshRequests } = await useFetch('/api/v1/requests', {
  transform: (res) => res.data || []
})

const selectedRequest = ref(null)
const requirements = ref([])
const loadingReqs = ref(false)

// Select a request and fetch its requirements
const selectRequest = async (req) => {
  selectedRequest.value = req
  await fetchRequirements(req.ID)
}

const fetchRequirements = async (reqId) => {
  loadingReqs.value = true
  try {
    const data = await $fetch(`/api/v1/requirements?request_id=${reqId}`)
    requirements.value = data.data || []
  } catch (error) {
    console.error(error)
  } finally {
    loadingReqs.value = false
  }
}

// Modal State for Request (Jenis Bantuan)
const showReqModal = ref(false)
const reqForm = reactive({ ID: null, request: '', status: 1 })

const openAddReq = () => {
  reqForm.ID = null
  reqForm.request = ''
  reqForm.status = 1
  showReqModal.value = true
}

const openEditReq = (item) => {
  reqForm.ID = item.ID
  reqForm.request = item.request
  reqForm.status = item.status
  showReqModal.value = true
}

const saveRequest = async () => {
  try {
    if (reqForm.ID) {
      await $fetch(`/api/v1/requests/${reqForm.ID}`, { method: 'PUT', body: reqForm })
    } else {
      await $fetch('/api/v1/requests', { method: 'POST', body: reqForm })
    }
    showReqModal.value = false
    refreshRequests()
    if (selectedRequest.value?.ID === reqForm.ID) {
      selectedRequest.value.request = reqForm.request
    }
    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Jenis bantuan berhasil disimpan',
      timer: 1500,
      showConfirmButton: false
    })
  } catch (error) {
    Swal.fire('Gagal!', 'Gagal menyimpan data', 'error')
  }
}

const deleteRequest = async (id) => {
  const result = await Swal.fire({
    title: 'Hapus jenis bantuan?',
    text: "Pastikan tidak ada data yang terikat.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#047857',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  })

  if (result.isConfirmed) {
    try {
      await $fetch(`/api/v1/requests/${id}`, { method: 'DELETE' })
      refreshRequests()
      if (selectedRequest.value?.ID === id) {
        selectedRequest.value = null
        requirements.value = []
      }
      Swal.fire({
        icon: 'success',
        title: 'Terhapus!',
        text: 'Jenis bantuan berhasil dihapus.',
        timer: 1500,
        showConfirmButton: false
      })
    } catch (error) {
      Swal.fire('Gagal!', 'Gagal menghapus data', 'error')
    }
  }
}

// Modal State for Requirement (Persyaratan Dokumen)
const showDocModal = ref(false)
const docForm = reactive({ ID: null, request_id: null, requirements: '', status: 1 })

const openAddDoc = () => {
  docForm.ID = null
  docForm.request_id = selectedRequest.value.ID
  docForm.requirements = ''
  docForm.status = 1
  showDocModal.value = true
}

const openEditDoc = (item) => {
  docForm.ID = item.ID
  docForm.request_id = item.request_id
  docForm.requirements = item.requirements
  docForm.status = item.status
  showDocModal.value = true
}

const saveDocument = async () => {
  try {
    if (docForm.ID) {
      await $fetch(`/api/v1/requirements/${docForm.ID}`, { method: 'PUT', body: docForm })
    } else {
      await $fetch('/api/v1/requirements', { method: 'POST', body: docForm })
    }
    showDocModal.value = false
    fetchRequirements(selectedRequest.value.ID)
    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Persyaratan berhasil disimpan',
      timer: 1500,
      showConfirmButton: false
    })
  } catch (error) {
    Swal.fire('Gagal!', 'Gagal menyimpan persyaratan', 'error')
  }
}

const deleteDocument = async (id) => {
  const result = await Swal.fire({
    title: 'Hapus persyaratan?',
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
      await $fetch(`/api/v1/requirements/${id}`, { method: 'DELETE' })
      fetchRequirements(selectedRequest.value.ID)
      Swal.fire({
        icon: 'success',
        title: 'Terhapus!',
        text: 'Persyaratan berhasil dihapus.',
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
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-800 mb-1">Master Permohonan Bantuan</h1>
      <p class="text-sm text-slate-500 italic">Atur jenis program bantuan dan persyaratan dokumen yang wajib diupload mustahik.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      <!-- Kiri: Daftar Jenis Bantuan -->
      <div class="lg:col-span-5 space-y-4">
        <div class="flex items-center justify-between bg-white p-4 border border-slate-200 rounded-sm shadow-sm">
          <h2 class="font-bold text-slate-800 text-sm uppercase tracking-widest flex items-center gap-2">
            <HeartHandshake class="w-4 h-4 text-emerald-600" /> Jenis Bantuan
          </h2>
          <button @click="openAddReq" class="bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white p-1.5 rounded-sm transition-colors">
            <Plus class="w-4 h-4" />
          </button>
        </div>

        <div class="space-y-2">
          <div 
            v-for="req in requests" :key="req.ID"
            @click="selectRequest(req)"
            :class="[
              'p-4 border rounded-sm cursor-pointer transition-all flex items-center justify-between group',
              selectedRequest?.ID === req.ID ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:shadow-sm'
            ]"
          >
            <div>
              <p class="font-bold text-sm">{{ req.request }}</p>
              <p :class="selectedRequest?.ID === req.ID ? 'text-emerald-200' : 'text-slate-400'" class="text-[10px] uppercase tracking-widest mt-1">
                Status: {{ req.status == 1 ? 'Aktif' : 'Non-Aktif' }}
              </p>
            </div>
            
            <div class="flex items-center gap-2">
              <div :class="selectedRequest?.ID === req.ID ? 'opacity-100 flex gap-2' : 'opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity'">
                <button @click.stop="openEditReq(req)" :class="selectedRequest?.ID === req.ID ? 'text-emerald-200 hover:text-white' : 'text-slate-400 hover:text-emerald-600'" class="p-1">
                  <Edit3 class="w-4 h-4" />
                </button>
                <button @click.stop="deleteRequest(req.ID)" :class="selectedRequest?.ID === req.ID ? 'text-red-300 hover:text-white' : 'text-slate-400 hover:text-red-600'" class="p-1">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
              <ChevronRight v-if="selectedRequest?.ID !== req.ID" class="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
            </div>
          </div>
        </div>
      </div>

      <!-- Kanan: Daftar Persyaratan Dokumen -->
      <div class="lg:col-span-7">
        <div v-if="!selectedRequest" class="bg-white border border-slate-200 rounded-sm h-[400px] flex flex-col items-center justify-center shadow-sm">
           <FileCheck class="w-16 h-16 text-slate-100 mb-4" />
           <p class="text-slate-400 font-bold uppercase tracking-widest text-xs">Pilih Jenis Bantuan</p>
           <p class="text-slate-400 text-[10px] mt-1 italic">Klik salah satu jenis bantuan di samping kiri untuk mengatur persyaratannya.</p>
        </div>

        <div v-else class="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden flex flex-col h-full min-h-[400px]">
          <div class="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <div>
              <p class="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">Persyaratan Dokumen Untuk</p>
              <h2 class="font-bold text-slate-800 text-lg leading-tight">{{ selectedRequest.request }}</h2>
            </div>
            <button @click="openAddDoc" class="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-sm font-bold text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-emerald-700/20 shrink-0">
              <Plus class="w-3.5 h-3.5" /> Tambah Syarat
            </button>
          </div>

          <div class="flex-1 p-6 relative">
            <div v-if="loadingReqs" class="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
               <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>

            <div v-if="requirements.length === 0" class="text-center py-12">
               <p class="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">Belum ada persyaratan</p>
               <p class="text-slate-400 text-[10px] italic">Mustahik tidak akan diminta upload dokumen apapun.</p>
            </div>

            <ul v-else class="space-y-3">
              <li v-for="(doc, idx) in requirements" :key="doc.ID" class="p-4 border border-slate-200 rounded-sm flex items-start justify-between group hover:border-emerald-300 transition-colors bg-white">
                <div class="flex items-start gap-3">
                  <div class="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                    {{ idx + 1 }}
                  </div>
                  <div>
                    <p class="font-bold text-sm text-slate-800">{{ doc.requirements }}</p>
                    <p class="text-[10px] font-bold mt-1" :class="doc.status == 1 ? 'text-emerald-500' : 'text-slate-400'">
                      {{ doc.status == 1 ? 'Wajib Diupload' : 'Opsional / Non-aktif' }}
                    </p>
                  </div>
                </div>
                <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button @click="openEditDoc(doc)" class="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-sm">
                    <Edit3 class="w-4 h-4" />
                  </button>
                  <button @click="deleteDocument(doc.ID)" class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-sm">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Jenis Bantuan -->
    <div v-if="showReqModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div class="bg-white w-full max-w-sm rounded-sm shadow-2xl overflow-hidden border border-slate-200">
         <div class="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
           <h3 class="font-black text-xs uppercase tracking-widest text-slate-800">Jenis Bantuan</h3>
           <button @click="showReqModal = false" class="text-slate-400 hover:text-red-500"><X class="w-4 h-4"/></button>
         </div>
         <div class="p-6 space-y-4">
           <div>
             <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Nama Bantuan</label>
             <input v-model="reqForm.request" type="text" class="w-full border border-slate-200 p-2.5 rounded-sm text-sm outline-none focus:border-emerald-500 font-bold" placeholder="Contoh: Bantuan Modal Usaha">
           </div>
           <div>
             <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Status</label>
             <select v-model="reqForm.status" class="w-full border border-slate-200 p-2.5 rounded-sm text-sm outline-none focus:border-emerald-500 font-bold">
               <option :value="1">Aktif</option>
               <option :value="0">Non-Aktif</option>
             </select>
           </div>
         </div>
         <div class="p-5 border-t border-slate-100 bg-slate-50 flex justify-end">
           <button @click="saveRequest" class="bg-emerald-700 text-white px-6 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
             <Save class="w-4 h-4"/> Simpan
           </button>
         </div>
      </div>
    </div>

    <!-- Modal Persyaratan -->
    <div v-if="showDocModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div class="bg-white w-full max-w-sm rounded-sm shadow-2xl overflow-hidden border border-slate-200">
         <div class="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
           <h3 class="font-black text-xs uppercase tracking-widest text-slate-800">Persyaratan Dokumen</h3>
           <button @click="showDocModal = false" class="text-slate-400 hover:text-red-500"><X class="w-4 h-4"/></button>
         </div>
         <div class="p-6 space-y-5">
           <div>
             <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block flex justify-between">
               <span>Nama Dokumen</span>
             </label>
             <input v-model="docForm.requirements" type="text" class="w-full border border-slate-200 p-2.5 rounded-sm text-sm outline-none focus:border-emerald-500 font-bold mb-2" placeholder="Contoh: Fotocopy KTP Suami/Istri">
             
             <!-- Saran Cepat -->
             <div class="flex flex-wrap gap-1.5">
               <span class="text-[9px] font-bold text-slate-400 uppercase mr-1 mt-1">Saran:</span>
               <button v-for="saran in ['Fotocopy KTP', 'Fotocopy KK', 'SKTM dari Kelurahan', 'Foto Rumah/Usaha', 'Surat Permohonan', 'RAB (Rencana Anggaran)']" 
                 :key="saran" 
                 @click="docForm.requirements = saran"
                 class="bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 text-[10px] px-2 py-1 rounded-sm transition-colors border border-slate-200 hover:border-emerald-200"
               >
                 {{ saran }}
               </button>
             </div>
           </div>
           <div>
             <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Status Syarat</label>
             <select v-model="docForm.status" class="w-full border border-slate-200 p-2.5 rounded-sm text-sm outline-none focus:border-emerald-500 font-bold">
               <option :value="1">Wajib (Aktif)</option>
               <option :value="0">Opsional (Non-Aktif)</option>
             </select>
           </div>
         </div>
         <div class="p-5 border-t border-slate-100 bg-slate-50 flex justify-end">
           <button @click="saveDocument" class="bg-emerald-700 text-white px-6 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm shadow-emerald-700/20">
             <Save class="w-4 h-4"/> Simpan
           </button>
         </div>
      </div>
    </div>

  </div>
</template>
