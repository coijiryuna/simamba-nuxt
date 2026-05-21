<script setup>
definePageMeta({
  layout: 'admin'
})

import { 
  FileText, 
  Inbox, 
  Users, 
  Clock, 
  ChevronRight, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Mail
} from 'lucide-vue-next'

const { data: data, refresh } = await useFetch('/api/v1/stats')

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short'
  })
}
</script>

<template>
  <div v-if="data">
    <div class="mb-10">
      <h1 class="text-3xl font-black text-slate-800 tracking-tight">Selamat Datang di SiMAMBA 👋</h1>
      <p class="text-slate-500 mt-1">Panel kendali pusat untuk pengelolaan data dan konten BAZNAS Kabupaten Tangerang.</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <div class="bg-white p-6 border border-slate-200 rounded-sm shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div class="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
           <FileText class="w-32 h-32" />
        </div>
        <div class="flex justify-between items-start mb-4">
          <div class="p-2 bg-blue-50 text-blue-600 rounded-sm">
            <FileText class="w-5 h-5" />
          </div>
          <span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
            <TrendingUp class="w-3 h-3" /> Aktif
          </span>
        </div>
        <p class="text-3xl font-black text-slate-800 mb-1">{{ data.stats.posts }}</p>
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Total Berita</p>
      </div>

      <div class="bg-white p-6 border border-slate-200 rounded-sm shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div class="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
           <Inbox class="w-32 h-32" />
        </div>
        <div class="flex justify-between items-start mb-4">
          <div class="p-2 bg-emerald-50 text-emerald-600 rounded-sm">
            <Inbox class="w-5 h-5" />
          </div>
        </div>
        <p class="text-3xl font-black text-slate-800 mb-1">{{ data.stats.submissions }}</p>
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Pendaftar Bantuan</p>
      </div>

      <div class="bg-white p-6 border border-slate-200 rounded-sm shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div class="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
           <Clock class="w-32 h-32" />
        </div>
        <div class="flex justify-between items-start mb-4">
          <div class="p-2 bg-yellow-50 text-yellow-600 rounded-sm">
            <Clock class="w-5 h-5" />
          </div>
        </div>
        <p class="text-3xl font-black text-slate-800 mb-1">{{ data.stats.pending }}</p>
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Menunggu Review</p>
      </div>

      <div class="bg-white p-6 border border-slate-200 rounded-sm shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div class="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
           <Mail class="w-32 h-32" />
        </div>
        <div class="flex justify-between items-start mb-4">
          <div class="p-2 bg-pink-50 text-pink-600 rounded-sm">
            <Mail class="w-5 h-5" />
          </div>
          <div v-if="data.stats.messages > 0" class="px-2 py-0.5 bg-pink-600 text-white text-[8px] font-black rounded-full animate-pulse">
            NEW
          </div>
        </div>
        <p class="text-3xl font-black text-slate-800 mb-1">{{ data.stats.messages }}</p>
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Pesan Baru</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- Recent Submissions List -->
      <div class="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
        <div class="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 class="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
            <Inbox class="w-4 h-4 text-emerald-600" /> Pendaftar Terbaru
          </h3>
          <NuxtLink to="/admin/submissions" class="text-[10px] font-black text-emerald-700 hover:underline uppercase tracking-widest">Lihat Semua</NuxtLink>
        </div>
        <div class="divide-y divide-slate-100">
          <div v-for="item in data.recentSubmissions" :key="item.ID" class="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-all group">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 bg-slate-100 rounded-sm flex items-center justify-center font-black text-slate-400 text-sm uppercase">
                {{ item.fullname?.charAt(0) }}
              </div>
              <div>
                <h4 class="text-sm font-bold text-slate-800">{{ item.fullname }}</h4>
                <p class="text-[10px] text-slate-400 mt-0.5 uppercase font-mono tracking-tighter">{{ formatDate(item.submission_date) }}</p>
              </div>
            </div>
            <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest" :class="item.status === 'approved' ? 'text-emerald-600 bg-emerald-50' : 'text-yellow-600 bg-yellow-50'">
              {{ item.status }}
            </span>
          </div>
          <div v-if="data.recentSubmissions.length === 0" class="p-12 text-center text-slate-400 italic text-sm">
            Belum ada data pendaftar.
          </div>
        </div>
      </div>

      <!-- Recent Messages List -->
      <div class="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
        <div class="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 class="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
            <Mail class="w-4 h-4 text-pink-600" /> Pesan Masuk Terbaru
          </h3>
          <NuxtLink to="/admin/messages" class="text-[10px] font-black text-pink-700 hover:underline uppercase tracking-widest">Lihat Semua</NuxtLink>
        </div>
        <div class="divide-y divide-slate-100">
          <div v-for="msg in data.recentMessages" :key="msg.id" class="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-all group">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 bg-pink-50 rounded-sm flex items-center justify-center font-black text-pink-400 text-sm uppercase">
                {{ msg.name?.charAt(0) }}
              </div>
              <div>
                <h4 class="text-sm font-bold text-slate-800">{{ msg.name }}</h4>
                <p class="text-[10px] text-slate-400 mt-0.5 uppercase font-bold tracking-tighter truncate max-w-[200px]">{{ msg.subject || '(Tanpa Subjek)' }}</p>
              </div>
            </div>
            <div class="text-[9px] font-black text-slate-300 uppercase tracking-widest">
              {{ formatDate(msg.created_at) }}
            </div>
          </div>
          <div v-if="data.recentMessages.length === 0" class="p-12 text-center text-slate-400 italic text-sm">
            Belum ada pesan masuk.
          </div>
        </div>
      </div>
    </div>

    <!-- Shortcut & Tools -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <div class="bg-white border border-slate-200 p-6 rounded-sm shadow-sm">
          <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Tips & Info Dashboard</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="flex gap-3">
              <div class="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                 <AlertCircle class="w-4 h-4 text-emerald-600" />
              </div>
              <p class="text-[11px] text-slate-600 leading-relaxed italic">
                "Gunakan gambar format <b>WebP</b> untuk performa website yang lebih cepat."
              </p>
            </div>
            <div class="flex gap-3">
              <div class="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
                 <CheckCircle class="w-4 h-4 text-pink-600" />
              </div>
              <p class="text-[11px] text-slate-600 leading-relaxed italic">
                "Cek pesan masuk secara berkala untuk menjaga kepuasan muzakki dan mustahik."
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-[#01803d] p-6 rounded-sm shadow-xl shadow-emerald-900/20 text-white relative overflow-hidden">
        <div class="relative z-10">
          <h3 class="text-sm font-black uppercase tracking-widest mb-4">Aksi Cepat</h3>
          <div class="space-y-2">
            <NuxtLink to="/admin/posts/new" class="flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-sm transition-all group">
              <span class="text-xs font-bold">Buat Berita Baru</span>
              <ChevronRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </NuxtLink>
            <NuxtLink to="/admin/gallery" class="flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-sm transition-all group">
              <span class="text-xs font-bold">Upload Galeri</span>
              <ChevronRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </NuxtLink>
          </div>
        </div>
        <div class="absolute -right-8 -bottom-8 opacity-10">
          <TrendingUp class="w-40 h-40" />
        </div>
      </div>
    </div>
  </div>
</template>
