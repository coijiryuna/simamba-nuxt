<script setup>
definePageMeta({
  layout: 'default'
})

const route = useRoute()
const { data: layoutData } = useNuxtData('layout-data')
const settings = computed(() => layoutData.value?.settings || {})
const isEnabled = computed(() => settings.value.submission_enabled === 'yes')

useSeoMeta({
  title: 'Pengajuan Bantuan Online - BAZNAS Kabupaten Tangerang',
  description: 'Ajukan permohonan bantuan secara online melalui portal resmi BAZNAS Kabupaten Tangerang.',
  ogImage: () => settings.value.site_logo || '/favicon.ico',
  twitterImage: () => settings.value.site_logo || '/favicon.ico',
  twitterTitle: 'Pengajuan Bantuan Online - BAZNAS Kabupaten Tangerang',
  twitterDescription: 'Ajukan permohonan bantuan secara online melalui portal resmi BAZNAS Kabupaten Tangerang.',
  twitterCard: 'summary_large_image'

})

const currentStep = ref(1)
const loading = ref(false)
const submitted = ref(false)
const submissionId = ref('')
const nikStatus = ref(null)

const form = reactive({
  full_name: '',
  nik: '',
  phone: '',
  address: '',
  province: '',
  city: '',
  district: '',
  village: '',
  request_id: '',
  notes: '',
  requirements: {} // Map requirement_id -> url
})

// Region Data
const provinces = ref([])
const regencies = ref([])
const districts = ref([])
const villages = ref([])

const fetchProvinces = async () => {
  try {
    const res = await $fetch('https://simamba.baznastangerangkab.or.id/api/wilayah/provinsi')
    provinces.value = res.data || []
  } catch (e) { console.error(e) }
}

const onProvinceChange = async () => {
  form.city = ''
  form.district = ''
  form.village = ''
  regencies.value = []
  districts.value = []
  villages.value = []
  if (!form.province) return
  try {
    const res = await $fetch(`https://simamba.baznastangerangkab.or.id/api/wilayah/kabupaten/${form.province}`)
    regencies.value = res.data || []
  } catch (e) { console.error(e) }
}

const onRegencyChange = async () => {
  form.district = ''
  form.village = ''
  districts.value = []
  villages.value = []
  if (!form.city) return
  try {
    const res = await $fetch(`https://simamba.baznastangerangkab.or.id/api/wilayah/kecamatan/${form.city}`)
    districts.value = res.data || []
  } catch (e) { console.error(e) }
}

const onDistrictChange = async () => {
  form.village = ''
  villages.value = []
  if (!form.district) return
  try {
    const res = await $fetch(`https://simamba.baznastangerangkab.or.id/api/wilayah/desa/${form.district}`)
    villages.value = res.data || []
  } catch (e) { console.error(e) }
}

// Fetch Request Types
const { data: requestTypes } = await useFetch('/api/v1/requests', {
  transform: (res) => res.data || []
})

// Fetch All Requirements for Sidebar
const { data: allRequirements } = await useFetch('/api/v1/requirements', {
  transform: (res) => {
    const reqs = res.data || []
    return reqs.reduce((acc, curr) => {
      if (!acc[curr.request_id]) acc[curr.request_id] = []
      acc[curr.request_id].push(curr)
      return acc
    }, {})
  }
})

// Requirements for selected request form
const selectedRequirements = ref([])
watch(() => form.request_id, async (newId) => {
  if (!newId) {
    selectedRequirements.value = []
    return
  }
  try {
    const res = await $fetch(`/api/v1/requirements?request_id=${newId}`)
    selectedRequirements.value = res.data || []
  } catch (e) {
    console.error(e)
  }
})

// NIK Check
const checkNIK = async () => {
  if (form.nik.length !== 16) return
  try {
    const res = await $fetch(`/api/v1/submissions/check-nik/${form.nik}`)
    if (res.exists) {
      nikStatus.value = res.submission
    } else {
      nikStatus.value = null
    }
  } catch (e) {
    nikStatus.value = null
  }
}

