<script setup>
definePageMeta({
  layout: 'admin'
})

import { 
  Users, 
  Mail, 
  Trash2, 
  Edit3, 
  UserPlus,
  ShieldCheck,
  Search,
  HandCoins
} from 'lucide-vue-next'
import Swal from 'sweetalert2'

const { data: users, refresh, status } = useFetch('/api/v1/users')
const loading = computed(() => status.value === 'pending')

const searchQuery = ref('')
const filteredUsers = computed(() => {
  if (!users.value) return []
  if (!searchQuery.value) return users.value
  const q = searchQuery.value.toLowerCase()
  return users.value.filter(u => 
    u.display_name?.toLowerCase().includes(q) || 
    u.user_login?.toLowerCase().includes(q) || 
    u.user_email?.toLowerCase().includes(q) ||
    u.role?.toLowerCase().includes(q)
  )
})

const getRoleBadge = (role) => {
  switch (role?.toLowerCase()) {
    case 'admin': return 'bg-emerald-100 text-emerald-700'
    case 'editor': return 'bg-blue-100 text-blue-700'
    case 'writer': return 'bg-purple-100 text-purple-700'
    case 'pengumpulan': return 'bg-amber-100 text-amber-700'
    case 'penyaluran': return 'bg-sky-100 text-sky-700'
    default: return 'bg-slate-100 text-slate-700'
  }
}

const getRoleIcon = (role) => {
  switch (role?.toLowerCase()) {
    case 'admin': return ShieldCheck
    case 'editor': return Edit3
    case 'pengumpulan': return HandCoins
    case 'penyaluran': return HandCoins
    default: return Users
  }
}

const deleteUser = async (id) => {
  const result = await Swal.fire({
    title: 'Hapus pengguna?',
    text: "Data yang dihapus tidak bisa dikembalikan.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#047857',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  })

  if (result.isConfirmed) {
    try {
      await $fetch(`/api/v1/users/${id}`, { method: 'DELETE' })
      refresh()
      Swal.fire({
        icon: 'success',
        title: 'Terhapus!',
        text: 'Pengguna berhasil dihapus.',
        timer: 1500,
        showConfirmButton: false
      })
    } catch (e) {
      Swal.fire('Gagal!', 'Gagal menghapus pengguna.', 'error')
    }
  }
}
</script>

<template>
  <div>
    <div class="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 mb-1">Manajemen Pengguna</h1>
        <p class="text-sm text-slate-500 italic">Kelola akun administrator, editor, dan penulis website.</p>
      </div>
      <div class="flex items-center gap-2">
        <div class="relative">
          <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input v-model="searchQuery" type="text" placeholder="Cari user..." class="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-sm text-sm focus:border-emerald-600 outline-none w-64 shadow-sm" />
        </div>
        <NuxtLink to="/admin/users/new" class="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-sm font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-emerald-700/20">
          <UserPlus class="w-4 h-4" /> Tambah User
        </NuxtLink>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-slate-50 border-b border-slate-200">
            <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pengguna</th>
            <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</th>
            <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
            <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
            <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <!-- Loading State -->
          <tr v-if="loading" v-for="i in 5" :key="i">
            <td colspan="5" class="px-6 py-4">
              <div class="h-10 bg-slate-100 animate-pulse rounded-sm"></div>
            </td>
          </tr>

          <!-- Data State -->
          <template v-else>
            <tr v-for="user in filteredUsers" :key="user.ID" class="hover:bg-slate-50/50 transition-all group">
              <td class="px-6 py-4">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/10 uppercase">
                    {{ user.display_name?.charAt(0) }}
                  </div>
                  <div>
                    <p class="text-sm font-bold text-slate-800 leading-tight">{{ user.display_name }}</p>
                    <p class="text-[10px] font-mono text-slate-400">@{{ user.user_login }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2 text-slate-600">
                  <Mail class="w-3.5 h-3.5 text-slate-400" />
                  <span class="text-xs">{{ user.user_email }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span :class="getRoleBadge(user.role)" class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center w-fit gap-1.5 border border-black/5">
                  <component :is="getRoleIcon(user.role)" class="w-3 h-3" />
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-center gap-2">
                  <div :class="user.user_status === 0 ? 'bg-emerald-500' : 'bg-red-500'" class="w-1.5 h-1.5 rounded-full"></div>
                  <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{{ user.user_status === 0 ? 'Aktif' : 'Suspended' }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <NuxtLink :to="`/admin/users/${user.ID}`" class="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-sm transition-all" title="Edit User">
                    <Edit3 class="w-4 h-4" />
                  </NuxtLink>
                  <button v-if="user.ID != 1" @click="deleteUser(user.ID)" class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-all" title="Hapus User">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="filteredUsers?.length === 0">
              <td colspan="5" class="px-6 py-12 text-center">
                <div class="flex flex-col items-center gap-2 text-slate-400">
                  <Users class="w-8 h-8 opacity-20" />
                  <p class="text-sm italic">Tidak ada user ditemukan.</p>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>
