<script setup>
import { 
  Ticket, Search, Loader2, AlertCircle, 
  ClipboardList, FileText, ShieldCheck, 
  MapPin, Coins, CheckCircle 
} from 'lucide-vue-next'

const config = useRuntimeConfig()
const ticket = ref('')
const result = ref(null)
const isLoading = ref(false)
const error = ref('')

const statusSteps = [
  { id: 'Masuk', label: 'Surat Masuk', icon: 'FileText' },
  { id: 'Verivikasi', label: 'Verifikasi', icon: 'ShieldCheck' },
  { id: 'Survai', label: 'Survai Lapangan', icon: 'MapPin' },
  { id: 'Proses Pencairan', label: 'Proses Pencairan', icon: 'Coins' },
  { id: 'Selesai', label: 'Selesai', icon: 'CheckCircle' }
]

const getStatusIndex = (status) => {
  if (!status) return 0
  return statusSteps.findIndex(s => s.id === status)
}

const handleCheck = async () => {
  if (!ticket.value) {
    error.value = 'Silakan masukkan nomor tiket'
    return
  }

  isLoading.value = true
  error.value = ''
  result.value = null

  try {
    const response = await $fetch('/api/v1/status-ticket', {
      params: { ticket: ticket.value }
    })

    if (response.status === 'success' && response.data) {
      const data = response.data
      const now = new Date()
      const maxEdit = data.max_edit_date ? new Date(data.max_edit_date) : null
      
      result.value = {
        ...data,
        canEdit: maxEdit ? now < maxEdit : false,
        maxEditDate: maxEdit ? maxEdit.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : null
      }
    } else {
      error.value = 'Nomor tiket tidak ditemukan atau pengajuan belum diproses.'
    }
  } catch (err) {
    error.value = 'Terjadi kesalahan saat mengecek status. Pastikan nomor tiket benar.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const goToEdit = () => {
  navigateTo(`/pengajuan/edit?ticket=${ticket.value}`)
}

useSeoMeta({
  title: 'Cek Status Pengajuan - BAZNAS Kabupaten Tangerang',
  description: 'Pantau status permohonan bantuan Anda secara real-time menggunakan nomor tiket resmi.'
})
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-12">
    <div class="text-center mb-12">
      <h1 class="text-xl md:text-3xl font-black text-slate-800 uppercase tracking-tighter mb-4">Cek Status Pengajuan</h1>
      <p class="text-slate-500 max-w-lg mx-auto">
        Masukkan nomor tiket pengajuan Anda untuk melihat perkembangan proses permohonan bantuan.
      </p>
    </div>

    <!-- Search Card -->
    <div class="bg-white rounded-sm shadow-xl p-6 md:p-8 border border-slate-100 mb-8">
      <form @submit.prevent="handleCheck" class="flex flex-col md:flex-row gap-4">
        <div class="flex-1 relative">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Ticket :size="20" />
          </div>
          <input 
            v-model="ticket"
            type="text" 
            placeholder="Contoh: BAZ-TGN-XXXXXXXX"
            class="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-sm focus:border-[#01803d] focus:ring-0 transition-all font-black text-slate-900 placeholder:text-slate-400 uppercase tracking-widest"
          >
        </div>
        <button 
          type="submit"
          :disabled="isLoading"
          class="bg-[#01803d] text-white px-8 py-4 rounded-sm font-black uppercase tracking-widest hover:bg-[#016932] transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Search v-if="!isLoading" :size="20" />
          <Loader2 v-else :size="20" class="animate-spin" />
          {{ isLoading ? 'Mengecek...' : 'Cek Status' }}
        </button>
      </form>
      
      <div v-if="error" class="mt-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm font-bold flex items-center gap-2">
        <AlertCircle :size="18" />
        {{ error }}
      </div>
    </div>

    <!-- Results Section -->
    <div v-if="result" class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <!-- Stepper Tracker -->
      <div class="bg-white rounded-sm shadow-xl p-8 border border-slate-100 overflow-x-auto">
        <div class="min-w-[600px] relative flex justify-between">
          <!-- Progress Bar Background -->
          <div class="absolute top-[22px] left-0 w-full h-1 bg-slate-100 -z-0"></div>
          <!-- Active Progress Bar -->
          <div 
            class="absolute top-[22px] left-0 h-1 bg-[#01803d] transition-all duration-1000 -z-0"
            :style="{ width: `${(getStatusIndex(result.status_pengajuan) / (statusSteps.length - 1)) * 100}%` }"
          ></div>

          <div 
            v-for="(step, index) in statusSteps" 
            :key="step.id"
            class="relative flex flex-col items-center flex-1"
          >
            <!-- Step Circle -->
            <div 
              class="w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 bg-white"
              :class="[
                index <= getStatusIndex(result.status_pengajuan) 
                ? 'border-[#01803d] text-[#01803d] scale-110 shadow-lg shadow-emerald-100' 
                : 'border-slate-100 text-slate-300'
              ]"
            >
              <component :is="step.icon" :size="20" />
            </div>
            <!-- Step Label -->
            <div class="mt-4 text-center">
              <p 
                class="text-[10px] font-black uppercase tracking-widest leading-tight"
                :class="index <= getStatusIndex(result.status_pengajuan) ? 'text-[#01803d]' : 'text-slate-400'"
              >
                {{ step.label }}
              </p>
              <p v-if="index === getStatusIndex(result.status_pengajuan)" class="text-[8px] font-bold text-emerald-500 mt-1 uppercase animate-pulse">
                Status Saat Ini
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Detail Card -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="bg-white rounded-sm shadow-xl p-8 border border-slate-100">
          <h3 class="text-xs font-black text-[#fecb00] uppercase tracking-[0.3em] mb-6">Detail Pemohon</h3>
          <div class="space-y-4">
            <div>
              <p class="text-[10px] text-slate-700 font-black uppercase tracking-widest mb-1">Nama / Lembaga</p>
              <p class="text-sm font-black text-slate-900 uppercase">{{ result.nama_surat || result.pengirim_surat }}</p>
            </div>
            <div>
              <p class="text-[10px] text-slate-700 font-black uppercase tracking-widest mb-1">Perihal</p>
              <p class="text-sm font-bold text-slate-800 leading-relaxed">{{ result.perihal }}</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-[10px] text-slate-700 font-black uppercase tracking-widest mb-1">Kecamatan</p>
                <p class="text-sm font-black text-slate-900 uppercase">{{ result.nama }}</p>
              </div>
              <div>
                <p class="text-[10px] text-slate-700 font-black uppercase tracking-widest mb-1">Jenis Surat</p>
                <p class="text-sm font-black text-slate-900 uppercase">{{ result.jenis_surat }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-sm shadow-xl p-8 border border-slate-100">
          <h3 class="text-xs font-black text-[#fecb00] uppercase tracking-[0.3em] mb-6">Informasi Administrasi</h3>
          <div class="space-y-4">
            <div>
              <p class="text-[10px] text-slate-700 font-black uppercase tracking-widest mb-1">Nomor Surat</p>
              <p class="text-sm font-black text-slate-900">{{ result.nomor_surat }}</p>
            </div>
            <div>
              <p class="text-[10px] text-slate-700 font-black uppercase tracking-widest mb-1">Tanggal Masuk</p>
              <p class="text-sm font-black text-slate-800">{{ new Date(result.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) }}</p>
            </div>
            <div>
              <p class="text-[10px] text-slate-700 font-black uppercase tracking-widest mb-1">Status Surat</p>
              <span class="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-widest">
                {{ result.status_surat }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Button for Edit (Correction) -->
      <div v-if="result.canEdit" class="bg-blue-50 border-2 border-dashed border-blue-200 rounded-sm p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="flex items-center gap-4 text-center md:text-left">
          <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
            <AlertCircle :size="24" />
          </div>
          <div>
            <h4 class="text-sm font-black text-blue-900 uppercase tracking-widest">Perbaikan Data Tersedia</h4>
            <p class="text-[10px] text-blue-700 font-bold italic">Batas waktu: {{ result.maxEditDate }} (3 hari dari pendaftaran)</p>
          </div>
        </div>
        <button 
          @click="goToEdit"
          class="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-sm font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2"
        >
          <FileText :size="16" />
          Edit / Lengkapi Berkas
        </button>
      </div>

    </div>

    <!-- Empty State -->
    <div v-if="!result && !isLoading && !error" class="text-center py-20 opacity-50">
      <ClipboardList :size="64" class="mx-auto text-slate-300 mb-4" />
      <p class="text-sm font-bold text-slate-400 uppercase tracking-widest">Hasil pencarian akan muncul di sini</p>
    </div>
  </div>
</template>
