<script setup>
definePageMeta({
  layout: 'admin'
})

import { ArrowLeft, Save, Upload, Layers } from 'lucide-vue-next'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const previewUrl = ref(null)

const { data: item } = await useFetch(`/api/v1/sliders/${route.params.id}`)

const form = reactive({
  title: '',
  caption: '',
  link_url: '',
  display_order: 1,
  status: 'active',
  image: null
})

watchEffect(() => {
  if (item.value) {
    form.title = item.value.title
    form.caption = item.value.caption
    form.link_url = item.value.link_url
    form.display_order = item.value.display_order
    form.status = item.value.status
  }
})

const handleFile = (e) => {
  const file = e.target.files[0]
  if (file) {
    form.image = file
    previewUrl.value = URL.createObjectURL(file)
  }
}

const updateSlider = async () => {
  loading.value = true
  const formData = new FormData()
  formData.append('title', form.title)
  formData.append('caption', form.caption)
  formData.append('link_url', form.link_url)
  formData.append('display_order', form.display_order.toString())
  formData.append('status', form.status)
  if (form.image) formData.append('image', form.image)

  try {
    await $fetch(`/api/v1/sliders/${route.params.id}`, {
      method: 'PUT',
      body: formData
    })
    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Banner berhasil diperbarui!',
      timer: 1500,
      showConfirmButton: false
    })
    router.push('/admin/sliders')
  } catch (err) {
    Swal.fire('Gagal!', 'Gagal update banner: ' + err.message, 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-5xl" v-if="item">
    <div class="flex items-center gap-4 mb-8">
      <NuxtLink to="/admin/sliders" class="p-2 hover:bg-white rounded-sm border border-slate-200 text-slate-500">
        <ArrowLeft class="w-5 h-5" />
      </NuxtLink>
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Edit Banner</h1>
        <p class="text-sm text-slate-500 italic">Perbarui konten promosi untuk halaman beranda.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="space-y-4">
        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Tampilan Banner (Klik untuk Ganti)</label>
        <div 
          @click="$refs.fileInput.click()"
          class="aspect-video border-2 border-dashed border-slate-200 rounded-sm flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all overflow-hidden bg-white group shadow-sm"
        >
          <img v-if="previewUrl" :src="previewUrl" class="w-full h-full object-cover" />
          <img v-else-if="item.image_url" :src="item.image_url" class="w-full h-full object-cover" />
          <input type="file" ref="fileInput" class="hidden" @change="handleFile" accept="image/*" />
        </div>
      </div>

      <div class="space-y-6 bg-white p-8 border border-slate-200 rounded-sm shadow-sm h-fit">
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Judul Banner</label>
          <input v-model="form.title" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2.5 px-4 text-sm focus:border-emerald-600 outline-none font-bold" />
        </div>

        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Deskripsi / Caption Singkat</label>
          <textarea v-model="form.caption" rows="2" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2.5 px-4 text-sm focus:border-emerald-600 outline-none"></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Urutan Tampil</label>
            <input v-model="form.display_order" type="number" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2.5 px-4 text-sm focus:border-emerald-600 outline-none font-bold" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Status Banner</label>
            <select v-model="form.status" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2.5 px-4 text-sm focus:border-emerald-600 outline-none font-bold">
              <option value="active">Aktif (Tampilkan)</option>
              <option value="inactive">Non-Aktif (Draft)</option>
            </select>
          </div>
        </div>

        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Link Tujuan (Redirect)</label>
          <input v-model="form.link_url" type="text" placeholder="https://..." class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2.5 px-4 text-sm focus:border-emerald-600 outline-none font-medium" />
        </div>

        <div class="pt-6 border-t border-slate-100 flex justify-end">
          <button 
            @click="updateSlider" 
            :disabled="loading"
            class="bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-3 rounded-sm font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-2 shadow-lg shadow-emerald-700/20 disabled:bg-slate-400"
          >
            <Save v-if="!loading" class="w-4 h-4" />
            <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            {{ loading ? 'Sedang Menyimpan...' : 'Simpan Perubahan' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