watch(() => form.nik, (val) => {
  if (val.length === 16) checkNIK()
  else nikStatus.value = null
})

onMounted(() => {
  fetchProvinces()
})

const handleFileUpload = async (event, requirementId) => {
  const file = event.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', 'submissions')

  try {
    loading.value = true
    const res = await $fetch('/api/v1/upload', {
      method: 'POST',
      body: formData
    })
    form.requirements[requirementId] = res.url
  } catch (error) {
    Swal.fire({
      title: 'Gagal!',
      text: 'Gagal mengunggah file.',
      icon: 'error',
      confirmButtonText: 'OK'
    })
  } finally {
    loading.value = false
  }
}

const nextStep = () => {
  if (currentStep.value === 1) {
    if (!form.full_name || !form.nik || !form.phone || !form.address || !form.province || !form.city || !form.district || !form.village) {
      Swal.fire({
        title: 'Gagal!',
        text: 'Mohon lengkapi semua data diri dan wilayah.',
        icon: 'error',
        confirmButtonText: 'OK'
      })
      return
    }
    if (nikStatus.value) {
      Swal.fire({
        title: 'Gagal!',
        text: 'NIK ini memiliki pengajuan yang sedang berjalan.',
        icon: 'error',
        confirmButtonText: 'OK'
      })
      return
    }
  }
  currentStep.value++
}

const prevStep = () => {
  currentStep.value--
}

