<script setup>
definePageMeta({
  layout: 'admin'
})

import { Tag, Plus, Trash2, Edit3, Eye, EyeOff, ChevronDown, Link as LinkIcon } from 'lucide-vue-next'

import Swal from 'sweetalert2'

const { data: categories, refresh } = await useFetch('/api/v1/categories')

const editingId = ref(null)
const form = reactive({
  name: '',
  parent: 0,
  term_navbar: 0,
  term_link: ''
})

const editCategory = (cat) => {
  editingId.value = cat.id
  form.name = cat.name
  form.parent = cat.parent
  form.term_link = cat.term_link || ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelEdit = () => {
  editingId.value = null
  form.name = ''
  form.parent = 0
  form.term_link = ''
}

const saveCategory = async () => {
  if (!form.name) return
  
  try {
    if (editingId.value) {
      // Update Mode
      await $fetch(`/api/v1/categories/${editingId.value}`, {
        method: 'PUT',
        body: form
      })
    } else {
      // Add Mode
      await $fetch('/api/v1/categories', {
        method: 'POST',
        body: form
      })
    }
    
    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Menu berhasil disimpan',
      timer: 1500,
      showConfirmButton: false
    })
    
    cancelEdit()
    refresh()
  } catch (e) {
    Swal.fire('Gagal!', 'Gagal menyimpan menu.', 'error')
  }
}

const toggleNavbar = async (cat) => {
  const newValue = cat.term_navbar === 1 ? 0 : 1
  try {
    await $fetch(`/api/v1/categories/${cat.id}`, {
      method: 'PUT',
      body: { term_navbar: newValue }
    })
    refresh()
  } catch (e) {
    Swal.fire('Error', 'Gagal memperbarui status navbar', 'error')
  }
}

const deleteCat = async (id) => {
  const result = await Swal.fire({
    title: 'Hapus menu?',
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
      await $fetch(`/api/v1/categories/${id}`, { method: 'DELETE' })
      refresh()
      Swal.fire({
        icon: 'success',
        title: 'Terhapus!',
        text: 'Menu berhasil dihapus.',
        timer: 1500,
        showConfirmButton: false
      })
    } catch (e) {
      Swal.fire('Gagal!', 'Gagal menghapus menu.', 'error')
    }
  }
}

// Group categories by hierarchy
const rootCategories = computed(() => categories.value?.filter(c => c.parent === 0) || [])
const getChildren = (parentId) => categories.value?.filter(c => c.parent === parentId) || []
</script>

