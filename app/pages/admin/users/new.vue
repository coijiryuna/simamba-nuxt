<script setup>
definePageMeta({
  layout: 'admin'
})

import { 
  ArrowLeft, 
  Save, 
  User, 
  Mail, 
  Lock, 
  Shield,
  HandCoins
} from 'lucide-vue-next'
import Swal from 'sweetalert2'

const router = useRouter()
const loading = ref(false)

const form = reactive({
  user_login: '',
  user_email: '',
  user_pass: '',
  display_name: '',
  role: 'writer',
  user_status: 0
})

const roles = [
  { value: 'admin', label: 'Administrator', desc: 'Akses penuh ke seluruh sistem.' },
  { value: 'editor', label: 'Editor', desc: 'Bisa mengedit dan mempublikasikan konten.' },
  { value: 'writer', label: 'Writer', desc: 'Hanya bisa menulis artikel/berita.' },
  { value: 'pengumpulan', label: 'Manajemen Donasi', desc: 'Khusus mengelola data transaksi donasi.' },
  { value: 'penyaluran', label: 'Manajemen Penyaluran', desc: 'Khusus mengelola data permohonan.' }
]

const saveUser = async () => {
  if (!form.user_login || !form.user_email || !form.user_pass || !form.display_name) {
    Swal.fire('Oops!', 'Semua field wajib diisi!', 'warning')
    return
  }

  loading.value = true
  try {
    await $fetch('/api/v1/users', {
      method: 'POST',
      body: form
    })
    
    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'User baru berhasil dibuat.',
      timer: 1500,
      showConfirmButton: false
    })
    
    router.push('/admin/users')
  } catch (e) {
    Swal.fire('Gagal!', 'Gagal membuat user: ' + e.message, 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-4xl">
    <div class="flex items-center gap-4 mb-8">
      <NuxtLink to="/admin/users" class="p-2 hover:bg-white rounded-sm border border-slate-200 text-slate-500 transition-all">
        <ArrowLeft class="w-5 h-5" />
      </NuxtLink>
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Tambah User Baru</h1>
        <p class="text-sm text-slate-500 italic">Daftarkan akun administrator atau pengelola konten baru.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main Info -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white p-8 border border-slate-200 rounded-sm shadow-sm space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Username</label>
              <div class="relative">
                <User class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input v-model="form.user_login" type="text" placeholder="username" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2.5 pl-10 pr-4 text-sm focus:border-emerald-600 outline-none font-bold" />
              </div>
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nama Lengkap</label>
              <input v-model="form.display_name" type="text" placeholder="Nama Lengkap" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2.5 px-4 text-sm focus:border-emerald-600 outline-none font-bold" />
            </div>
          </div>

          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Email</label>
            <div class="relative">
              <Mail class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input v-model="form.user_email" type="email" placeholder="email@example.com" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2.5 pl-10 pr-4 text-sm focus:border-emerald-600 outline-none font-medium" />
            </div>
          </div>

          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Password</label>
            <div class="relative">
              <Lock class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input v-model="form.user_pass" type="password" placeholder="••••••••" class="w-full bg-slate-50 border border-slate-200 rounded-sm py-2.5 pl-10 pr-4 text-sm focus:border-emerald-600 outline-none font-medium" />
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <div class="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
          <div class="px-4 py-3 bg-slate-50 border-b border-slate-200">
            <h3 class="text-xs font-black uppercase tracking-widest text-slate-800">Role & Akses</h3>
          </div>
          <div class="p-4 space-y-3">
            <div 
              v-for="r in roles" 
              :key="r.value"
              @click="form.role = r.value"
              :class="[form.role === r.value ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-100 bg-slate-50/30 hover:border-slate-200']"
              class="p-3 border rounded-sm cursor-pointer transition-all group"
            >
              <div class="flex items-center justify-between mb-1">
                <span :class="form.role === r.value ? 'text-emerald-700' : 'text-slate-700'" class="text-[10px] font-black uppercase tracking-widest">{{ r.label }}</span>
                <div v-if="form.role === r.value" class="w-2 h-2 rounded-full bg-emerald-600 shadow-lg shadow-emerald-600/20"></div>
              </div>
              <p class="text-[9px] text-slate-400 leading-tight italic">{{ r.desc }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-sm shadow-sm p-4">
          <button 
            @click="saveUser" 
            :disabled="loading"
            class="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-3 rounded-sm font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 disabled:bg-slate-400"
          >
            <Save v-if="!loading" class="w-4 h-4" />
            <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            {{ loading ? 'Mendaftarkan...' : 'Simpan User' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
