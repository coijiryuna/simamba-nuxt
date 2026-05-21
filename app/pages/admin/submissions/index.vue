<script setup>
definePageMeta({
  layout: 'admin'
})

import { 
  Inbox, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  ChevronRight,
  Download
} from 'lucide-vue-next'

import Swal from 'sweetalert2'

const filters = reactive({
  status: 'all',
  request_id: 'all',
  search: ''
})

const { data: requests } = await useFetch('/api/v1/requests', {
  transform: (res) => res.data || []
})
const { data: submissions, refresh, pending } = await useAsyncData(
  'admin-submissions-list',
  () => $fetch('/api/v1/submissions', { params: filters }),
  { 
    watch: [() => filters.status, () => filters.request_id]
  }
)

// Trigger search manually or with debouncing
const handleSearch = () => {
  refresh()
}

const updateStatus = async (id, newStatus) => {
  const result = await Swal.fire({
    title: 'Ubah status?',
    text: `Apakah Anda yakin ingin mengubah status menjadi ${newStatus}?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#047857',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Ya, Ubah',
    cancelButtonText: 'Batal'
  })

  if (result.isConfirmed) {
    try {
      await $fetch(`/api/v1/submissions/${id}`, {
        method: 'PUT',
        body: { status: newStatus }
      })
      refresh()
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: `Status berhasil diubah menjadi ${newStatus}`,
        timer: 1500,
        showConfirmButton: false
      })
    } catch (e) {
      Swal.fire('Error', 'Gagal memperbarui status', 'error')
    }
  }
}

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    case 'rejected': return 'bg-red-100 text-red-700 border-red-200'
    default: return 'bg-amber-100 text-amber-700 border-amber-200'
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const exportData = () => {
  const queryParams = new URLSearchParams(filters).toString()
  window.open(`/api/v1/submissions/export?${queryParams}`, '_blank')
}
</script>

<template>
  <div>
    <div class="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 mb-1">Daftar Permohonan Bantuan ({{ submissions?.length || 0 }})</h1>
        <p class="text-sm text-slate-500 italic">Kelola verifikasi dan status bantuan para mustahik.</p>
      </div>
      <div class="flex items-center gap-2">
        <button @click="exportData" class="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-sm font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
          <Download class="w-4 h-4" /> Export Laporan
        </button>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="bg-white border border-slate-200 rounded-sm shadow-sm p-6 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Cari Mustahik</label>
        <div class="relative">
          <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            v-model="filters.search" 
            @keyup.enter="handleSearch"
            type="text" 
            placeholder="Nama atau NIK..." 
            class="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-sm text-sm focus:border-emerald-600 outline-none w-full" 
          />
        </div>
      </div>

      <div>
        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Status</label>
        <select v-model="filters.status" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2 px-3 text-sm outline-none font-bold">
          <option value="all">Semua Status</option>
          <option value="pending">Menunggu Review</option>
          <option value="approved">Diterima (Approved)</option>
          <option value="rejected">Ditolak (Rejected)</option>
        </select>
      </div>

      <div>
        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Jenis Bantuan</label>
        <select v-model="filters.request_id" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2 px-3 text-sm outline-none font-bold">
          <option value="all">Semua Bantuan</option>
          <option v-for="req in requests" :key="req.ID" :value="req.ID">
            {{ req.request }}
          </option>
        </select>
      </div>

      <div class="flex items-end">
        <button @click="handleSearch" class="w-full bg-slate-800 text-white py-2.5 rounded-sm font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all">
          Terapkan Filter
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden relative">
      <div v-if="pending" class="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>

      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-slate-50 border-b border-slate-200">
            <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tgl Masuk</th>
            <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Mustahik</th>
            <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Jenis Bantuan</th>
            <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
            <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="item in submissions" :key="item.ID" class="hover:bg-slate-50/50 transition-all group">
            <td class="px-6 py-4 text-xs font-medium text-slate-500">
              {{ formatDate(item.submission_date) }}
            </td>
            <td class="px-6 py-4">
              <p class="text-sm font-bold text-slate-800">{{ item.applicant_name }}</p>
            </td>
            <td class="px-6 py-4">
              <p class="text-sm font-bold text-slate-800">{{ item.request_type }}</p>
            </td>
            <td class="px-6 py-4">
              <div class="flex justify-center">
                <span :class="getStatusColor(item.status)" class="text-[9px] font-black uppercase tracking-[0.1em] px-2.5 py-1 rounded-full border shadow-sm">
                  {{ item.status }}
                </span>
              </div>
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex items-center justify-end gap-2">
                <NuxtLink :to="`/admin/submissions/${item.submission_uid}`" class="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-sm transition-all" title="Detail Dokumen">
                  <Eye class="w-4 h-4" />
                </NuxtLink>
                <div v-if="item.status === 'pending'" class="flex gap-1">
                  <button @click="updateStatus(item.ID, 'approved')" class="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-sm transition-all" title="Setujui">
                    <CheckCircle class="w-4 h-4" />
                  </button>
                  <button @click="updateStatus(item.ID, 'rejected')" class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-all" title="Tolak">
                    <XCircle class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </td>
          </tr>
          <tr v-if="!submissions || submissions.length === 0">
            <td colspan="5" class="px-6 py-16 text-center">
              <Inbox class="w-16 h-16 text-slate-100 mx-auto mb-4" />
              <h3 class="text-slate-400 font-black uppercase tracking-widest">Tidak ada permohonan</h3>
              <p class="text-xs text-slate-400 mt-1 italic">Sesuaikan filter atau kata kunci pencarian Anda.</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
