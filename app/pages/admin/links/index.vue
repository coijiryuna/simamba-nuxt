<script setup>
definePageMeta({
  layout: 'admin'
})

import { 
  Link2, 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Globe,
  Check,
  X,
  Anchor,
  Save
} from 'lucide-vue-next'

import Swal from 'sweetalert2'

const { data: links, refresh } = await useFetch('/api/v1/links')

const showModal = ref(false)
const editingId = ref(null)
const form = reactive({
  link_name: '',
  link_url: '',
  link_category: 'General',
  link_target: '_blank',
  link_visible: 'Y'
})

const openAdd = () => {
  editingId.value = null
  form.link_name = ''
  form.link_url = ''
  form.link_category = 'General'
  form.link_target = '_blank'
  form.link_visible = 'Y'
  showModal.value = true
}

const openEdit = (item) => {
  editingId.value = item.link_id
  form.link_name = item.link_name
  form.link_url = item.link_url
  form.link_category = item.link_category
  form.link_target = item.link_target
  form.link_visible = item.link_visible
  showModal.value = true
}

const saveLink = async () => {
  try {
    if (editingId.value) {
      await $fetch(`/api/v1/links/${editingId.value}`, { method: 'PUT', body: form })
    } else {
      await $fetch('/api/v1/links', { method: 'POST', body: form })
    }
    showModal.value = false
    refresh()
    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Tautan berhasil disimpan',
      timer: 1500,
      showConfirmButton: false
    })
  } catch (err) {
    Swal.fire('Gagal!', 'Gagal menyimpan link', 'error')
  }
}

const deleteLink = async (id) => {
  const result = await Swal.fire({
    title: 'Hapus tautan?',
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
      await $fetch(`/api/v1/links/${id}`, { method: 'DELETE' })
      refresh()
      Swal.fire({
        icon: 'success',
        title: 'Terhapus!',
        text: 'Tautan berhasil dihapus.',
        timer: 1500,
        showConfirmButton: false
      })
    } catch (err) {
      Swal.fire('Gagal!', 'Gagal menghapus link', 'error')
    }
  }
}

const togglePin = async (item) => {
  const newCat = item.link_category === 'Navbar' ? 'General' : 'Navbar'
  await $fetch(`/api/v1/links/${item.link_id}`, {
    method: 'PUT',
    body: { link_category: newCat }
  })
  refresh()
}
</script>

<template>
  <div>
    <div class="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 mb-1">Tautan Eksternal</h1>
        <p class="text-sm text-slate-500 italic">Kelola link navigasi ke website lain atau menu khusus.</p>
      </div>
      <button @click="openAdd" class="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-sm font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-emerald-700/20">
        <Plus class="w-4 h-4" /> Tambah Link
      </button>
    </div>

    <!-- Modal Form -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div class="bg-white w-full max-w-md rounded-sm shadow-2xl overflow-hidden border border-slate-200">
        <div class="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <h3 class="font-black text-xs uppercase tracking-widest text-slate-800">{{ editingId ? 'Edit Tautan' : 'Tambah Tautan Baru' }}</h3>
          <button @click="showModal = false" class="text-slate-400 hover:text-red-600 transition-colors"><X class="w-5 h-5" /></button>
        </div>
        <div class="p-8 space-y-4">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Nama Tautan</label>
            <input v-model="form.link_name" type="text" placeholder="Contoh: Donasi Online" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2 px-3 text-sm focus:border-emerald-600 outline-none font-bold" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">URL Tujuan</label>
            <input v-model="form.link_url" type="text" placeholder="https://..." class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2 px-3 text-sm focus:border-emerald-600 outline-none font-medium" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Target</label>
              <select v-model="form.link_target" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2 px-3 text-sm outline-none font-bold">
                <option value="_blank">Tab Baru (_blank)</option>
                <option value="_self">Tab Sama (_self)</option>
              </select>
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Pin di Navbar?</label>
              <select v-model="form.link_category" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2 px-3 text-sm outline-none font-bold">
                <option value="General">Tidak</option>
                <option value="Navbar">Ya (Paling Kanan)</option>
              </select>
            </div>
          </div>
        </div>
        <div class="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button @click="showModal = false" class="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600">Batal</button>
          <button @click="saveLink" class="bg-emerald-700 text-white px-6 py-2 rounded-sm font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-700/20">
            <Save class="w-4 h-4" /> Simpan Link
          </button>
        </div>
      </div>
    </div>

    <div class="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-slate-50 border-b border-slate-200">
            <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Tautan</th>
            <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">URL Tujuan</th>
            <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Pin Navbar</th>
            <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tampil</th>
            <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="item in links" :key="item.link_id" class="hover:bg-slate-50/50 transition-all group">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div :class="item.link_category === 'Navbar' ? 'bg-yellow-100 text-yellow-700' : 'bg-emerald-50 text-emerald-600'" class="p-2 rounded-sm transition-colors">
                  <Globe v-if="item.link_category !== 'Navbar'" class="w-4 h-4" />
                  <Anchor v-else class="w-4 h-4" />
                </div>
                <span class="text-sm font-bold text-slate-800">{{ item.link_name }}</span>
              </div>
            </td>
            <td class="px-6 py-4">
              <a :href="item.link_url" target="_blank" class="text-xs text-blue-600 hover:underline flex items-center gap-1">
                {{ item.link_url }}
                <ExternalLink class="w-3 h-3" />
              </a>
            </td>
            <td class="px-6 py-4">
              <div class="flex justify-center">
                <button @click="togglePin(item)" :class="item.link_category === 'Navbar' ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-400/20' : 'bg-slate-100 text-slate-300'" class="p-1.5 rounded-sm transition-all hover:scale-110">
                  <Anchor class="w-4 h-4" />
                </button>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="flex justify-center">
                <Check v-if="item.link_visible === 'Y'" class="w-4 h-4 text-emerald-500" />
                <X v-else class="w-4 h-4 text-red-400" />
              </div>
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button @click="openEdit(item)" class="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-sm transition-all" title="Edit Link">
                  <Edit3 class="w-4 h-4" />
                </button>
                <button @click="deleteLink(item.link_id)" class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-all" title="Hapus Link">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!links || links.length === 0">
            <td colspan="5" class="px-6 py-12 text-center">
              <Link2 class="w-12 h-12 text-slate-100 mx-auto mb-3" />
              <p class="text-slate-400 font-bold text-sm uppercase tracking-widest">Belum ada tautan eksternal</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
