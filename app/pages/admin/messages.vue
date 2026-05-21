<script setup>
definePageMeta({
  layout: 'admin'
})

import { 
  Mail, 
  Trash2, 
  Eye, 
  Clock, 
  User,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next'

const page = ref(1)
const { data: messagesRes, refresh, pending } = await useFetch('/api/v1/messages', {
  query: { page },
  watch: [page]
})

const messages = computed(() => messagesRes.value?.data || [])

const selectedMessage = ref(null)
const isModalOpen = ref(false)

const openMessage = (msg) => {
  selectedMessage.value = msg
  isModalOpen.value = true
  // In a real app, you would also mark it as read here via API
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="max-w-7xl">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-800 mb-1">Pesan Masuk</h1>
      <p class="text-sm text-slate-500 italic">Daftar pesan dari formulir kontak website.</p>
    </div>

    <div class="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
      <!-- Table Header -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
              <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pengirim</th>
              <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subjek & Pesan</th>
              <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal</th>
              <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="msg in messages" :key="msg.id" class="hover:bg-slate-50/50 transition-colors group">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs uppercase">
                    {{ msg.name?.charAt(0) }}
                  </div>
                  <div>
                    <div class="text-sm font-bold text-slate-800">{{ msg.name }}</div>
                    <div class="text-[10px] text-slate-400 font-mono tracking-tighter">{{ msg.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 max-w-md">
                <div class="text-sm font-bold text-slate-700 truncate mb-0.5">{{ msg.subject || '(Tanpa Subjek)' }}</div>
                <div class="text-[11px] text-slate-400 truncate italic">{{ msg.message }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {{ formatDate(msg.created_at) }}
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <button 
                  @click="openMessage(msg)"
                  class="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-sm transition-all"
                >
                  <Eye class="w-4 h-4" />
                </button>
              </td>
            </tr>
            <tr v-if="messages.length === 0 && !pending">
              <td colspan="4" class="px-6 py-20 text-center text-slate-400 italic">
                <Mail class="w-12 h-12 mx-auto mb-4 opacity-10" />
                Belum ada pesan masuk.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="messagesRes?.total > messagesRes?.limit" class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Menampilkan {{ messages.length }} dari {{ messagesRes.total }} pesan
        </p>
        <div class="flex gap-2">
          <button 
            :disabled="page === 1"
            @click="page--"
            class="p-2 border border-slate-200 rounded-sm disabled:opacity-30 hover:bg-white transition-all"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>
          <button 
            :disabled="page * messagesRes.limit >= messagesRes.total"
            @click="page++"
            class="p-2 border border-slate-200 rounded-sm disabled:opacity-30 hover:bg-white transition-all"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Message Detail Modal -->
    <Transition name="fade">
      <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <div class="bg-white w-full max-w-2xl rounded-sm shadow-2xl overflow-hidden border border-slate-100">
          <div class="px-8 py-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <div class="flex items-center gap-3 text-[#01803d]">
              <Mail class="w-5 h-5" />
              <h2 class="font-black text-xs uppercase tracking-[0.2em]">Detail Pesan</h2>
            </div>
            <button @click="isModalOpen = false" class="text-slate-400 hover:text-slate-600 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          
          <div class="p-8 space-y-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="space-y-1">
                <label class="text-[10px] font-black text-slate-300 uppercase tracking-widest block">Pengirim</label>
                <div class="text-sm font-bold text-slate-800">{{ selectedMessage.name }}</div>
                <div class="text-xs text-slate-500 italic">{{ selectedMessage.email }}</div>
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-black text-slate-300 uppercase tracking-widest block">No. Telepon / WA</label>
                <div class="text-sm font-bold text-slate-800">{{ selectedMessage.phone || '-' }}</div>
              </div>
              <div class="md:col-span-2 space-y-1">
                <label class="text-[10px] font-black text-slate-300 uppercase tracking-widest block">Subjek</label>
                <div class="text-sm font-bold text-slate-800">{{ selectedMessage.subject || '(Tanpa Subjek)' }}</div>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-[10px] font-black text-slate-300 uppercase tracking-widest block">Isi Pesan</label>
              <div class="p-6 bg-slate-50 rounded-sm border border-slate-100 text-sm text-slate-700 leading-relaxed whitespace-pre-line font-medium italic">
                "{{ selectedMessage.message }}"
              </div>
            </div>

            <div class="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-4 border-t border-slate-50">
              <Clock class="w-3 h-3" />
              Diterima pada {{ formatDate(selectedMessage.created_at) }}
            </div>
          </div>

          <div class="px-8 py-6 bg-slate-50 border-t border-slate-200 flex justify-end">
            <button 
              @click="isModalOpen = false"
              class="bg-slate-800 text-white px-8 py-2.5 rounded-sm font-black text-[10px] uppercase tracking-widest hover:bg-slate-700 transition-all shadow-lg"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </Transition>
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
