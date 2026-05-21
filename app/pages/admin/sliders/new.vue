<script setup>
definePageMeta({
  layout: 'admin'
})

import { ArrowLeft, Save, Upload, Layers } from 'lucide-vue-next'
import Swal from 'sweetalert2'

const router = useRouter()
const loading = ref(false)
const previewUrl = ref(null)

const form = reactive({
  title: '',
  caption: '',
  link_url: '',
  display_order: 1,
  status: 'active',
  image: null
})

const handleFile = (e) => {
  const file = e.target.files[0]
  if (file) {
    form.image = file
    previewUrl.value = URL.createObjectURL(file)
  }
}

const saveSlider = async () => {
  if (!form.image || !form.title) {
    Swal.fire('Oops!', 'Banner dan Judul wajib diisi!', 'warning')
    return
  }

  loading.value = true
  const formData = new FormData()
  formData.append('title', form.title)
  formData.append('caption', form.caption)
  formData.append('link_url', form.link_url)
  formData.append('display_order', form.display_order.toString())
  formData.append('status', form.status)
  formData.append('image', form.image)

  try {
    await $fetch('/api/v1/sliders', {
      method: 'POST',
      body: formData
    })
    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Banner berhasil dipasang!',
      timer: 1500,
      showConfirmButton: false
    })
    router.push('/admin/sliders')
  } catch (err) {
    Swal.fire('Gagal!', 'Gagal pasang banner: ' + err.message, 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-5xl">
    <div class="flex items-center gap-4 mb-8">
      <NuxtLink to="/admin/sliders" class="p-2 hover:bg-white rounded-sm border border-slate-200 text-slate-500">
        <ArrowLeft class="w-5 h-5" />
      </NuxtLink>
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Pasang Banner Baru</h1>
        <p class="text-sm text-slate-500 italic">Banner ini akan muncul di slide utama halaman beranda.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Banner Preview -->
      <div class="space-y-4">
        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Preview Banner</label>
        <div 
          @click="$refs.fileInput.click()"
          class="aspect-video border-2 border-dashed border-slate-200 rounded-sm flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all overflow-hidden bg-white group shadow-sm"
        >
          <div v-if="!previewUrl" class="text-center p-6">
            <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-100 transition-all">
              <Upload class="w-8 h-8" />
            </div>
            <p class="text-xs font-bold text-slate-500 uppercase tracking-tight">Pilih Gambar Banner</p>
            <p class="text-[10px] text-slate-400 mt-1 italic">Rekomendasi ukuran: 1920x800 px</p>
          </div>
          <img v-else :src="previewUrl" class="w-full h-full object-cover" />
          <input type="file" ref="fileInput" class="hidden" @change="handleFile" accept="image/*" />
        </div>
        
        <div v-if="form.title" class="p-6 bg-slate-800 text-white rounded-sm shadow-xl">
           <p class="text-[10px] font-black text-yellow-400 uppercase tracking-[0.3em] mb-2">Simulasi Tampilan</p>
           <h2 class="text-xl font-bold mb-1">{{ form.title }}</h2>
           <p class="text-xs text-slate-400 italic mb-4">{{ form.caption || 'Tanpa deskripsi...' }}</p>
           <button class="bg-yellow-400 text-slate-900 px-4 py-1.5 rounded-sm font-bold text-[10px] uppercase">Klik Selengkapnya</button>
        </div>
      </div>

      <!-- Form Inputs -->
      <div class="space-y-6 bg-white p-8 border border-slate-200 rounded-sm shadow-sm h-fit">
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Judul Banner</label>
          <input v-model="form.title" type="text" placeholder="Contoh: Selamat HUT RI ke-79" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2.5 px-4 text-sm focus:border-emerald-600 outline-none font-bold" />
        </div>

        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Deskripsi / Caption Singkat</label>
          <textarea v-model="form.caption" rows="2" placeholder="Tuliskan keterangan singkat banner..." class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2.5 px-4 text-sm focus:border-emerald-600 outline-none"></textarea>
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
            @click="saveSlider" 
            :disabled="loading"
            class="bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-3 rounded-sm font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-2 shadow-lg shadow-emerald-700/20 disabled:bg-slate-400"
          >
            <Save v-if="!loading" class="w-4 h-4" />
            <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            {{ loading ? 'Memasang Banner...' : 'Simpan Banner' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
