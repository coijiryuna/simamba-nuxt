<script setup>
definePageMeta({
  layout: 'admin'
})

import { 
  Plus, 
  Edit3, 
  Trash2, 
  FileText,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next'
import Swal from 'sweetalert2'

const search = ref('')
const { data: pagesData, pending, refresh } = await useFetch('/api/v1/posts', {
  query: computed(() => ({
    search: search.value,
    type: 'page', // Filter khusus halaman statis
    limit: 10
  }))
})

const deletePage = async (id) => {
  const result = await Swal.fire({
    title: 'Hapus halaman?',
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
      await $fetch(`/api/v1/posts/${id}`, { method: 'DELETE' })
      refresh()
      Swal.fire({
        icon: 'success',
        title: 'Terhapus!',
        text: 'Halaman berhasil dihapus.',
        timer: 1500,
        showConfirmButton: false
      })
    } catch (err) {
      Swal.fire('Gagal!', 'Gagal menghapus halaman.', 'error')
    }
  }
}
</script>

<template>
  <div>
    <div class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 mb-1 tracking-tight italic">Halaman Statis</h1>
        <p class="text-sm text-slate-500 font-medium">Kelola informasi tetap seperti Profil, Struktur, dan Layanan.</p>
      </div>
      <NuxtLink to="/admin/posts/new?type=page" class="flex items-center gap-2 bg-[#fecb00] text-slate-900 px-6 py-2.5 rounded-sm text-xs font-black uppercase tracking-widest hover:bg-yellow-500 transition-all shadow-lg shadow-yellow-500/20 active:scale-95">
        <Plus class="w-4 h-4" />
        Buat Halaman
      </NuxtLink>
    </div>

    <div class="bg-white border border-slate-200 rounded-sm shadow-sm p-4 mb-6 flex items-center gap-4">
      <div class="relative flex-1 group">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          v-model="search"
          type="text" 
          placeholder="Cari judul halaman..." 
          class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2 pl-10 pr-4 text-sm outline-none focus:border-emerald-600 transition-all"
        />
      </div>
    </div>

    <div class="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden relative min-h-[300px]">
      <div v-if="pending" class="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-700"></div>
      </div>

      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-[0.2em] border-b border-slate-200 font-black">
            <th class="px-6 py-5 whitespace-nowrap">Judul Halaman</th>
            <th class="px-6 py-5 text-center">Slug / URL</th>
            <th class="px-6 py-5 text-center">Status</th>
            <th class="px-6 py-5 text-right">Opsi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="page in pagesData?.data" :key="page.ID" class="hover:bg-emerald-50/20 transition-all group">
            <td class="px-6 py-5">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-emerald-50 rounded-sm border border-emerald-100">
                  <FileText class="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <h3 class="font-black text-slate-800 text-sm leading-tight group-hover:text-emerald-700 transition-colors uppercase">{{ page.post_title }}</h3>
                  <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Dibuat: {{ new Date(page.post_date).toLocaleDateString('id-ID') }}</p>
                </div>
              </div>
            </td>
            <td class="px-6 py-5 text-center">
              <code class="text-[10px] bg-slate-100 px-2 py-1 rounded-sm text-slate-600 font-bold">/page/{{ page.slug }}</code>
            </td>
            <td class="px-6 py-5 text-center">
              <span class="px-2 py-0.5 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-sm text-[9px] font-black uppercase tracking-widest">
                {{ page.post_status }}
              </span>
            </td>
            <td class="px-6 py-5 text-right">
              <div class="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <NuxtLink :to="`/admin/posts/${page.ID}`" class="p-2 bg-white hover:bg-emerald-600 hover:text-white rounded-sm border border-slate-200 shadow-sm transition-all">
                  <Edit3 class="w-4 h-4" />
                </NuxtLink>
                <button @click="deletePage(page.ID)" class="p-2 bg-white hover:bg-red-600 hover:text-white rounded-sm border border-slate-200 shadow-sm transition-all">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="pagesData?.data?.length === 0">
            <td colspan="4" class="px-6 py-20 text-center italic text-slate-400 text-sm font-medium uppercase tracking-widest">
              Belum ada halaman statis yang dibuat.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