<template>
  <div>
    <div class="mb-8 flex justify-between items-end">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 mb-1">Menu & Navigasi</h1>
        <p class="text-sm text-slate-500 italic">Atur susunan menu (Navbar) dan sub-menu website BAZNAS.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Form Tambah -->
      <div class="bg-white border border-slate-200 rounded-sm shadow-sm p-6 h-fit sticky top-24">
        <h3 class="text-xs font-black uppercase tracking-widest text-slate-800 mb-4 flex items-center justify-between">
          <span class="flex items-center gap-2">
            <Plus v-if="!editingId" class="w-4 h-4 text-emerald-600" /> 
            <Edit3 v-else class="w-4 h-4 text-emerald-600" />
            {{ editingId ? 'Edit Menu' : 'Tambah Menu Baru' }}
          </span>
          <button v-if="editingId" @click="cancelEdit" class="text-[9px] text-red-500 hover:underline">Batal</button>
        </h3>
        <div class="space-y-4">
          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Nama Menu / Kategori</label>
            <input v-model="form.name" type="text" placeholder="Contoh: Zakat Fitrah" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2 px-3 text-sm outline-none focus:border-emerald-600 font-bold" />
          </div>
          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block flex items-center gap-1">
              <LinkIcon class="w-3 h-3" /> Link Redirect (Opsional)
            </label>
            <input v-model="form.term_link" type="text" placeholder="Contoh: /tentang-zakat" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2 px-3 text-[10px] outline-none focus:border-emerald-600 font-medium" />
            <p class="text-[8px] text-slate-400 mt-1 italic">Kosongkan jika ingin membuka daftar kategori biasa.</p>
          </div>
          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Pilih Induk (Parent)</label>
            <select v-model="form.parent" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2 px-3 text-sm outline-none focus:border-emerald-600 font-bold">
              <option :value="0">-- Tanpa Induk (Menu Utama) --</option>
              <option v-for="cat in rootCategories" :key="cat.id" :value="cat.id" v-show="cat.id !== editingId">{{ cat.name }}</option>
            </select>
          </div>
          <button @click="saveCategory" class="w-full bg-[#fecb00] text-slate-900 py-2.5 rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-yellow-500 transition-all shadow-sm">
            {{ editingId ? 'Update Menu' : 'Simpan Menu' }}
          </button>
        </div>
      </div>

      <!-- Struktur Navigasi -->
      <div class="lg:col-span-2 space-y-4">
        <div v-for="root in rootCategories" :key="root.id" class="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
          <div class="px-6 py-4 flex justify-between items-center group bg-slate-50/50">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-emerald-600 text-white rounded-sm">
                <Tag class="w-4 h-4" />
              </div>
              <div>
                <h4 class="font-black text-slate-800 text-sm uppercase tracking-wide">{{ root.name }}</h4>
                <div class="flex items-center gap-2 mt-0.5">
                  <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">ID: #{{ root.id }} | SLUG: {{ root.slug }}</p>
                  <span v-if="root.term_navbar === 1" class="px-2 py-0.5 bg-emerald-600 text-white text-[8px] font-black rounded-sm uppercase tracking-tighter shadow-sm">Navbar</span>
                  <span v-if="root.term_link" class="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-bold rounded-sm border border-blue-100 italic">Link: {{ root.term_link }}</span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button 
                @click="toggleNavbar(root)"
                :class="[root.term_navbar === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400']"
                class="px-3 py-1.5 rounded-sm text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all"
              >
                <Eye class="w-3 h-3" /> {{ root.term_navbar === 1 ? 'Navbar ON' : 'Navbar OFF' }}
              </button>
              <div class="flex items-center bg-white border border-slate-200 rounded-sm">
                <button @click="editCategory(root)" class="p-1.5 text-slate-400 hover:text-emerald-600 border-r border-slate-100 transition-colors"><Edit3 class="w-3.5 h-3.5" /></button>
                <button @click="deleteCat(root.id)" class="p-1.5 text-slate-400 hover:text-red-600 transition-colors"><Trash2 class="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>

          <!-- Sub Menus -->
          <div class="border-t border-slate-100 divide-y divide-slate-50">
            <div v-for="child in getChildren(root.id)" :key="child.id" class="pl-16 pr-6 py-3 flex justify-between items-center group hover:bg-slate-50 transition-colors">
              <div class="flex items-center gap-3">
                <div class="w-1.5 h-1.5 rounded-full bg-emerald-300"></div>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-bold text-slate-600">{{ child.name }}</span>
                  <span v-if="child.term_link" class="text-[8px] text-blue-500 font-medium italic underline underline-offset-2">{{ child.term_link }}</span>
                  <span v-else class="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded-sm text-slate-400 font-mono italic">/{{ child.slug }}</span>
                </div>
              </div>
              <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button @click="toggleNavbar(child)" class="p-1.5 text-slate-400 hover:text-emerald-600"><Eye class="w-4 h-4" /></button>
                 <button @click="editCategory(child)" class="p-1.5 text-slate-400 hover:text-emerald-600"><Edit3 class="w-4 h-4" /></button>
                 <button @click="deleteCat(child.id)" class="p-1.5 text-slate-400 hover:text-red-600"><Trash2 class="w-4 h-4" /></button>
              </div>
            </div>
            <div v-if="getChildren(root.id).length === 0" class="px-16 py-3 text-[10px] text-slate-300 italic uppercase tracking-widest">
              Belum ada sub-menu.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
