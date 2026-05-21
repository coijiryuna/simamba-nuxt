<script setup>
import {
  LayoutDashboard,
  FileText,
  Files,
  Image as ImageIcon,
  Tag,
  Layers,
  Inbox,
  Users,
  Settings,
  Menu,
  User,
  LogOut,
  Link2,
  FileCheck,
  Wallet,
  CreditCard,
  Megaphone,
  Activity,
  MessageSquare,
  Mail,
  Bell,
  Download,
  Calendar,
} from 'lucide-vue-next'

import Swal from 'sweetalert2'

const { loggedIn, user, clear } = useUserSession()

const activeApp = ref('website') // Default tab
const isSidebarOpen = ref(true)

const { data: settingsRes } = await useFetch('/api/v1/settings')
const settings = computed(() => settingsRes.value?.data || {})

// Computed menuItems biar otomatis filter berdasarkan role dan Tab Aplikasi
const menuItems = computed(() => {
  const role = user.value?.role?.toLowerCase() || 'admin'

  const allMenus = [
    // --- APP: WEBSITE UTAMA ---
    { name: 'Dashboard Web', icon: LayoutDashboard, to: '/admin', app: 'website', exact: true },
    { name: 'Berita & Artikel', icon: FileText, to: '/admin/posts', groupHeader: 'Manajemen Konten', app: 'website' },
    { name: 'Agenda & Kegiatan', icon: Calendar, to: '/admin/agendas', app: 'website' },
    { name: 'Halaman Statis', icon: Files, to: '/admin/pages', app: 'website' },
    { name: 'Galery Foto', icon: ImageIcon, to: '/admin/gallery', app: 'website' },
    { name: 'Kategori & Menu', icon: Tag, to: '/admin/categories', app: 'website' },
    { name: 'Bank & Rekening', icon: CreditCard, to: '/admin/bank', app: 'website' },
    { name: 'Sliders Banner', icon: Layers, to: '/admin/sliders', app: 'website' },
    { name: 'Live Chat', icon: MessageSquare, to: '/admin/chats', app: 'website' },
    { name: 'Unduhan & Dokumen', icon: Download, to: '/admin/downloads', app: 'website' },
    { name: 'Tautan Eksternal', icon: Link2, to: '/admin/links', app: 'website' },
    { name: 'Master Bantuan', icon: FileCheck, to: '/admin/assistance', roles: ['admin', 'penyaluran', 'administrator'], app: 'website' },
    { name: 'Manajemen Permohonan', icon: Inbox, to: '/admin/submissions', roles: ['admin', 'penyaluran', 'administrator'], app: 'website' },
    { name: 'Pesan Masuk', icon: Mail, to: '/admin/messages', app: 'website' },

    // --- APP: PORTAL DONASI ---
    { name: 'Manajemen Donasi', icon: Wallet, to: '/admin/donations', roles: ['admin', 'pengumpulan', 'administrator'], app: 'donasi', groupHeader: 'Transaksi' },
    { name: 'Kategori & Program', icon: Megaphone, to: '/admin/campaigns', roles: ['admin', 'pengumpulan', 'administrator'], app: 'donasi', groupHeader: 'Master Data' },
    { name: 'Laporan Penyaluran', icon: Activity, to: '/admin/activities', roles: ['admin', 'pengumpulan', 'administrator'], app: 'donasi' },
    { name: 'Testimoni Donatur', icon: MessageSquare, to: '/admin/testimonials', roles: ['admin', 'pengumpulan', 'administrator'], app: 'donasi' },
    { name: 'Metode Pembayaran', icon: CreditCard, to: '/admin/payment-methods', roles: ['admin', 'administrator'], app: 'donasi' },

    // --- UMUM (SISTEM) ---
    { name: 'Manajemen User', icon: Users, to: '/admin/users', roles: ['admin', 'administrator'], groupHeader: 'Sistem & Pengaturan', app: 'all' },
    { name: 'Pengaturan', icon: Settings, to: '/admin/settings', roles: ['admin', 'administrator'], app: 'all' },
  ]

  // Filter menu: tampilkan jika (app = all atau app = activeApp) DAN role sesuai
  return allMenus.filter(menu => {
    const isAppMatch = menu.app === 'all' || menu.app === activeApp.value
    // Perbaikan logika: Cek apakah role user ada di dalam daftar roles menu
    const isRoleMatch = !menu.roles || menu.roles.includes(role)
    return isAppMatch && isRoleMatch
  })
})

const logout = async () => {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  navigateTo('/login')
}

// --- NOTIFICATION ENGINE ---
const lastNotif = reactive({
  messageId: 0,
  donationId: 0
})

