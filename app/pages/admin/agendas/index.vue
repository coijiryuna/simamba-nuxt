<script setup>
definePageMeta({
    layout: 'admin'
})

import {
    Search,
    Plus,
    Edit3,
    Trash2,
    Filter,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    FileText,
    Eye,
    Clock,
    RefreshCw
} from 'lucide-vue-next'

import Swal from 'sweetalert2'
const search = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const syncing = ref(false)

const syncSimba = async () => {
    const { value: formValues } = await Swal.fire({
        title: 'Sinkronisasi SIMBA',
        html: `
      <div class="flex flex-col gap-4 text-left p-2">
        <div>
          <label class="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Halaman (hal)</label>
          <input id="swal-input-page" type="number" min="1" value="1" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2 px-3 text-sm outline-none focus:border-emerald-600 focus:bg-white transition-all text-slate-800 font-bold" />
        </div>
        <div>
          <label class="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Limit per Halaman</label>
          <input id="swal-input-limit" type="number" min="1" max="100" value="20" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2 px-3 text-sm outline-none focus:border-emerald-600 focus:bg-white transition-all text-slate-800 font-bold" />
        </div>
      </div>
    `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonColor: '#047857',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Mulai Sinkronisasi',
        cancelButtonText: 'Batal',
        preConfirm: () => {
            const pageInput = document.getElementById('swal-input-page')
            const limitInput = document.getElementById('swal-input-limit')
            const page = pageInput ? parseInt(pageInput.value, 10) : 1
            const limit = limitInput ? parseInt(limitInput.value, 10) : 20

            if (isNaN(page) || page < 1) {
                Swal.showValidationMessage('Halaman harus minimal 1')
                return false
            }
            if (isNaN(limit) || limit < 1) {
                Swal.showValidationMessage('Limit harus minimal 1')
                return false
            }
            return { page, limit }
        }
    })

    if (!formValues) return

    syncing.value = true
    try {
        const response = await $fetch('/api/v1/agendas/sync-agenda', {
            method: 'POST',
            body: {
                page: formValues.page,
                limit: formValues.limit
            }
        })
        refresh()
        Swal.fire({
            icon: 'success',
            title: 'Sinkronisasi Selesai!',
            text: `${response.syncedCount} agenda baru berhasil disinkronkan dari SIMBA.`,
            confirmButtonColor: '#047857',
        })
    } catch (e) {
        Swal.fire('Gagal!', e.data?.message || 'Gagal menyinkronkan agenda dari SIMBA.', 'error')
    } finally {
        syncing.value = false
    }
}

const { data: agendasData, pending, refresh } = await useFetch('/api/v1/agendas', {
    query: computed(() => ({
        search: search.value,
        page: currentPage.value,
        limit: itemsPerPage.value
    }))
})

const totalPages = computed(() => {
    return Math.ceil((agendasData.value?.total || 0) / itemsPerPage.value)
})

const prevPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--
    }
}

const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value++
    }
}

const deleteAgenda = async (id) => {
    const result = await Swal.fire({
        title: 'Hapus agenda?',
        text: "Konten yang dihapus tidak bisa dikembalikan.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#047857',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
    })

    if (result.isConfirmed) {
        try {
            await $fetch(`/api/v1/agendas/${id}`, { method: 'DELETE' })
            refresh()
            Swal.fire({
                icon: 'success',
                title: 'Terhapus!',
                text: 'Agenda berhasil dihapus.',
                timer: 1500,
                showConfirmButton: false
            })
        } catch (e) {
            Swal.fire('Gagal!', 'Gagal menghapus agenda.', 'error')
        }
    }
}


