<script setup>
definePageMeta({
  layout: 'admin'
})

import { 
  ArrowLeft, 
  Save, 
  Image as ImageIcon, 
  Plus,
  X,
  Upload
} from 'lucide-vue-next'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const id = route.params.id

// Form State
const form = reactive({
  agenda_title: '',
  agenda_content: '',
  agenda_status: 'publish',
  agenda_type: 'post',
  featured_image: null,
  gallery_images: [] // Penampung file foto baru
})

const imagePreview = ref(null)
const galleryPreviews = ref([]) // Preview gabungan (lama + baru)
const { data: agenda } = await useFetch(`/api/v1/agendas/${id}`)

// Sync form with fetched data
watchEffect(() => {
  if (agenda.value) {
    form.agenda_title = agenda.value.agenda_title || ''
    form.agenda_content = agenda.value.agenda_content || ''
    form.agenda_status = agenda.value.agenda_status || 'publish'
    form.agenda_type = agenda.value.agenda_type || 'agenda'
    imagePreview.value = agenda.value.featured_image_url

    // Masukkan gambar galeri lama ke preview
    if (agenda.value.gallery_images) {
      galleryPreviews.value = [...agenda.value.gallery_images]
    }
  }
})

// Handle Gallery Changes (Multi-upload)
const onGalleryChange = (e) => {
  const files = Array.from(e.target.files)
  files.forEach(file => {
    form.gallery_images.push(file)
    galleryPreviews.value.push(URL.createObjectURL(file))
  })
  e.target.value = ''
}

const removeGalleryImage = (index) => {
  galleryPreviews.value.splice(index, 1)
}

const onFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    form.featured_image = file
    imagePreview.value = URL.createObjectURL(file)
  }
}

