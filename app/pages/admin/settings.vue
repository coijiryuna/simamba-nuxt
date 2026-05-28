<script setup>
definePageMeta({
  layout: 'admin'
})

import { 
  Settings, 
  Search, 
  Globe, 
  Share2, 
  Save, 
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Megaphone
} from 'lucide-vue-next'

import Swal from 'sweetalert2'

const { data: fetchRes, refresh: refreshFetch } = await useFetch('/api/v1/settings')

const settings = ref({})

const initSettings = () => {
  if (fetchRes.value && fetchRes.value.data) {
    const data = JSON.parse(JSON.stringify(fetchRes.value.data))
    if (!data.submission_enabled) data.submission_enabled = 'no'
    if (!data.flyer_active) data.flyer_active = 'no'
    settings.value = data
  }
}

initSettings()

const refresh = async () => {
  await refreshFetch()
  initSettings()
}

const route = useRoute()
const activeTab = ref(route.query.tab || 'general')
const loading = ref(false)

const tabs = [
  { id: 'general', name: 'Umum', icon: Settings },
  { id: 'identity', name: 'Identitas & Branding', icon: ImageIcon },
  { id: 'visimisi', name: 'Visi, Misi & Tujuan', icon: FileText },
  { id: 'social', name: 'Media Sosial', icon: Share2 },
  { id: 'features', name: 'Layanan & Fitur', icon: CheckCircle2 },
  { id: 'flyer', name: 'Flyer / Pop-up', icon: Megaphone },
  { id: 'seo', name: 'SEO & Metadata', icon: Search },
  { id: 'integration', name: 'Integrasi & Google', icon: Globe },
]

const saveSettings = async () => {
  loading.value = true
  try {
    await $fetch('/api/v1/settings', {
      method: 'POST',
      body: { ...settings.value } // Gunakan spread untuk memastikan object bersih terkirim
    })
    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Pengaturan berhasil diperbarui',
      timer: 2000,
      showConfirmButton: false
    })
    refresh()
  } catch (error) {
    Swal.fire('Gagal!', 'Gagal menyimpan pengaturan: ' + error.message, 'error')
  } finally {
    loading.value = false
  }
}

const onFileUpload = async (event, type) => {
  const file = event.target.files[0]
  if (!file) return

  const formData = new FormData()
  // Menambahkan parameter untuk mencegah konversi WebP untuk logo dan favicon
  if (type === 'logo' || type === 'favicon') {
    formData.append('convertWebp', 'no');
  }

  formData.append('file', file)
  formData.append('folder', 'website')

  try {
    const res = await $fetch('/api/v1/upload', {
      method: 'POST',
      body: formData
    })
    
    if (type === 'logo') {
      settings.value.site_logo = res.url
    } else if (type === 'favicon') {
      settings.value.site_favicon = res.url
    } else if (type === 'flyer') {
      settings.value.flyer_image = res.url
    }

    // Segera simpan perubahan ke database setelah URL logo/favicon didapat
    await saveSettings()

    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'File berhasil diunggah dan pengaturan diperbarui',
      showConfirmButton: false
    })
  } catch (error) {
    Swal.fire('Error', 'Gagal mengunggah file', 'error')
  }
}


</script>