</script>
<template>
    <div>
        <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 class="text-2xl font-bold text-slate-800 mb-1 tracking-tight italic">Manajemen Agenda dan Kegiatan
                </h1>
                <p class="text-sm text-slate-500 font-medium">Kelola agenda dan kegiatan yang akan dilaksanakan.</p>
            </div>
            <div class="flex items-center gap-3">
                <button @click="syncSimba" :disabled="syncing"
                    class="flex items-center gap-2 bg-emerald-700 text-white px-6 py-2.5 rounded-sm text-xs font-black uppercase tracking-widest hover:bg-emerald-800 disabled:bg-emerald-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                    <RefreshCw :class="{ 'animate-spin': syncing }" class="w-4 h-4" />
                    {{ syncing ? 'Syncing...' : 'Sync SIMBA' }}
                </button>
                <NuxtLink to="/admin/agendas/new"
                    class="flex items-center gap-2 bg-[#fecb00] text-slate-900 px-6 py-2.5 rounded-sm text-xs font-black uppercase tracking-widest hover:bg-yellow-500 transition-all shadow-lg shadow-yellow-500/20 active:scale-95">
                    <Plus class="w-4 h-4" />
                    Tambah Baru
                </NuxtLink>
            </div>
        </div>
    </div>
    <!-- Toolbar -->
    <div
        class="bg-white border border-slate-200 rounded-sm shadow-sm p-4 mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div class="relative flex-1 group">
            <Search
                class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
            <input v-model="search" type="text" placeholder="Cari berdasarkan judul atau konten..."
                class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2 pl-10 pr-4 text-sm outline-none focus:border-emerald-600 transition-all" />
        </div>

        <div class="flex items-center gap-2">
            <button @click="refresh"
                class="p-2 bg-slate-100 hover:bg-slate-200 rounded-sm text-slate-500 transition-all">
                <Filter class="w-4 h-4" />
            </button>
        </div>
    </div>
    <!-- Data Table -->
    <div class="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden relative min-h-100">
        <div v-if="pending"
            class="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <div class="flex flex-col items-center gap-3">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-700"></div>
                <p class="text-[10px] font-black text-emerald-700 uppercase tracking-[0.3em]">Memuat Data...</p>
            </div>
        </div>

        <table class="w-full text-left border-collapse">
            <thead>
                <tr
                    class="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-[0.2em] border-b border-slate-200 font-black">
                    <th class="px-6 py-5">Info Konten</th>
                    <th class="px-6 py-5 text-center">Tipe</th>
                    <th class="px-6 py-5 text-center">Status</th>
                    <th class="px-6 py-5 text-center whitespace-nowrap">Tanggal</th>
                    <th class="px-6 py-5 text-right">Opsi</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
                <tr v-for="agenda in agendasData?.data" :key="agenda.ID" class="hover:bg-emerald-50/20 transition-all group">
                    <td class="px-6 py-5">
                        <div class="flex gap-4 items-start">
                            <div
                                class="w-12 h-12 bg-slate-100 rounded-sm border border-slate-200 shrink-0 overflow-hidden">
                                <img v-if="agenda.featured_image_url" :src="agenda.featured_image_url"
                                    class="w-full h-full object-cover" />
                                <div v-else class="w-full h-full flex items-center justify-center">
                                    <FileText class="w-4 h-4 text-slate-300" />
                                </div>
                            </div>
                            <div class="flex-1">
                                <h3
                                    class="font-black text-slate-800 text-sm mb-1 leading-tight group-hover:text-emerald-700 transition-colors">
                                    {{ agenda.agenda_title }}</h3>
                                <div
                                    class="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                    <span>Oleh {{ agenda.author || 'Admin' }}</span>
                                    <span class="w-1 h-1 bg-slate-300 rounded-full"></span>
                                    <span>ID: #{{ agenda.ID }}</span>
                                </div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-5 text-center">
                        <span
                            class="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-sm text-[9px] font-black uppercase tracking-widest text-slate-500">
                            {{ agenda.agenda_type }}
                        </span>
                    </td>
                    <td class="px-6 py-5 text-center">
                        <span :class="[
                            agenda.agenda_status === 'publish' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                        ]" class="px-3 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest border">
                            {{ agenda.agenda_status }}
                        </span>
                    </td>
                    <td class="px-6 py-5 text-center">
                        <div class="flex flex-col items-center gap-0.5">
                            <span class="text-[11px] font-bold text-slate-700">{{ new
                                Date(agenda.agenda_date).toLocaleDateString('id-ID', {
                                    day: 'numeric', month: 'short', year:
                                        'numeric'
                                }) }}</span>
                            <span class="text-[9px] text-slate-400 font-medium italic">{{ new
                                Date(agenda.agenda_date).toLocaleTimeString('id-ID', {
                                    hour: '2-digit', minute:
                                        '2-digit'
                                })
                            }} WIB</span>
                        </div>
                    </td>
                    <td class="px-6 py-5 text-right">
                        <div
                            class="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                            <NuxtLink :to="`/admin/agendas/${agenda.ID}`"
                                class="p-2 bg-white hover:bg-emerald-600 hover:text-white rounded-sm border border-slate-200 shadow-sm transition-all"
                                title="Edit Konten">
                                <Edit3 class="w-4 h-4" />
                            </NuxtLink>
                            <button @click="deleteAgenda(agenda.ID)"
                                class="p-2 bg-white hover:bg-red-600 hover:text-white rounded-sm border border-slate-200 shadow-sm transition-all"
                                title="Hapus Permanen">
                                <Trash2 class="w-4 h-4" />
                            </button>
                        </div>
                    </td>
                </tr>
                <tr v-if="agendasData?.data?.length === 0">
                    <td colspan="5" class="px-6 py-20 text-center">
                        <div class="flex flex-col items-center gap-2">
                            <FileText class="w-12 h-12 text-slate-200 mb-2" />
                            <p class="text-sm font-bold text-slate-400 uppercase tracking-widest">Tidak ada konten
                                ditemukan</p>
                            <p class="text-[10px] text-slate-300 italic">Coba ubah filter atau kata kunci pencarian
                                Anda.</p>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
        <!-- Footer / Pagination -->
        <div class="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Konten: {{
                agendasData?.total ||
                0 }}</p>
            <div class="flex items-center gap-1">
                <button @click="prevPage" :disabled="currentPage === 1 || pending"
                    class="p-2 bg-white border border-slate-200 rounded-sm text-slate-400 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    <ChevronLeft class="w-4 h-4" />
                </button>
                <button v-for="pageNumber in totalPages" :key="pageNumber" @click="currentPage = pageNumber"
                    :class="[pageNumber === currentPage ? 'border-emerald-600 text-emerald-700' : 'border-slate-200 text-slate-400 hover:bg-slate-50']"
                    class="p-2 bg-white border rounded-sm text-[10px] font-black px-4 transition-all">
                    {{ pageNumber }}
                </button>
                <button @click="nextPage" :disabled="currentPage === totalPages || pending"
                    class="p-2 bg-white border border-slate-200 rounded-sm text-slate-400 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    <ChevronRight class="w-4 h-4" />
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
}
</style>