const loading = ref(false)
const submit = async () => {
  loading.value = true
  const formData = new FormData()
  formData.append('agenda_title', form.agenda_title)
  formData.append('agenda_content', form.agenda_content)
  formData.append('agenda_status', form.agenda_status)
  formData.append('agenda_type', form.agenda_type)
  if (form.featured_image) {
    formData.append('featured_image', form.featured_image)
  }

  // Kirim daftar galeri yang lama (yang tidak dihapus)
  const existingGalleries = galleryPreviews.value.filter(p => typeof p === 'string' && !p.startsWith('blob:'))
  formData.append('existing_galleries', JSON.stringify(existingGalleries))

  // Kirim file galeri yang baru ditambahkan
  form.gallery_images.forEach((file) => {
    formData.append('gallery_images', file)
  })

  try {
    await $fetch(`/api/v1/agendas/${id}`, {
      method: 'PUT',
      body: formData
    })
    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Agenda berhasil diperbarui!',
      timer: 1500,
      showConfirmButton: false
    })
    router.push('/admin/agendas')
  } catch (error) {
    Swal.fire('Gagal!', 'Gagal memperbarui: ' + error.message, 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <div class="flex items-center gap-4 mb-8">
      <NuxtLink to="/admin/agendas" class="p-2 hover:bg-white rounded-sm border border-slate-200 text-slate-500">
        <ArrowLeft class="w-5 h-5" />
      </NuxtLink>
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Edit Agenda</h1>
        <p class="text-sm text-slate-500">Perbarui informasi agenda yang ada.</p>
      </div>
    </div>

    <form @submit.prevent="submit" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main Content Area -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white p-6 border border-slate-200 rounded-sm shadow-sm">
          <div class="mb-6">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Judul
              Agenda</label>
            <input v-model="form.agenda_title" type="text" placeholder="Masukkan judul agenda di sini..."
              class="w-full text-xl font-bold bg-slate-50 border border-slate-200 rounded-sm py-3 px-4 focus:border-emerald-600 outline-none transition-all" />
          </div>

          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Konten
              Agenda</label>
            <AdminEditor v-model="form.agenda_content" />
          </div>
        </div>
      </div>

      <!-- Sidebar Area -->
      <div class="space-y-6">
        <!-- Post Type Box -->
        <div class="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
          <div class="px-4 py-3 bg-slate-50 border-b border-slate-200">
            <h3 class="text-xs font-black uppercase tracking-widest text-slate-800">Tipe Konten</h3>
          </div>
          <div class="p-4 grid grid-cols-2 gap-3">
            <label v-for="t in ['pimpinan', 'kegiatan', 'pengumpulan', 'pendistribusian']" :key="t"
              class="flex items-center gap-2 p-2 border border-slate-100 rounded-sm cursor-pointer hover:bg-slate-50 transition-colors"
              :class="{ 'bg-emerald-50 border-emerald-200': form.agenda_type === t }">
              <input type="radio" v-model="form.agenda_type" :value="t"
                class="w-4 h-4 text-emerald-600 focus:ring-emerald-500" />
              <span class="text-[10px] font-black uppercase tracking-widest text-slate-700">{{ t }}</span>
            </label>
          </div>
        </div>

        <!-- Publishing Box -->
        <div class="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
          <div class="px-4 py-3 bg-slate-50 border-b border-slate-200">
            <h3 class="text-xs font-black uppercase tracking-widest text-slate-800">Publikasi</h3>
          </div>
          <div class="p-4 space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-400 mb-2">Status Konten</label>
              <select v-model="form.agenda_status"
                class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2 px-3 text-sm focus:border-emerald-600 outline-none">
                <option value="publish">Publikasikan Sekarang</option>
                <option value="draft">Simpan Sebagai Draft</option>
              </select>
            </div>
            <button type="submit" :disabled="loading"
              class="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-3 rounded-sm font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 disabled:bg-slate-400">
              <Save v-if="!loading" class="w-4 h-4" />
              <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {{ loading ? 'Menyimpan...' : 'Simpan & Publikasikan' }}
            </button>
          </div>
        </div>



        <!-- Image Box -->
        <div class="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
          <div class="px-4 py-3 bg-slate-50 border-b border-slate-200">
            <h3 class="text-xs font-black uppercase tracking-widest text-slate-800">Gambar Unggulan</h3>
          </div>
          <div class="p-4">
            <div v-if="imagePreview" class="relative mb-4 group">
              <img :src="imagePreview"
                class="w-full aspect-video object-cover rounded-sm border border-slate-200 shadow-sm" />
              <button @click="imagePreview = null; form.featured_image = null"
                class="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-sm shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <X class="w-4 h-4" />
              </button>
            </div>
            <div v-else
              class="border-2 border-dashed border-slate-200 rounded-sm p-8 text-center hover:border-emerald-400 transition-colors group cursor-pointer relative">
              <input type="file" @change="onFileChange" accept="image/*"
                class="absolute inset-0 opacity-0 cursor-pointer" />
              <Upload class="w-8 h-8 text-slate-300 mx-auto mb-2 group-hover:text-emerald-500" />
              <p class="text-xs font-bold text-slate-400 group-hover:text-emerald-600 uppercase tracking-widest">
                Klik untuk Upload</p>
            </div>
          </div>
        </div>

        <!-- Galeri Foto Dinamis -->
        <div class="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
          <div class="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h3 class="text-xs font-black uppercase tracking-widest text-slate-800">Galeri Foto Kegiatan</h3>
            <label
              class="cursor-pointer bg-emerald-100 text-emerald-700 p-1.5 rounded-sm hover:bg-emerald-200 transition-colors shadow-sm">
              <Plus class="w-3 h-3" />
              <input type="file" multiple @change="onGalleryChange" accept="image/*" class="hidden" />
            </label>
          </div>
          <div class="p-4">
            <div v-if="galleryPreviews.length > 0" class="grid grid-cols-3 gap-2">
              <div v-for="(prev, idx) in galleryPreviews" :key="idx" class="relative group aspect-square">
                <img :src="prev" class="w-full h-full object-cover rounded-sm border border-slate-100 shadow-xs" />
                <button @click="removeGalleryImage(idx)" type="button"
                  class="absolute -top-1 -right-1 p-1 bg-red-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <X class="w-2.5 h-2.5" />
                </button>
              </div>
              <!-- Tombol tambah kecil di dalam grid -->
              <label
                class="border-2 border-dashed border-slate-100 rounded-sm flex items-center justify-center cursor-pointer hover:border-emerald-300 hover:bg-emerald-50 transition-all aspect-square">
                <input type="file" multiple @change="onGalleryChange" accept="image/*" class="hidden" />
                <Plus class="w-5 h-5 text-slate-300" />
              </label>
            </div>
            <div v-else class="text-center py-8 border-2 border-dashed border-slate-100 rounded-sm bg-slate-50/50">
              <label class="cursor-pointer group block">
                <input type="file" multiple @change="onGalleryChange" accept="image/*" class="hidden" />
                <ImageIcon class="w-8 h-8 text-slate-200 mx-auto mb-2 group-hover:text-emerald-400 transition-colors" />
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-emerald-600">
                  Tambah Galeri</p>
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
}
</style>