<template>
  <div class="max-w-7xl">
    <div class="mb-8 flex justify-between items-end">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 mb-1">Pengaturan Website</h1>
        <p class="text-sm text-slate-500 italic">Kelola identitas, SEO, dan media sosial website BAZNAS.</p>
      </div>
      <button 
        @click="saveSettings" 
        :disabled="loading"
        class="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2.5 rounded-sm font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-emerald-700/20 disabled:bg-slate-400"
      >
        <Save v-if="!loading" class="w-4 h-4" />
        <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        {{ loading ? 'Menyimpan...' : 'Simpan Perubahan' }}
      </button>
    </div>


    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Sidebar Tabs -->
      <div class="w-full lg:w-64 space-y-1">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[activeTab === tab.id ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'text-slate-500 hover:bg-white border-transparent']"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-sm border text-sm font-bold transition-all text-left"
        >
          <component :is="tab.icon" class="w-4 h-4" />
          {{ tab.name }}
        </button>
      </div>

      <!-- Content Area -->
      <div class="flex-1 bg-white border border-slate-200 rounded-sm shadow-sm p-8">
        <!-- Tab: Features -->
        <div v-if="activeTab === 'features'" class="space-y-8">
          <div class="bg-emerald-50 border border-emerald-100 p-4 rounded-sm flex gap-3 items-start mb-6">
            <CheckCircle2 class="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p class="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">Manajemen Layanan Digital</p>
              <p class="text-[11px] text-emerald-700 leading-relaxed">Aktifkan atau nonaktifkan fitur layanan publik yang ada di website utama untuk mengatur ketersediaan layanan secara real-time.</p>
            </div>
          </div>

          <div class="divide-y divide-slate-100">
            <!-- Fitur Pengajuan Online -->
            <div class="py-6 flex items-center justify-between gap-8">
              <div class="space-y-1">
                <h4 class="text-sm font-bold text-slate-800 uppercase tracking-tight">Fitur Pengajuan Online</h4>
                <p class="text-[11px] text-slate-500 leading-relaxed max-w-md">Izinkan masyarakat untuk mengirimkan permohonan bantuan secara online melalui halaman khusus di website.</p>
              </div>
              <div class="flex bg-slate-100 p-1 rounded-sm shrink-0 border border-slate-200">
                <button 
                  type="button"
                  @click="settings.submission_enabled = 'yes'"
                  :class="[settings.submission_enabled === 'yes' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200']"
                  class="px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all duration-200 cursor-pointer"
                >
                  Buka
                </button>
                <button 
                  type="button"
                  @click="settings.submission_enabled = 'no'"
                  :class="[settings.submission_enabled === 'no' ? 'bg-slate-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200']"
                  class="px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all duration-200 cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>

            <!-- More features can be added here -->
          </div>
        </div>

        <!-- Tab: Flyer -->
        <div v-if="activeTab === 'flyer'" class="space-y-8">
          <div class="bg-blue-50 border border-blue-100 p-4 rounded-sm flex gap-3 items-start mb-6">
            <AlertCircle class="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p class="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Info Flyer Modal</p>
              <p class="text-[11px] text-blue-700 leading-relaxed">Flyer ini akan muncul sebagai modal popup saat pengunjung pertama kali membuka website. Gunakan untuk informasi mendesak, ajakan berdonasi, atau ucapan hari besar.</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="space-y-6">
              <div>
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Status Flyer</label>
                <div class="flex gap-4">
                  <button 
                    type="button"
                    @click="settings.flyer_active = 'yes'"
                    :class="[settings.flyer_active === 'yes' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-500 border-slate-200']"
                    class="flex-1 py-3 px-4 rounded-sm border font-bold text-xs uppercase tracking-widest transition-all cursor-pointer"
                  >
                    Aktifkan
                  </button>
                  <button 
                    type="button"
                    @click="settings.flyer_active = 'no'"
                    :class="[settings.flyer_active === 'no' ? 'bg-slate-600 text-white border-slate-600' : 'bg-white text-slate-500 border-slate-200']"
                    class="flex-1 py-3 px-4 rounded-sm border font-bold text-xs uppercase tracking-widest transition-all cursor-pointer"
                  >
                    Nonaktifkan
                  </button>
                </div>
              </div>

              <div>
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Link Tujuan (Opsional)</label>
                <input v-model="settings.flyer_link" type="text" placeholder="https://..." class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2.5 px-4 text-sm focus:border-emerald-600 outline-none" />
                <p class="text-[9px] text-slate-400 mt-1 italic">*Jika diisi, gambar flyer akan bisa diklik dan mengarah ke link ini.</p>
              </div>
            </div>

            <div class="space-y-4">
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Gambar Flyer</label>
              <div
                class="bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-sm flex flex-col items-center gap-6 group/upload relative min-h-75 justify-center">
                <div v-if="settings.flyer_image" class="relative group/img max-w-full">
                  <img :src="settings.flyer_image" class="max-h-64 object-contain shadow-xl rounded-sm border-4 border-white" />
                  <div class="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center rounded-sm">
                    <p class="text-[8px] text-white font-black uppercase tracking-widest">Ganti Gambar</p>
                  </div>
                </div>
                <div v-else class="flex flex-col items-center gap-2 text-slate-400">
                  <ImageIcon class="w-16 h-16 opacity-20" />
                  <p class="text-[10px] font-bold uppercase tracking-widest">Belum ada gambar flyer</p>
                </div>
                
                <input 
                  type="file" 
                  accept="image/*"
                  @change="onFileUpload($event, 'flyer')"
                  class="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div class="text-[9px] font-black text-emerald-700 uppercase tracking-widest bg-emerald-50 px-6 py-3 rounded-full border border-emerald-100 group-hover/upload:bg-emerald-600 group-hover/upload:text-white transition-all shadow-sm">
                  Pilih Gambar Flyer
                </div>
                <p class="text-[8px] text-slate-400 italic text-center">Disarankan aspek rasio 4:5 atau 1:1 untuk tampilan modal terbaik.</p>
              </div>
            </div>
          </div>
        </div>
        <!-- Tab: General -->
        <div v-if="activeTab === 'general'" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="md:col-span-2">
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Nama Website</label>
              <input v-model="settings.blogname" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2.5 px-4 text-sm focus:border-emerald-600 outline-none font-bold" />
            </div>
            <div class="md:col-span-2">
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Slogan / Deskripsi Singkat</label>
              <textarea v-model="settings.blogdescription" rows="3" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2.5 px-4 text-sm focus:border-emerald-600 outline-none"></textarea>
            </div>
            <div>
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Email Admin</label>
              <input v-model="settings.admin_email" type="email" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2.5 px-4 text-sm focus:border-emerald-600 outline-none" />
            </div>
            <div>
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Nomor Telepon</label>
              <input v-model="settings.site_phone" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2.5 px-4 text-sm focus:border-emerald-600 outline-none" />
            </div>
            <div class="md:col-span-2">
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Alamat Kantor</label>
              <textarea v-model="settings.site_address" rows="2" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2.5 px-4 text-sm focus:border-emerald-600 outline-none"></textarea>
            </div>
            <div class="md:col-span-2">
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Google Maps Embed/URL</label>
              <input v-model="settings.site_maps_url" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2.5 px-4 text-sm focus:border-emerald-600 outline-none" />
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'identity'" class="space-y-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Logo Upload -->
            <div class="space-y-4">
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Logo Website</label>
              <div class="bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-sm flex flex-col items-center gap-6 group/upload relative">
                <div v-if="settings.site_logo" class="relative group/img">
                  <img :src="settings.site_logo" class="h-24 object-contain bg-white p-3 shadow-md rounded-sm" />
                  <div class="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center rounded-sm">
                    <p class="text-[8px] text-white font-black uppercase tracking-widest">Ganti Gambar</p>
                  </div>
                </div>
                <div v-else class="flex flex-col items-center gap-2 text-slate-400">
                  <ImageIcon class="w-10 h-10 opacity-20" />
                  <p class="text-[10px] font-bold uppercase tracking-widest">Belum ada logo</p>
                </div>
                
                <input 
                  type="file" 
                  accept="image/*"
                  @change="onFileUpload($event, 'logo')"
                  class="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div class="text-[9px] font-black text-emerald-700 uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 group-hover/upload:bg-emerald-600 group-hover/upload:text-white transition-all">
                  Pilih File Logo
                </div>
                <p class="text-[8px] text-slate-400 italic">Rekomendasi: PNG Transparan, maks 2MB</p>
              </div>
            </div>

            <!-- Favicon Upload -->
            <div class="space-y-4">
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Favicon</label>
              <div class="bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-sm flex flex-col items-center gap-6 group/upload relative">
                <div v-if="settings.site_favicon" class="relative group/img">
                  <img :src="settings.site_favicon" class="h-12 w-12 object-contain bg-white p-2 shadow-md rounded-sm" />
                  <div class="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center rounded-sm">
                    <p class="text-[8px] text-white font-black uppercase tracking-widest">Ganti</p>
                  </div>
                </div>
                <div v-else class="flex flex-col items-center gap-2 text-slate-400">
                  <ImageIcon class="w-8 h-8 opacity-20" />
                  <p class="text-[10px] font-bold uppercase tracking-widest">Belum ada favicon</p>
                </div>
                
                <input 
                  type="file" 
                  accept="image/*"
                  @change="onFileUpload($event, 'favicon')"
                  class="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div class="text-[9px] font-black text-emerald-700 uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 group-hover/upload:bg-emerald-600 group-hover/upload:text-white transition-all">
                  Pilih File Favicon
                </div>
                <p class="text-[8px] text-slate-400 italic">Rekomendasi: ICO atau PNG, 32x32px</p>
              </div>
            </div>

            <div>
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Format Tanggal</label>
              <input v-model="settings.date_format" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2.5 px-4 text-sm focus:border-emerald-600 outline-none" />
            </div>
            <div>
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Format Waktu</label>
              <input v-model="settings.time_format" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2.5 px-4 text-sm focus:border-emerald-600 outline-none" />
            </div>
          </div>
        </div>

        <!-- Tab: SEO -->
        <div v-if="activeTab === 'seo'" class="space-y-6">
          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Meta Description (SEO)</label>
            <textarea v-model="settings.meta_description" rows="3" placeholder="Deskripsi untuk hasil pencarian Google..." class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2.5 px-4 text-sm focus:border-emerald-600 outline-none"></textarea>
          </div>
          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Meta Keywords</label>
            <input v-model="settings.meta_keywords" type="text" placeholder="zakat, tangerang, baznas..." class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2.5 px-4 text-sm focus:border-emerald-600 outline-none" />
          </div>
          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Google Analytics ID</label>
            <input v-model="settings.google_analytics" type="text" placeholder="G-XXXXXXXXXX" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2.5 px-4 text-sm focus:border-emerald-600 outline-none" />
          </div>
        </div>

        <!-- Tab: Social -->
        <div v-if="activeTab === 'social'" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Facebook URL</label>
              <input v-model="settings.site_facebook" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2.5 px-4 text-sm focus:border-emerald-600 outline-none" />
            </div>
            <div>
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Instagram URL</label>
              <input v-model="settings.site_instagram" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2.5 px-4 text-sm focus:border-emerald-600 outline-none" />
            </div>
            <div>
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">YouTube Channel</label>
              <input v-model="settings.site_youtube" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2.5 px-4 text-sm focus:border-emerald-600 outline-none" />
            </div>
            <div>
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Twitter / X URL</label>
              <input v-model="settings.site_twitter" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2.5 px-4 text-sm focus:border-emerald-600 outline-none" />
            </div>
          </div>
        </div>

        <!-- Tab: Visi Misi -->
        <div v-if="activeTab === 'visimisi'" class="space-y-8">
          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Visi Organisasi</label>
            <AdminEditor v-model="settings.vision" />
          </div>
          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Misi Organisasi</label>
            <AdminEditor v-model="settings.mission" />
          </div>
          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Tujuan (Purpose)</label>
            <AdminEditor v-model="settings.purpose" />
          </div>
          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Sasaran (Target)</label>
            <AdminEditor v-model="settings.target" />
          </div>
          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Sambutan Ketua</label>
            <AdminEditor v-model="settings.speech" />
          </div>
        </div>

        <!-- Tab: Integration -->
        <div v-if="activeTab === 'integration'" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="md:col-span-2 bg-emerald-50 p-4 rounded-sm border border-emerald-100 mb-4">
              <p class="text-[11px] text-emerald-800 font-medium">Pengaturan ini digunakan untuk menghubungkan website dengan layanan eksternal Google untuk otomasi data.</p>
            </div>
            <div>
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Google Sheet URL</label>
              <input v-model="settings.google_sheet" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2.5 px-4 text-sm focus:border-emerald-600 outline-none" />
            </div>
            <div>
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Google Sheet ID</label>
              <input v-model="settings.google_sheet_id" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2.5 px-4 text-sm focus:border-emerald-600 outline-none" />
            </div>
            <div class="md:col-span-2">
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Google Drive Folder URL</label>
              <input v-model="settings.google_drive" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2.5 px-4 text-sm focus:border-emerald-600 outline-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
