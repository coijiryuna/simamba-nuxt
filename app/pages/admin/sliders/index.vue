<script setup>
definePageMeta({
  layout: 'admin'
})

import {
  Layers,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Link as LinkIcon,
  RefreshCw
} from 'lucide-vue-next'

import Swal from 'sweetalert2'
const syncing = ref(false)

const currentPage = ref(1)
const itemsPerPage = ref(10)

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
    const response = await $fetch('/api/v1/sliders/sync-banner', {
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
      text: `${response.syncedCount} banner baru berhasil disinkronkan dari SIMBA.`,
      confirmButtonColor: '#047857',
    })
  } catch (e) {
    Swal.fire('Gagal!', e.data?.message || 'Gagal menyinkronkan banner dari SIMBA.', 'error')
  } finally {
    syncing.value = false
  }
}

const { data: sliders, refresh } = await useFetch('/api/v1/sliders')

const toggleStatus = async (item) => {
  const newStatus = item.status === 'active' ? 'inactive' : 'active'
  try {
    await $fetch(`/api/v1/sliders/${item.id}`, {
      method: 'PUT',
      body: { status: newStatus }
    })
    refresh()
  } catch (e) {
    Swal.fire('Error', 'Gagal memperbarui status banner', 'error')
  }
}

const deleteItem = async (id) => {
  const result = await Swal.fire({
    title: 'Hapus banner?',
    text: "Banner yang dihapus tidak bisa dikembalikan.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#047857',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  })

  if (result.isConfirmed) {
    try {
      await $fetch(`/api/v1/sliders/${id}`, { method: 'DELETE' })
      refresh()
      Swal.fire({
        icon: 'success',
        title: 'Terhapus!',
        text: 'Banner berhasil dihapus.',
        timer: 1500,
        showConfirmButton: false
      })
    } catch (err) {
      Swal.fire('Gagal!', 'Gagal menghapus banner', 'error')
    }
  }
}
</script>

<template>
  <div>
    <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 mb-1">Banner Slider</h1>
        <p class="text-sm text-slate-500 italic">Atur banner promosi yang muncul di halaman utama website.</p>
      </div>
      <div class="flex items-center gap-3">
        <button @click="syncSimba" :disabled="syncing"
          class="flex items-center gap-2 bg-emerald-700 text-white px-6 py-2.5 rounded-sm text-xs font-black uppercase tracking-widest hover:bg-emerald-800 disabled:bg-emerald-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
          <RefreshCw :class="{ 'animate-spin': syncing }" class="w-4 h-4" />
          {{ syncing ? 'Syncing...' : 'Sync SIMBA' }}
        </button>

        <NuxtLink to="/admin/sliders/new"
          class="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-sm font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-emerald-700/20">
          <Plus class="w-4 h-4" /> Tambah Banner
        </NuxtLink>
      </div>
    </div>

    <div class="space-y-4">
      <div v-for="item in sliders" :key="item.id"
        class="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden flex flex-col md:flex-row group">
        <!-- Image Preview -->
        <div class="w-full md:w-92 aspect-video relative overflow-hidden bg-slate-100 shrink-0">
          <img :src="item.image_url"
            class="w-auto h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div v-if="item.status === 'inactive'"
            class="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
            <span
              class="px-3 py-1 bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-full">Non-Aktif</span>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6 flex-1 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-100">
          <div>
            <div class="flex justify-between items-start mb-2">
              <h3 class="font-bold text-slate-800 text-lg">{{ item.title }}</h3>
              <div class="flex items-center gap-1">
                <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-2">Urutan: {{
                  item.display_order }}</span>
                <div class="flex border border-slate-100 rounded-sm overflow-hidden">
                  <button class="p-1 hover:bg-slate-50 text-slate-400 border-r border-slate-100">
                    <MoveUp class="w-3.5 h-3.5" />
                  </button>
                  <button class="p-1 hover:bg-slate-50 text-slate-400">
                    <MoveDown class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
            <p class="text-xs text-slate-500 mb-4">{{ item.caption || 'Tidak ada deskripsi.' }}</p>
            <div v-if="item.link_url" class="flex items-center gap-2 text-blue-600 text-[10px] font-bold">
              <LinkIcon class="w-3 h-3" />
              <a :href="item.link_url" target="_blank" class="hover:underline">{{ item.link_url }}</a>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-slate-50">
            <button @click="toggleStatus(item)"
              :class="item.status === 'active' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-50'"
              class="p-2 rounded-sm transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
              <component :is="item.status === 'active' ? Eye : EyeOff" class="w-4 h-4" />
              {{ item.status === 'active' ? 'Aktif' : 'Non-Aktif' }}
            </button>
            <div class="w-px h-4 bg-slate-200 mx-2"></div>
            <NuxtLink :to="`/admin/sliders/${item.id}`"
              class="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-sm transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
              <Edit3 class="w-4 h-4" /> Edit
            </NuxtLink>
            <button @click="deleteItem(item.id)"
              class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
              <Trash2 class="w-4 h-4" /> Hapus
            </button>
          </div>
        </div>
      </div>

      <div v-if="!sliders || sliders.length === 0"
        class="bg-white border border-slate-200 rounded-sm p-16 text-center shadow-sm">
        <Layers class="w-16 h-16 text-slate-100 mx-auto mb-4" />
        <h3 class="text-slate-400 font-black uppercase tracking-widest">Belum ada banner slider</h3>
        <p class="text-xs text-slate-400 mt-1">Buat tampilan depan website lebih menarik dengan banner promo.</p>
      </div>
    </div>
  </div>
</template>
