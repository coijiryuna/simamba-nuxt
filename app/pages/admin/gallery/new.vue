<script setup>
definePageMeta({
  layout: 'admin'
})

import { ArrowLeft, Save, Upload, X, ImageIcon } from 'lucide-vue-next'
import Swal from 'sweetalert2'

const router = useRouter()
const loading = ref(false)
const previewUrl = ref(null)

const form = reactive({
  caption: '',
  category: 'Kegiatan',
  description: '',
  image: null
})

const handleFile = (e) => {
  const file = e.target.files[0]
  if (file) {
    form.image = file
    previewUrl.value = URL.createObjectURL(file)
  }
}

const saveGallery = async () => {
  if (!form.image || !form.caption) {
    Swal.fire('Oops!', 'Foto dan Judul wajib diisi!', 'warning')
    return
  }

  loading.value = true
  const formData = new FormData()
  formData.append('caption', form.caption)
  formData.append('category', form.category)
  formData.append('description', form.description)
  formData.append('image', form.image)

  try {
    await $fetch('/api/v1/gallery', {
      method: 'POST',
      body: formData
    })
    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Foto berhasil di-upload!',
      timer: 1500,
      showConfirmButton: false
    })
    router.push('/admin/gallery')
  } catch (err) {
    Swal.fire('Gagal!', 'Gagal upload: ' + err.message, 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-4xl">
    <div class="flex items-center gap-4 mb-8">
      <NuxtLink to="/admin/gallery" class="p-2 hover:bg-white rounded-sm border border-slate-200 text-slate-500">
        <ArrowLeft class="w-5 h-5" />
      </NuxtLink>
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Tambah Foto Baru</h1>
        <p class="text-sm text-slate-500 italic">Upload dokumentasi kegiatan BAZNAS ke galeri.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Upload Section -->
      <div class="md:col-span-1">
        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Foto Dokumentasi</label>
        <div 
          @click="$refs.fileInput.click()"
          class="aspect-square border-2 border-dashed border-slate-200 rounded-sm flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all overflow-hidden bg-white group"
        >
          <div v-if="!previewUrl" class="text-center p-6">
            <div class="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-100 transition-all">
              <Upload class="w-6 h-6" />
            </div>
            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Klik untuk Upload</p>
            <p class="text-[8px] text-slate-400 mt-1 italic">JPG, PNG, atau WebP (Max 2MB)</p>
          </div>
          <img v-else :src="previewUrl" class="w-full h-full object-cover" />
          <input type="file" ref="fileInput" class="hidden" @change="handleFile" accept="image/*" />
        </div>
      </div>

      <!-- Form Section -->
      <div class="md:col-span-2 space-y-6 bg-white p-8 border border-slate-200 rounded-sm shadow-sm">
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Judul / Caption Foto</label>
          <input v-model="form.caption" type="text" placeholder="Masukkan judul foto..." class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2.5 px-4 text-sm focus:border-emerald-600 outline-none font-bold" />
        </div>

        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Kategori Galeri</label>
          <select v-model="form.category" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2.5 px-4 text-sm focus:border-emerald-600 outline-none font-bold">
            <option value="Kegiatan">Kegiatan</option>
            <option value="Penyaluran">Penyaluran</option>
            <option value="Rapat">Rapat / Audiensi</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>

        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Deskripsi Singkat</label>
          <textarea v-model="form.description" rows="4" placeholder="Tuliskan deskripsi atau keterangan foto..." class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2.5 px-4 text-sm focus:border-emerald-600 outline-none"></textarea>
        </div>

        <div class="pt-4 border-t border-slate-100 flex justify-end">
          <button 
            @click="saveGallery" 
            :disabled="loading"
            class="bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-3 rounded-sm font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-2 shadow-lg shadow-emerald-700/20 disabled:bg-slate-400"
          >
            <Save v-if="!loading" class="w-4 h-4" />
            <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            {{ loading ? 'Sedang Menyimpan...' : 'Simpan ke Galeri' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
