<script setup>
definePageMeta({
  layout: 'admin'
})

import {
  ArrowLeft,
  Save,
  Image as ImageIcon,
  X,
  Upload
} from 'lucide-vue-next'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const id = route.params.id

// Form State
const form = reactive({
  post_title: '',
  post_content: '',
  post_status: 'publish',
  post_type: 'post',
  categories: [],
  tags: '',
  featured_image: null,
  post_images: []
})

const imagePreview = ref(null)
const postPreviews = ref([]) // For new post images

// Load Post Data
const { data: post } = await useFetch(`/api/v1/posts/${id}`)
const { data: categories } = await useFetch('/api/v1/categories')

// Sync form with fetched data
watchEffect(() => {
  if (post.value) {
    form.post_title = post.value.post_title || ''
    form.post_content = post.value.post_content || ''
    form.post_status = post.value.post_status || 'publish'
    form.post_type = post.value.post_type || 'post'
    form.tags = post.value.tags || ''
    imagePreview.value = post.value.featured_image_url
    // Extract category IDs
    form.categories = post.value.categories?.map(c => c.id) || []
    // Extract post image URLs
    if (post.value.post_images) {
      postPreviews.value = [...post.value.post_images]
    }
  }
})

// Handle Gallery Changes (Multi-upload)
const onGalleryChange = (e) => {
  const files = Array.from(e.target.files)
  files.forEach(file => {
    form.post_images.push(file)
    postPreviews.value.push(URL.createObjectURL(file))
  })
  e.target.value = ''
}

