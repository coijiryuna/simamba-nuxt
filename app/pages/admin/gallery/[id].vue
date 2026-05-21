<script setup>
definePageMeta({
  layout: 'admin'
})

import { ArrowLeft, Save, Upload, X, ImageIcon, Trash2 } from 'lucide-vue-next'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const previewUrl = ref(null)

const { data: item } = await useFetch(`/api/v1/gallery/${route.params.id}`)

const form = reactive({
  caption: '',
  category: '',
  description: '',
  image: null
})

watchEffect(() => {
  if (item.value) {
    form.caption = item.value.caption
    form.category = item.value.category
    form.description = item.value.description
  }
})

const handleFile = (e) => {
  const file = e.target.files[0]
  if (file) {
    form.image = file
    previewUrl.value = URL.createObjectURL(file)
  }
}

const updateGallery = async () => {
  loading.value = true
  const formData = new FormData()
  formData.append('caption', form.caption)
  formData.append('category', form.category)
  formData.append('description', form.description)
  if (form.image) formData.append('image', form.image)

  try {
    await $fetch(`/api/v1/gallery/${route.params.id}`, {
      method: 'PUT',
      body: formData
    })
    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Perubahan berhasil disimpan!',
      timer: 1500,
      showConfirmButton: false
    })
    router.push('/admin/gallery')
  } catch (err) {
    Swal.fire('Gagal!', 'Gagal update: ' + err.message, 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-4xl" v-if="item">
    <div class="flex items-center gap-4 mb-8">
      <NuxtLink to="/admin/gallery" class="p-2 hover:bg-white rounded-sm border border-slate-200 text-slate-500">
        <ArrowLeft class="w-5 h-5" />
      </NuxtLink>
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Edit Foto</h1>
        <p class="text-sm text-slate-500 italic">Perbarui informasi atau ganti foto dokumentasi.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="md:col-span-1">
        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Foto Saat Ini / Baru</label>
        <div 
          @click="$refs.fileInput.click()"
          class="aspect-square border-2 border-slate-200 rounded-sm flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all overflow-hidden bg-white group shadow-sm"
        >
          <img v-if="previewUrl" :src="previewUrl" class="w-full h-full object-cover" />
          <img v-else-if="item.images_url" :src="item.images_url" class="w-full h-full object-cover" />
          <div v-else class="text-center p-6 text-slate-400">
            <Upload class="w-8 h-8 mx-auto mb-2" />
            <p class="text-[10px] font-bold uppercase">Ganti Foto</p>
          </div>
          <input type="file" ref="fileInput" class="hidden" @change="handleFile" accept="image/*" />
        </div>
        <p class="text-[8px] text-slate-400 mt-2 text-center italic">Klik pada gambar untuk mengganti dengan foto baru.</p>
      </div>

      <div class="md:col-span-2 space-y-6 bg-white p-8 border border-slate-200 rounded-sm shadow-sm">
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Judul / Caption Foto</label>
          <input v-model="form.caption" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2.5 px-4 text-sm focus:border-emerald-600 outline-none font-bold" />
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
          <textarea v-model="form.description" rows="4" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2.5 px-4 text-sm focus:border-emerald-600 outline-none"></textarea>
        </div>

        <div class="pt-4 border-t border-slate-100 flex justify-end gap-3">
          <button 
            @click="updateGallery" 
            :disabled="loading"
            class="bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-3 rounded-sm font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-2 shadow-lg shadow-emerald-700/20 disabled:bg-slate-400"
          >
            <Save v-if="!loading" class="w-4 h-4" />
            <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            {{ loading ? 'Menyimpan...' : 'Update Foto' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
