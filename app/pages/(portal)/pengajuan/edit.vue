<script setup>
import Swal from 'sweetalert2'

definePageMeta({
  layout: 'default'
})

const route = useRoute()
const ticket = route.query.ticket

if (!ticket) {
  navigateTo('/cek-pengajuan')
}

const currentStep = ref(1)
const loading = ref(false)
const submitted = ref(false)
const dataLoaded = ref(false)

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

const onProvinceChange = async (manual = true) => {
  if (manual) {
    form.city = ''
    form.district = ''
    form.village = ''
    regencies.value = []
    districts.value = []
    villages.value = []
  }
  if (!form.province) return
  try {
    const res = await $fetch(`https://simamba.baznastangerangkab.or.id/api/wilayah/kabupaten/${form.province}`)
    regencies.value = res.data || []
  } catch (e) { console.error(e) }
}

const onRegencyChange = async (manual = true) => {
  if (manual) {
    form.district = ''
    form.village = ''
    districts.value = []
    villages.value = []
  }
  if (!form.city) return
  try {
    const res = await $fetch(`https://simamba.baznastangerangkab.or.id/api/wilayah/kecamatan/${form.city}`)
    districts.value = res.data || []
  } catch (e) { console.error(e) }
}

const onDistrictChange = async (manual = true) => {
  if (manual) {
    form.village = ''
    villages.value = []
  }
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

// Requirements for selected request
const selectedRequirements = ref([])
const fetchRequirements = async (id) => {
  try {
    const res = await $fetch(`/api/v1/requirements?request_id=${id}`)
    selectedRequirements.value = res.data || []
  } catch (e) { console.error(e) }
}

// Load Existing Data
const loadData = async () => {
  loading.value = true
  try {
    const res = await $fetch(`/api/v1/status-ticket?ticket=${ticket}`)
    if (res.status === 'success') {
      const d = res.data
      
      // Since status-ticket doesn't return ALL fields, we might need another detail API
      // But for now, let's assume we need to fetch the full submission detail
      const detail = await $fetch(`/api/v1/submissions/${d.ID}`)
      
      form.full_name = detail.fullname
      form.nik = detail.nik
      form.phone = detail.phone_number
      form.address = detail.address
      form.province = detail.province
      form.city = detail.city
      form.district = detail.district
      form.village = detail.village
      form.request_id = detail.request_id
      form.notes = detail.notes
      
      // Load requirements files
      detail.requirements.forEach(req => {
        if (req.file) {
          form.requirements[req.id] = req.file
        }
      })

      // Trigger cascade loads
      await fetchProvinces()
      await onProvinceChange(false)
      await onRegencyChange(false)
      await onDistrictChange(false)
      await fetchRequirements(form.request_id)
      
      dataLoaded.value = true
    }
  } catch (e) {
    Swal.fire('Galat', 'Gagal memuat data pengajuan.', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
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
    Swal.fire('Gagal', 'Gagal mengunggah file.', 'error')
  } finally {
    loading.value = false
  }
}

const nextStep = () => {
  currentStep.value++
}

const prevStep = () => {
  currentStep.value--
}

const updateForm = async () => {
  loading.value = true
  try {
    const res = await $fetch(`/api/v1/submissions/edit/${ticket}`, {
      method: 'PUT',
      body: {
        ...form,
        requirements: Object.keys(form.requirements).map(id => ({
          requirement_id: id,
          url: form.requirements[id]
        }))
      }
    })
    
    if (res.success) {
      Swal.fire({
        title: 'Berhasil!',
        text: 'Data pengajuan telah diperbarui.',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(() => {
        navigateTo('/cek-pengajuan')
      })
    }
  } catch (error) {
    Swal.fire('Gagal', error.data?.message || 'Gagal memperbarui data.', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-12">
    <div v-if="!dataLoaded && loading" class="text-center py-20">
       <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
       <p class="mt-4 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Memuat Data...</p>
    </div>

    <div v-else-if="dataLoaded" class="space-y-8">
      <div class="space-y-3 text-center">
        <h1 class="text-3xl font-black text-slate-800 uppercase tracking-tighter">Perbaikan Data Pengajuan</h1>
        <p class="text-xs text-slate-500 font-bold uppercase tracking-widest">Nomor Tiket: {{ ticket }}</p>
        
        <!-- Progress Bar -->
        <div class="flex items-center gap-2 pt-8 max-w-md mx-auto">
          <div v-for="step in 3" :key="step" class="flex-1 h-1.5 rounded-full transition-all duration-500" :class="[currentStep >= step ? 'bg-blue-600' : 'bg-slate-200']"></div>
        </div>
        <div class="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest max-w-md mx-auto mt-2 px-2">
          <span>Data Diri</span>
          <span>Berkas</span>
          <span>Konfirmasi</span>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-sm shadow-xl overflow-hidden">
        <!-- Step 1: Data Diri -->
        <div v-if="currentStep === 1" class="p-8 md:p-12 space-y-10">
          <div class="space-y-6">
            <div class="flex items-center gap-4 border-b border-slate-100 pb-4">
              <div class="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-black">1</div>
              <h2 class="text-lg font-black text-slate-800 uppercase tracking-tight">Data Diri</h2>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Lengkap</label>
                <input v-model="form.full_name" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-3 px-4 text-sm focus:border-blue-500 outline-none font-bold" />
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">NIK</label>
                <input v-model="form.nik" type="text" readonly class="w-full bg-slate-100 border border-slate-200 rounded-sm py-3 px-4 text-sm outline-none font-bold text-slate-500 cursor-not-allowed" />
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">No. WhatsApp</label>
                <input v-model="form.phone" type="tel" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-3 px-4 text-sm focus:border-blue-500 outline-none font-bold" />
              </div>
              <div class="space-y-2 md:col-span-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alamat Lengkap</label>
                <textarea v-model="form.address" rows="2" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-3 px-4 text-sm focus:border-blue-500 outline-none font-medium"></textarea>
              </div>

              <!-- Wilayah Selection -->
              <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Provinsi</label>
                <select v-model="form.province" @change="onProvinceChange" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-3 px-4 text-sm focus:border-blue-500 outline-none font-bold appearance-none">
                  <option value="">-- Pilih Provinsi --</option>
                  <option v-for="p in provinces" :key="p.id" :value="p.id">{{ p.nama }}</option>
                </select>
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kabupaten / Kota</label>
                <select v-model="form.city" @change="onRegencyChange" :disabled="!form.province" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-3 px-4 text-sm focus:border-blue-500 outline-none font-bold appearance-none disabled:opacity-50">
                  <option value="">-- Pilih Kabupaten --</option>
                  <option v-for="r in regencies" :key="r.id" :value="r.id">{{ r.nama }}</option>
                </select>
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kecamatan</label>
                <select v-model="form.district" @change="onDistrictChange" :disabled="!form.city" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-3 px-4 text-sm focus:border-blue-500 outline-none font-bold appearance-none disabled:opacity-50">
                  <option value="">-- Pilih Kecamatan --</option>
                  <option v-for="d in districts" :key="d.id" :value="d.id">{{ d.nama }}</option>
                </select>
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Desa / Kelurahan</label>
                <select v-model="form.village" :disabled="!form.district" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-3 px-4 text-sm focus:border-blue-500 outline-none font-bold appearance-none disabled:opacity-50">
                  <option value="">-- Pilih Desa --</option>
                  <option v-for="v in villages" :key="v.id" :value="v.id">{{ v.nama }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Berkas -->
        <div v-if="currentStep === 2" class="p-8 md:p-12 space-y-10">
          <div class="space-y-6">
            <div class="flex items-center gap-4 border-b border-slate-100 pb-4">
              <div class="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-black">2</div>
              <h2 class="text-lg font-black text-slate-800 uppercase tracking-tight">Perbaikan Berkas</h2>
            </div>

            <div class="space-y-6">
              <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jenis Bantuan</label>
                <input :value="requestTypes.find(r => r.ID === form.request_id)?.request" type="text" readonly class="w-full bg-slate-100 border border-slate-200 rounded-sm py-3 px-4 text-sm outline-none font-bold text-slate-500" />
              </div>

              <!-- Requirements Upload -->
              <div v-if="selectedRequirements.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div v-for="req in selectedRequirements" :key="req.ID" class="bg-slate-50 border border-slate-200 p-4 rounded-sm space-y-3 relative overflow-hidden">
                    <label class="text-[10px] font-black text-slate-600 uppercase tracking-widest block">{{ req.requirements }}</label>
                    
                    <div v-if="form.requirements[req.ID]" class="flex items-center gap-3">
                       <div class="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-sm flex items-center justify-center">
                          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/></svg>
                       </div>
                       <span class="text-[10px] font-bold text-emerald-700 truncate max-w-[150px]">Berkas Sudah Ada</span>
                       <button @click="form.requirements[req.ID] = ''" class="ml-auto text-red-500 hover:text-red-700">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                       </button>
                    </div>
                    <div v-else class="relative">
                       <input type="file" @change="handleFileUpload($event, req.ID)" accept="image/*,application/pdf" class="absolute inset-0 opacity-0 cursor-pointer z-10" />
                       <div class="bg-white border border-dashed border-slate-300 py-3 rounded-sm flex flex-col items-center gap-1">
                          <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                          <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Unggah Ulang</span>
                       </div>
                    </div>
                 </div>
              </div>

              <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Keterangan Perbaikan</label>
                <textarea v-model="form.notes" rows="3" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-3 px-4 text-sm focus:border-blue-500 outline-none font-medium"></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3: Konfirmasi -->
        <div v-if="currentStep === 3" class="p-8 md:p-12 space-y-10">
          <div class="space-y-6">
            <div class="flex items-center gap-4 border-b border-slate-100 pb-4">
              <div class="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-black">3</div>
              <h2 class="text-lg font-black text-slate-800 uppercase tracking-tight">Simpan Perubahan</h2>
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
               </div>
            </div>

            <div class="bg-yellow-50 border border-yellow-100 p-6 rounded-sm flex gap-4">
               <svg class="w-6 h-6 text-yellow-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
               <div class="space-y-1">
                  <p class="text-[10px] font-black text-yellow-800 uppercase tracking-widest">Konfirmasi Akhir</p>
                  <p class="text-[11px] text-yellow-700 leading-relaxed">Pastikan data perbaikan yang Anda masukkan sudah benar sebelum menekan tombol simpan.</p>
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
            class="bg-blue-600 text-white px-10 py-3 rounded-sm font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg"
          >
            Lanjut
          </button>
          <button 
            v-else
            @click="updateForm"
            :disabled="loading"
            class="bg-blue-600 text-white px-10 py-3 rounded-sm font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg disabled:bg-slate-400 flex items-center gap-2"
          >
            <div v-if="loading" class="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
            {{ loading ? 'Menyimpan...' : 'Simpan Perubahan' }}
          </button>
        </div>
      </div>
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