const checkNotifications = async () => {
  try {
    const data = await $fetch('/api/v1/notifications/check')

    // Check for new message
    if (lastNotif.messageId > 0 && data.lastMessageId > lastNotif.messageId) {
      playNotificationSound()
      Swal.fire({
        title: 'Pesan Baru!',
        text: 'Seseorang mengirim pesan melalui formulir kontak.',
        icon: 'info',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('click', () => navigateTo('/admin/messages'))
        }
      })
    }

    // Check for new donation
    if (lastNotif.donationId > 0 && data.lastDonationId > lastNotif.donationId) {
      playNotificationSound()
      Swal.fire({
        title: 'Donasi Baru!',
        text: 'Alhamdulillah, ada transaksi donasi baru masuk.',
        icon: 'success',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('click', () => navigateTo('/admin/donations'))
        }
      })
    }

    // Update state
    lastNotif.messageId = data.lastMessageId
    lastNotif.donationId = data.lastDonationId
  } catch (e) {
    console.error('Notification check failed')
  }
}

const playNotificationSound = () => {
  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
  audio.volume = 0.5
  audio.play().catch(() => { })
}

onMounted(() => {
  // Initialize from API first without showing notif
  checkNotifications()

  // Start polling every 15 seconds
  const timer = setInterval(checkNotifications, 15000)

  onUnmounted(() => clearInterval(timer))
})

</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500/30">
    <!-- Sidebar -->
    <aside :class="[
      'fixed left-0 top-0 h-full bg-[#01803d] text-white transition-all duration-300 z-50 shadow-2xl',
      isSidebarOpen ? 'w-64' : 'w-20'
]">
      <div class="p-6 flex items-center gap-3 border-b border-white/10 mb-6 h-16 bg-[#016932]">
        <div class="w-8 h-8 bg-white rounded-sm flex items-center justify-center shadow-lg shrink-0 overflow-hidden">
          <img v-if="settings.site_logo" :src="settings.site_logo" class="w-full h-full object-contain p-1"
            alt="Logo" />
          <span v-else class="font-bold text-emerald-800 text-sm">B</span>
        </div>
        <span v-if="isSidebarOpen" class="font-bold text-xs tracking-tight text-white truncate uppercase">
          {{ settings.blogname || 'SiMAMBA Panel' }}
        </span>
      </div>

      <nav class="px-2 space-y-1 overflow-y-auto h-[calc(100vh-80px)] custom-scrollbar">
        <template v-for="(item, index) in menuItems" :key="item.name">
          <!-- Label Grup untuk Navigasi Tertentu -->
          <div v-if="item.groupHeader && isSidebarOpen"
            class="pt-4 pb-2 px-3 text-[9px] font-black text-emerald-200/50 uppercase tracking-[0.2em]">
            {{ item.groupHeader }}
          </div>

          <NuxtLink :to="item.to" :exact="item.exact === true"
            class="flex items-center gap-3 px-3 py-3 rounded-sm transition-all duration-200 group hover:bg-yellow-400 hover:text-slate-950"
            active-class="bg-yellow-400 text-slate-950 font-bold shadow-md">
            <component :is="item.icon" class="w-5 h-5 shrink-0" />
            <span v-if="isSidebarOpen" class="text-xs font-bold tracking-wide">{{ item.name }}</span>
          </NuxtLink>
        </template>
      </nav>
    </aside>

    <!-- Main Content -->
    <main :class="[
      'transition-all duration-300 min-h-screen',
      isSidebarOpen ? 'pl-64' : 'pl-20'
]">
      <!-- Header -->
      <header
        class="h-16 border-b border-slate-200 bg-white sticky top-0 z-40 flex items-center justify-between px-8 shadow-sm">
        <div class="flex items-center gap-4">
          <button @click="isSidebarOpen = !isSidebarOpen"
            class="p-2 hover:bg-slate-100 rounded-sm transition-all text-slate-600">
            <Menu class="w-5 h-5" />
          </button>

          <!-- App Switcher Tabs -->
          <div class="hidden sm:flex bg-slate-100 p-1 rounded-sm ml-4">
            <button @click="activeApp = 'website'"
              :class="['px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all', activeApp === 'website' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-700']">
              Website Utama
            </button>
            <button @click="activeApp = 'donasi'"
              :class="['px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all', activeApp === 'donasi' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700']">
              Portal Donasi
            </button>
          </div>
        </div>

        <div class="flex items-center gap-6">
          <div class="flex items-center gap-3 px-4 py-1.5 rounded-sm bg-emerald-50 border border-emerald-100">
            <div class="text-right hidden md:block">
              <p class="text-[9px] font-black text-emerald-800 uppercase tracking-widest">{{ user?.role || 'User' }}</p>
              <p class="text-xs font-bold text-slate-700 leading-none">{{ user?.name || 'Admin Utama' }}</p>
            </div>
            <div class="w-8 h-8 bg-emerald-600 rounded-sm flex items-center justify-center shadow-sm">
              <User class="w-4 h-4 text-white" />
            </div>
          </div>
          <button @click="logout" class="p-2 hover:text-red-600 transition-colors group" title="Logout">
            <LogOut class="w-5 h-5 group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      </header>

      <!-- Content Area -->
      <div class="p-8 max-w-7xl mx-auto">
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 0;
}

.router-link-active {
  transform: translateX(4px);
}
</style>
