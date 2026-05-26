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

const { data: bankData, pending, refresh } = await useFetch('/api/v1/bank', {
    query: computed(() => ({
        search: search.value,
        page: currentPage.value,
        limit: itemsPerPage.value
    }))
})

const totalPages = computed(() => {
    return Math.ceil((bankData.value?.total || 0) / itemsPerPage.value)
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

const deleteBank = async (id) => {
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
            await $fetch(`/api/v1/bank/${id}`, { method: 'DELETE' })
            refresh()
            Swal.fire({
                icon: 'success',
                title: 'Terhapus!',
                text: 'Bank berhasil dihapus.',
                timer: 1500,
                showConfirmButton: false
            })
        } catch (e) {
            Swal.fire('Gagal!', 'Gagal menghapus bank.', 'error')
        }
    }
}
</script>
<template>
    <div>
        <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 class="text-2xl font-bold text-slate-800 mb-1 tracking-tight italic">Manajemen Bank dan Rekening
                </h1>
                <p class="text-sm text-slate-500 font-medium">Kelola informasi bank dan rekening yang tersedia.</p>
            </div>
            <div class="flex items-center gap-3">

                <NuxtLink to="/admin/bank/new"
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
                    <th class="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nama Bank
                    </th>
                    <th class="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nomor
                        Rekening</th>
                    <th class="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Atas Nama
                    </th>
                    <th class="px-6 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        Aksi</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
                <tr v-for="bank in bankData?.data" :key="bank.ID" class="hover:bg-emerald-50/20 transition-all group">
                    <td class="px-6 py-5">
                        <div class="flex gap-4 items-start">
                            <div
                                class="w-12 h-12 bg-slate-100 rounded-sm border border-slate-200 shrink-0 overflow-hidden">
                                <img v-if="bank.bank_logo" :src="bank.bank_logo_url" alt="Logo Bank"
                                    class="w-full h-full object-cover" />
                                <div v-else class="w-full h-full flex items-center justify-center">
                                    <FileText class="w-4 h-4 text-slate-300" />
                                </div>
                            </div>
                            <div class="flex-1">
                                <h3
                                    class="font-black text-slate-800 text-sm mb-1 leading-tight group-hover:text-emerald-700 transition-colors">
                                    {{ bank.bank_name }}</h3>
                                <div
                                    class="flex items-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest">
                                    <span>ID: #{{ bank.ID }}</span>
                                </div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-5">
                        <span class="text-sm font-medium text-slate-500">{{ bank.bank_account_number }}</span>
                    </td>
                    <td class="px-6 py-5">
                        <span class="text-sm font-medium text-slate-500">{{ bank.bank_account_name }}</span>
                    </td>
                    <td class="px-6 py-5 text-right">
                        <div
                            class="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                            <NuxtLink :to="`/admin/bank/${bank.ID}`"
                                class="p-2 bg-white hover:bg-emerald-600 hover:text-white rounded-sm border border-slate-200 shadow-sm transition-all"
                                title="Edit Konten">
                                <Edit3 class="w-4 h-4" />
                            </NuxtLink>
                            <button @click="deleteBank(bank.ID)"
                                class="p-2 bg-white hover:bg-red-600 hover:text-white rounded-sm border border-slate-200 shadow-sm transition-all"
                                title="Hapus Permanen">
                                <Trash2 class="w-4 h-4" />
                            </button>
                        </div>
                    </td>
                </tr>
                <tr v-if="bankData?.data?.length === 0">
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
                bankData?.total ||
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