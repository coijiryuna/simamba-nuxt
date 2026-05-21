<script setup>
definePageMeta({
  layout: 'admin'
})

import { 
  ArrowLeft, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  CreditCard, 
  FileText,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye
} from 'lucide-vue-next'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const { data: item, refresh } = await useFetch(`/api/v1/submissions/${route.params.id}`)

const loading = ref(false)
const updateStatus = async (status) => {
  const result = await Swal.fire({
    title: 'Ubah status?',
    text: `Apakah Anda yakin ingin mengubah status menjadi ${status}?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#047857',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Ya, Ubah',
    cancelButtonText: 'Batal'
  })

  if (result.isConfirmed) {
    loading.value = true
    try {
      await $fetch(`/api/v1/submissions/status`, {
         method: 'PUT',
         body: { id: route.params.id, status }
      })
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Status berhasil diperbarui!',
        timer: 1500,
        showConfirmButton: false
      })
      refresh()
    } catch (err) {
      Swal.fire('Error', 'Gagal update status', 'error')
    } finally {
      loading.value = false
    }
  }
}

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'approved': return 'text-emerald-600 bg-emerald-50 border-emerald-100'
    case 'rejected': return 'text-red-600 bg-red-50 border-red-100'
    default: return 'text-yellow-600 bg-yellow-50 border-yellow-100'
  }
}
</script>

<template>
  <div v-if="item">
    <div class="flex items-center gap-4 mb-8">
      <NuxtLink to="/admin/submissions" class="p-2 hover:bg-white rounded-sm border border-slate-200 text-slate-500">
        <ArrowLeft class="w-5 h-5" />
      </NuxtLink>
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Detail Pendaftar</h1>
        <p class="text-sm text-slate-500 italic">ID Permohonan: <span class="font-mono text-emerald-700">{{ item.submission_uid }}</span></p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Info Pemohon -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
          <div class="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h3 class="text-xs font-black uppercase tracking-widest text-slate-800">Informasi Pribadi</h3>
            <span :class="getStatusColor(item.status)" class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border">
              {{ item.status }}
            </span>
          </div>
          <div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="space-y-4">
              <div class="flex gap-4">
                <div class="p-2 bg-slate-100 rounded-sm h-fit text-slate-500"><User class="w-4 h-4" /></div>
                <div>
                  <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Nama Lengkap</label>
                  <p class="font-bold text-slate-800">{{ item.applicant_name }}</p>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="p-2 bg-slate-100 rounded-sm h-fit text-slate-500"><CreditCard class="w-4 h-4" /></div>
                <div>
                  <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block">NIK</label>
                  <p class="font-bold text-slate-800">{{ item.applicant_nik }}</p>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="p-2 bg-slate-100 rounded-sm h-fit text-slate-500"><MapPin class="w-4 h-4" /></div>
                <div>
                  <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Wilayah</label>
                  <p class="font-bold text-slate-800">{{ item.city }}-{{ item.province }}</p>
                </div>
              </div>
            </div>
            <div class="space-y-4">
              <div class="flex gap-4">
                <div class="p-2 bg-slate-100 rounded-sm h-fit text-slate-500"><Phone class="w-4 h-4" /></div>
                <div>
                  <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Telepon</label>
                  <p class="font-bold text-slate-800">{{ item.phone_number }}</p>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="p-2 bg-slate-100 rounded-sm h-fit text-slate-500"><Mail class="w-4 h-4" /></div>
                <div>
                  <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Email</label>
                  <p class="font-bold text-slate-800">{{ item.email || '-' }}</p>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="p-2 bg-slate-100 rounded-sm h-fit text-slate-500"><MapPin class="w-4 h-4" /></div>
                <div>
                  <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Alamat</label>
                  <p class="font-bold text-slate-800">{{ item.address }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Dokumen Persyaratan -->
        <div class="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
          <div class="px-6 py-4 bg-slate-50 border-b border-slate-200">
            <h3 class="text-xs font-black uppercase tracking-widest text-slate-800">Dokumen Persyaratan</h3>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="req in item.requirements" :key="req.id" class="p-4 border border-slate-100 rounded-sm bg-slate-50/50 flex items-center justify-between group hover:border-emerald-200 hover:bg-emerald-50/30 transition-all">
                <div class="flex items-center gap-3">
                  <div :class="req.file ? 'text-emerald-600' : 'text-slate-300'">
                    <FileText class="w-5 h-5" />
                  </div>
                  <div>
                    <p class="text-xs font-bold text-slate-700 leading-tight">{{ req.name }}</p>
                    <p class="text-[10px] text-slate-400">{{ req.file ? 'Terunggah' : 'Tidak Ada File' }}</p>
                  </div>
                </div>
                <div v-if="req.file" class="flex gap-1">
                   <a :href="req.file" target="_blank" class="p-2 text-slate-400 hover:text-emerald-600 transition-colors">
                     <Eye class="w-4 h-4" />
                   </a>
                   <a :href="req.file" download class="p-2 text-slate-400 hover:text-emerald-600 transition-colors">
                     <Download class="w-4 h-4" />
                   </a>
                </div>
                <div v-else class="text-slate-300">
                   <AlertCircle class="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Sidebar -->
      <div class="space-y-6">
        <div class="bg-white border border-slate-200 rounded-sm shadow-sm p-6 text-center">
          <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Proses Permohonan</h3>
          
          <div class="space-y-3">
            <button 
              @click="updateStatus('approved')"
              class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-sm font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle class="w-4 h-4" /> Terima Permohonan
            </button>
            <button 
              @click="updateStatus('rejected')"
              class="w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 py-3 rounded-sm font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              <XCircle class="w-4 h-4" /> Tolak Permohonan
            </button>
          </div>
          
          <div class="mt-8 p-4 bg-yellow-50 border border-yellow-100 rounded-sm text-left">
            <p class="text-[9px] font-black text-yellow-800 uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <AlertCircle class="w-3.5 h-3.5" /> Catatan Penting
            </p>
            <p class="text-[10px] text-yellow-700 leading-relaxed italic">
              Pastikan Anda sudah memverifikasi NIK dan keaslian dokumen sebelum menekan tombol terima.
            </p>
          </div>
        </div>

        <!-- Info Tambahan -->
        <div class="bg-white border border-slate-200 rounded-sm shadow-sm p-6">
          <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-800 mb-4">Ringkasan Jenis Bantuan</h3>
          <div class="p-3 bg-slate-50 border border-slate-100 rounded-sm">
             <p class="text-xs font-black text-emerald-700 mb-1">{{ item.request_type }}</p>
             <p class="text-[10px] text-slate-500 leading-relaxed">Permohonan bantuan untuk program {{ item.request_type }}.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