const removeGalleryImage = (index) => {
  postPreviews.value.splice(index, 1)
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
  formData.append('post_title', form.post_title)
  formData.append('post_content', form.post_content)
  formData.append('post_status', form.post_status)
  formData.append('post_type', form.post_type)
  formData.append('tags', form.tags)
  formData.append('categories', form.categories.join(','))
  if (form.featured_image) {
    formData.append('featured_image', form.featured_image)
  }
  // Kirim daftar galeri yang lama (yang tidak dihapus)
  const existingPosts = postPreviews.value.filter(p => typeof p === 'string' && !p.startsWith('blob:'))
  formData.append('existing_posts', JSON.stringify(existingPosts))

  // Kirim file galeri yang baru ditambahkan
  form.post_images.forEach((file) => {
    formData.append('post_images', file)
  })

  try {
    await $fetch(`/api/v1/posts/${id}`, {
      method: 'PUT',
      body: formData
    })
    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Berita berhasil diperbarui!',
      timer: 1500,
      showConfirmButton: false
    })
    router.push('/admin/posts')
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
      <NuxtLink to="/admin/posts"
        class="p-2 hover:bg-white rounded-sm border border-slate-200 text-slate-500 transition-all">
        <ArrowLeft class="w-5 h-5" />
      </NuxtLink>
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Edit Berita</h1>
        <p class="text-sm text-slate-500 italic">Perbarui informasi yang sudah ada di database.</p>
      </div>
    </div>

    <form @submit.prevent="submit" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white p-6 border border-slate-200 rounded-sm shadow-sm">
          <div class="mb-6">
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Judul
              Berita</label>
            <input v-model="form.post_title" type="text"
              class="w-full text-xl font-bold bg-slate-50 border border-slate-200 rounded-sm py-3 px-4 focus:border-emerald-600 outline-none transition-all" />
          </div>

          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Konten
              Berita</label>
            <AdminEditor v-model="form.post_content" />
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <!-- Post Type Box -->
        <div class="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
          <div class="px-4 py-3 bg-slate-50 border-b border-slate-200">
            <h3 class="text-xs font-black uppercase tracking-widest text-slate-800">Tipe Konten</h3>
          </div>
          <div class="p-4 grid grid-cols-2 gap-3">
            <label v-for="t in ['post', 'page', 'article', 'program']" :key="t"
              class="flex items-center gap-2 p-2 border border-slate-100 rounded-sm cursor-pointer hover:bg-slate-50 transition-colors"
              :class="{ 'bg-emerald-50 border-emerald-200': form.post_type === t }">
              <input type="radio" v-model="form.post_type" :value="t"
                class="w-4 h-4 text-emerald-600 focus:ring-emerald-500" />
              <span class="text-[10px] font-black uppercase tracking-widest text-slate-700">{{ t }}</span>
            </label>
          </div>
        </div>

        <!-- Publishing Box -->
        <div class="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
          <div class="px-4 py-3 bg-slate-50 border-b border-slate-200">
            <h3 class="text-xs font-black uppercase tracking-widest text-slate-800">Simpan Perubahan</h3>
          </div>
          <div class="p-4 space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-400 mb-2 italic tracking-tighter">Status Saat Ini: <span
                  class="text-emerald-700 font-black uppercase">{{ form.post_status }}</span></label>
              <select v-model="form.post_status"
                class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2 px-3 text-sm outline-none focus:border-emerald-600">
                <option value="publish">Publikasikan</option>
                <option value="draft">Draft (Sembunyikan)</option>
              </select>
            </div>
            <button type="submit" :disabled="loading"
              class="w-full bg-[#fecb00] hover:bg-yellow-500 text-slate-900 py-3 rounded-sm font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/10 disabled:bg-slate-300">
              <Save v-if="!loading" class="w-4 h-4" />
              <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-900"></div>
              {{ loading ? 'Updating...' : 'Update Berita' }}
            </button>
          </div>
        </div>

        <!-- Categories Box -->
        <div class="bg-white border border-slate-200 rounded-sm shadow-sm">
          <div
            class="px-4 py-3 bg-slate-50 border-b border-slate-200 text-xs font-black uppercase tracking-widest text-slate-800">
            Kategori</div>
          <div class="p-4 h-48 overflow-y-auto custom-scrollbar">
            <div v-for="cat in categories" :key="cat.id" class="flex items-center gap-2 mb-2">
              <input type="checkbox" :id="`cat-${cat.id}`" v-model="form.categories" :value="cat.id"
                class="w-4 h-4 rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500" />
              <label :for="`cat-${cat.id}`"
                class="text-xs text-slate-700 cursor-pointer hover:text-emerald-700 flex items-center gap-1.5">
                {{ cat.name }}
                <span v-if="cat.term_navbar === 1"
                  class="inline-flex items-center px-1 py-0.5 rounded text-[8px] font-black bg-emerald-600 text-white uppercase tracking-tighter">
                  Navbar
                </span>
              </label>
            </div>
          </div>
        </div>

        <!-- Tags Box -->
        <div class="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
          <div
            class="px-4 py-3 bg-slate-50 border-b border-slate-200 text-xs font-black uppercase tracking-widest text-slate-800">
            Tags</div>
          <div class="p-4">
            <input v-model="form.tags" type="text" placeholder="zakat, infaq, baznas..."
              class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2 px-3 text-sm focus:border-emerald-600 outline-none" />
            <p class="text-[10px] text-slate-400 mt-2 italic">Pisahkan dengan koma untuk banyak tags.</p>
          </div>
        </div>

        <!-- Image Box -->
        <div class="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
          <div
            class="px-4 py-3 bg-slate-50 border-b border-slate-200 text-xs font-black uppercase tracking-widest text-slate-800">
            Gambar Unggulan</div>
          <div class="p-4">
            <div v-if="imagePreview" class="relative mb-4 group">
              <img :src="imagePreview"
                class="w-full aspect-video object-cover rounded-sm border border-slate-200 shadow-sm" />
              <div
                class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <input type="file" @change="onFileChange" accept="image/*"
                  class="absolute inset-0 opacity-0 cursor-pointer" />
                <button
                  class="bg-white text-slate-900 px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest">Ganti
                  Gambar</button>
              </div>
              <button @click="imagePreview = null; form.featured_image = null"
                class="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-sm shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <!-- Galeri Foto Dinamis -->
        <div class="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
          <div class="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h3 class="text-xs font-black uppercase tracking-widest text-slate-800">Galeri Foto Berita
            </h3>
            <label
              class="cursor-pointer bg-emerald-100 text-emerald-700 p-1.5 rounded-sm hover:bg-emerald-200 transition-colors shadow-sm">
              <Plus class="w-3 h-3" />
              <input type="file" multiple @change="onGalleryChange" accept="image/*" class="hidden" />
            </label>
          </div>
          <div class="p-4">
            <div v-if="postPreviews.length > 0" class="grid grid-cols-3 gap-2">
              <div v-for="(prev, idx) in postPreviews" :key="idx" class="relative group aspect-square">
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