const submitForm = async () => {
  if (!isEnabled.value) return
  
  const missing = selectedRequirements.value.filter(req => !form.requirements[req.ID])
  if (missing.length > 0) {
    Swal.fire({
      title: 'Gagal!',
      text: 'Mohon unggah semua dokumen persyaratan.',
      icon: 'error',
      confirmButtonText: 'OK'
    })
    return
  }

  loading.value = true
  try {
    const res = await $fetch('/api/v1/submissions', {
      method: 'POST',
      body: {
        ...form,
        requirements: Object.keys(form.requirements).map(id => ({
          requirement_id: id,
          url: form.requirements[id]
        }))
      }
    })
    
    if (res.success) {
      submitted.value = true
      submissionId.value = res.submission_uid
    }
  } catch (error) {
    Swal.fire({
      title: 'Gagal!',
      text: 'Gagal mengirim pengajuan: ' + (error.data?.message || error.message),
      icon: 'error',
      confirmButtonText: 'OK'
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-12">
    <!-- Success State -->
    <div v-if="submitted" class="bg-white rounded-sm shadow-2xl overflow-hidden border border-slate-100 max-w-2xl mx-auto">
      <div class="bg-emerald-600 h-3"></div>
      <div class="p-12 text-center space-y-8">
        <div class="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto scale-110">
          <svg class="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
        </div>
        <div class="space-y-3">
          <h2 class="text-3xl font-black text-slate-800 uppercase tracking-tighter">Pengajuan Terkirim!</h2>
          <p class="text-slate-500 font-medium">Terima kasih, permohonan Anda telah kami terima dan akan segera diproses oleh tim kami.</p>
        </div>
        
        <div class="bg-slate-50 p-6 rounded-sm border-2 border-dashed border-slate-200">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Nomor Registrasi Anda</p>
          <p class="text-2xl font-black text-emerald-700 tracking-widest">{{ submissionId }}</p>
          <p class="mt-4 text-[9px] text-slate-500 font-bold italic uppercase tracking-wider leading-relaxed">Simpan nomor registrasi ini untuk mengecek status permohonan Anda di halaman Cek Pengajuan.</p>
        </div>

        <div class="flex gap-4 pt-4">
          <button @click="submitted = false; currentStep = 1; Object.assign(form, { requirements: {} })" class="flex-1 border-2 border-slate-200 py-4 rounded-sm font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">Kirim Baru</button>
          <NuxtLink to="/cek-pengajuan" class="flex-1 bg-emerald-600 text-white py-4 rounded-sm font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all text-center shadow-lg shadow-emerald-100">Cek Status</NuxtLink>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div v-else-if="isEnabled" class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      <!-- Form Column -->
      <div class="lg:col-span-8 space-y-8">
        <div class="space-y-3">
          <h1 class="text-3xl md:text-4xl font-black text-slate-800 uppercase tracking-tighter leading-tight">Pengajuan Bantuan Online</h1>
          <!-- Progress Bar -->
          <div class="flex items-center gap-2 pt-4">
            <div v-for="step in 3" :key="step" class="flex-1 h-1.5 rounded-full transition-all duration-500" :class="[currentStep >= step ? 'bg-emerald-600' : 'bg-slate-200']"></div>
          </div>
          <div class="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <span>Data Diri</span>
            <span>Jenis & Berkas</span>
            <span>Konfirmasi</span>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-sm shadow-xl overflow-hidden">
          <!-- Step 1: Data Diri & Wilayah -->
          <div v-if="currentStep === 1" class="p-8 md:p-12 space-y-10">
            <div class="space-y-6">
              <div class="flex items-center gap-4 border-b border-slate-100 pb-4">
                <div class="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center font-black">1</div>
                <h2 class="text-lg font-black text-slate-800 uppercase tracking-tight">Informasi Pribadi</h2>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Lengkap</label>
                  <input v-model="form.full_name" type="text" placeholder="Masukkan nama sesuai KTP" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-3 px-4 text-sm focus:border-emerald-500 outline-none font-medium">
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nomor NIK (KTP)</label>
                  <div class="relative">
                    <input 
                      v-model="form.nik" 
                      type="text" 
                      maxlength="16" 
                      placeholder="16 digit nomor NIK" 
                      class="w-full bg-slate-50 border border-slate-200 rounded-sm py-3 px-4 text-sm focus:border-emerald-500 outline-none font-medium"
                      :class="{'border-red-500': nikStatus}"
                    >
                    <div v-if="nikStatus" class="absolute -bottom-5 left-0">
                      <p class="text-[9px] text-red-500 font-bold uppercase tracking-wider">NIK ini sudah memiliki pengajuan aktif ({{ nikStatus.submission_uid }})</p>
                    </div>
                  </div>
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nomor WhatsApp</label>
                  <input v-model="form.phone" type="text" placeholder="Contoh: 0812XXXXXXXX" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-3 px-4 text-sm focus:border-emerald-500 outline-none font-medium">
                </div>
                <div class="space-y-2 md:col-span-2">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alamat Lengkap</label>
                  <textarea v-model="form.address" rows="2" placeholder="Nama jalan, nomor rumah, RT/RW" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-3 px-4 text-sm focus:border-emerald-500 outline-none font-medium"></textarea>
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Provinsi</label>
                  <select v-model="form.province" @change="onProvinceChange" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-3 px-4 text-sm focus:border-emerald-500 outline-none font-medium appearance-none">
                    <option value="">Pilih Provinsi</option>
                    <option v-for="p in provinces" :key="p.id" :value="p.id">{{ p.nama }}</option>
                  </select>
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kabupaten/Kota</label>
                  <select v-model="form.city" @change="onRegencyChange" :disabled="!form.province" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-3 px-4 text-sm focus:border-emerald-500 outline-none font-medium appearance-none">
                    <option value="">Pilih Kabupaten/Kota</option>
                    <option v-for="r in regencies" :key="r.id" :value="r.id">{{ r.nama }}</option>
                  </select>
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kecamatan</label>
                  <select v-model="form.district" @change="onDistrictChange" :disabled="!form.city" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-3 px-4 text-sm focus:border-emerald-500 outline-none font-medium appearance-none">
                    <option value="">Pilih Kecamatan</option>
                    <option v-for="d in districts" :key="d.id" :value="d.id">{{ d.nama }}</option>
                  </select>
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Desa/Kelurahan</label>
                  <select v-model="form.village" :disabled="!form.district" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-3 px-4 text-sm focus:border-emerald-500 outline-none font-medium appearance-none">
                    <option value="">Pilih Desa/Kelurahan</option>
                    <option v-for="v in villages" :key="v.id" :value="v.id">{{ v.nama }}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2: Jenis & Berkas -->
          <div v-if="currentStep === 2" class="p-8 md:p-12 space-y-10">
            <div class="space-y-8">
              <div class="flex items-center gap-4 border-b border-slate-100 pb-4">
                <div class="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center font-black">2</div>
                <h2 class="text-lg font-black text-slate-800 uppercase tracking-tight">Jenis Bantuan & Dokumen</h2>
              </div>

              <div class="space-y-6">
                <div class="space-y-2">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jenis Bantuan yang Diajukan</label>
                  <select v-model="form.request_id" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-3 px-4 text-sm focus:border-emerald-500 outline-none font-black appearance-none uppercase tracking-wider">
                    <option value="">Pilih Jenis Bantuan</option>
                    <option v-for="r in requestTypes" :key="r.ID" :value="r.ID">{{ r.request }}</option>
                  </select>
                </div>

                <!-- Dynamic Requirements -->
                <div v-if="selectedRequirements.length > 0" class="space-y-4">
                  <p class="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Unggah Dokumen Persyaratan</p>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div v-for="req in selectedRequirements" :key="req.ID" class="bg-slate-50 p-4 border border-slate-200 rounded-sm space-y-3 relative overflow-hidden">
                      <div class="flex items-start justify-between gap-3">
                        <p class="text-[10px] font-bold text-slate-700 uppercase leading-relaxed">{{ req.requirements }}</p>
                        <svg v-if="form.requirements[req.ID]" class="w-4 h-4 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                      </div>
                      
                      <div class="relative">
                        <input 
                          type="file" 
                          @change="(e) => handleFileUpload(e, req.ID)"
                          class="absolute inset-0 opacity-0 cursor-pointer z-10" 
                          :id="'file-' + req.ID"
                          accept="image/*,application/pdf"
                        >
                        <div class="block w-full text-center py-2 px-4 border-2 border-dashed border-slate-300 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all" :class="form.requirements[req.ID] ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'text-slate-400 bg-white'">
                          {{ form.requirements[req.ID] ? 'Berkas Diunggah' : 'Pilih Berkas' }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Keterangan Tambahan</label>
                  <textarea v-model="form.notes" rows="3" placeholder="Tambahkan keterangan jika diperlukan..." class="w-full bg-slate-50 border border-slate-200 rounded-sm py-3 px-4 text-sm focus:border-emerald-500 outline-none font-medium"></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 3: Konfirmasi -->
          <div v-if="currentStep === 3" class="p-8 md:p-12 space-y-10">
            <div class="space-y-6">
              <div class="flex items-center gap-4 border-b border-slate-100 pb-4">
                <div class="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center font-black">3</div>
                <h2 class="text-lg font-black text-slate-800 uppercase tracking-tight">Konfirmasi Pengajuan</h2>
              </div>

              <div class="bg-slate-50 rounded-sm border border-slate-100 p-6 space-y-4">
                 <div class="grid grid-cols-2 gap-4 text-[11px]">
                    <div>
                      <p class="text-slate-400 font-black uppercase tracking-widest mb-1">Nama</p>
                      <p class="text-slate-800 font-bold">{{ form.full_name }}</p>
                    </div>
                    <div>
                      <p class="text-slate-400 font-black uppercase tracking-widest mb-1">NIK</p>
                      <p class="text-slate-800 font-bold">{{ form.nik }}</p>
                    </div>
                    <div class="col-span-2">
                      <p class="text-slate-400 font-black uppercase tracking-widest mb-1">Alamat</p>
                      <p class="text-slate-800 font-bold">{{ form.address }}</p>
                    </div>
                    <div class="col-span-2">
                      <p class="text-slate-400 font-black uppercase tracking-widest mb-1">Jenis Bantuan</p>
                      <p class="text-slate-800 font-bold">{{ requestTypes.find(r => r.ID === form.request_id)?.request }}</p>
                    </div>
                 </div>
              </div>

              <div class="bg-blue-50 border border-blue-100 p-6 rounded-sm flex gap-4">
                 <svg class="w-6 h-6 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                 <div class="space-y-1">
                    <p class="text-[10px] font-black text-blue-800 uppercase tracking-widest">Informasi Penting</p>
                    <p class="text-[11px] text-blue-700 leading-relaxed">Pastikan data yang Anda masukkan sudah benar. Setelah dikirim, Anda memiliki waktu <strong>3 hari</strong> untuk melakukan perbaikan data jika diperlukan melalui halaman cek status.</p>
                 </div>
              </div>
            </div>
          </div>

          <!-- Footer Navigation -->
          <div class="bg-slate-50 p-8 border-t border-slate-100 flex items-center justify-between">
            <button v-if="currentStep > 1" @click="prevStep" class="text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-slate-800 transition-all">Kembali</button>
            <div v-else></div>
            
            <button 
              v-if="currentStep < 3" 
              @click="nextStep"
              class="bg-emerald-600 text-white px-10 py-3 rounded-sm font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg"
            >
              Lanjut
            </button>
            <button 
              v-else
              @click="submitForm"
              :disabled="loading"
              class="bg-emerald-600 text-white px-10 py-3 rounded-sm font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg disabled:bg-slate-400 flex items-center gap-2"
            >
              <div v-if="loading" class="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
              {{ loading ? 'Mengirim...' : 'Kirim Pengajuan' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="lg:col-span-4 space-y-6 sticky top-24">
        <div class="bg-white rounded-sm shadow-xl p-8 border border-slate-100">
          <h3 class="text-xs font-black text-emerald-800 uppercase tracking-[0.3em] mb-6 border-b-2 border-emerald-600 pb-3">Informasi Persyaratan</h3>
          
          <div class="space-y-8">
            <div v-for="type in requestTypes" :key="type.ID" class="group">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-1 h-6 bg-emerald-600"></div>
                <h4 class="text-[11px] font-black text-slate-800 uppercase tracking-wider leading-relaxed">{{ type.request }}</h4>
              </div>
              
              <ul class="space-y-2 pl-4 border-l border-slate-100 ml-0.5">
                <li v-for="req in allRequirements[type.ID]" :key="req.ID" class="flex gap-3 text-[10px] text-slate-500 font-medium">
                  <span class="text-emerald-500 font-black">•</span>
                  <span>{{ req.requirements }}</span>
                </li>
                <li v-if="!allRequirements[type.ID] || allRequirements[type.ID].length === 0" class="text-[9px] text-slate-400 italic">Belum ada persyaratan khusus.</li>
              </ul>
            </div>
          </div>

          <div class="mt-10 p-6 bg-slate-50 rounded-sm border border-slate-100">
            <p class="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-2">Punya Pertanyaan?</p>
            <p class="text-[10px] text-slate-500 leading-relaxed font-medium">Jika Anda memerlukan bantuan dalam proses pendaftaran, silakan hubungi Hotline BAZNAS melalui nomor WhatsApp yang tertera di bagian bawah halaman ini.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Feature Disabled State -->
    <div v-else class="bg-white border-2 border-dashed border-slate-200 rounded-sm p-12 text-center space-y-6 shadow-sm max-w-4xl mx-auto">
      <div class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
        <svg class="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-6a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
      </div>
      <div class="space-y-2">
        <h2 class="text-2xl font-black text-slate-800 uppercase tracking-tight">Layanan Ditutup Sementara</h2>
        <p class="text-slate-500 max-w-md mx-auto leading-relaxed">Mohon maaf, fitur pengajuan bantuan online sedang dinonaktifkan oleh administrator. Silakan hubungi kantor BAZNAS terdekat untuk informasi lebih lanjut.</p>
      </div>
      <NuxtLink to="/" class="inline-block bg-emerald-600 text-white px-8 py-3 rounded-sm font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg">Kembali ke Beranda</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1rem;
}
</style>
