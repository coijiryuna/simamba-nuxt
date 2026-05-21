<script setup>
definePageMeta({
  layout: 'admin'
})

import { 
  MessageSquare, 
  Search, 
  Send, 
  User, 
  Clock, 
  CheckCheck,
  MoreVertical,
  Phone
} from 'lucide-vue-next'

const { user } = useUserSession()

const { data: sessionsRes, refresh: refreshSessions } = await useFetch('/api/v1/chats/sessions')
const sessions = computed(() => sessionsRes.value?.data || [])

const activeSession = ref(null)
const messages = ref([])
const messageInput = ref('')
const isSending = ref(false)
const chatContainer = ref(null)

const selectSession = async (session) => {
  activeSession.value = session
  await fetchMessages()
  scrollToBottom()
}

const fetchMessages = async () => {
  if (!activeSession.value) return
  try {
    const res = await $fetch('/api/v1/chats', {
      query: { sessionId: activeSession.value.session_id }
    })
    messages.value = res.data
  } catch (e) {
    console.error('Failed to fetch messages')
  }
}

const sendMessage = async () => {
  if (!messageInput.value.trim() || isSending.value || !activeSession.value) return
  
  const text = messageInput.value
  messageInput.value = ''
  isSending.value = true
  
  try {
    await $fetch('/api/v1/chats', {
      method: 'POST',
      body: {
        sessionId: activeSession.value.session_id,
        senderRole: 'admin',
        senderName: user.value?.name || 'Admin BAZNAS',
        message: text
      }
    })
    await fetchMessages()
    scrollToBottom()
  } catch (e) {
    console.error('Failed to send message')
  } finally {
    isSending.value = false
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

// === Browser Notification ===
const prevUnreadMap = ref({})

const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission()
  }
}

const showBrowserNotif = (session) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  // Jangan notif kalau session sedang aktif & tab sedang fokus
  if (activeSession.value?.session_id === session.session_id && document.hasFocus()) return

  const notif = new Notification(`💬 Pesan baru dari ${session.guest_name || 'Tamu'}`, {
    body: session.last_message || 'Ada pesan baru masuk',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: `chat-${session.session_id}`,
  })

  // Klik notifikasi → buka tab & pilih sesi
  notif.onclick = () => {
    window.focus()
    selectSession(session)
    notif.close()
  }

  // Auto close 5 detik
  setTimeout(() => notif.close(), 5000)
}

const checkForNewMessages = (freshSessions) => {
  freshSessions.forEach((session) => {
    const prev = prevUnreadMap.value[session.session_id] ?? session.unread_count
    if (session.unread_count > prev) {
      showBrowserNotif(session)
    }
    prevUnreadMap.value[session.session_id] = session.unread_count
  })
}

// Polling for updates
onMounted(async () => {
  await requestNotificationPermission()

  const timer = setInterval(async () => {
    await refreshSessions()
    if (activeSession.value) fetchMessages()
    // Cek apakah ada pesan baru
    checkForNewMessages(sessions.value)
  }, 5000)
  
  onUnmounted(() => clearInterval(timer))
})

const formatTime = (dateStr) => {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="h-[calc(100vh-140px)] bg-white border border-slate-200 rounded-sm shadow-xl flex overflow-hidden">
    <!-- Sidebar Sessions -->
    <div class="w-80 border-r border-slate-100 flex flex-col bg-slate-50/30">
      <div class="p-6 border-b border-slate-100 bg-white">
        <h2 class="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Percakapan Aktif</h2>
        <div class="relative">
          <Search class="absolute left-3 top-2.5 w-4 h-4 text-slate-300" />
          <input type="text" placeholder="Cari sesi..." class="w-full bg-slate-50 border border-slate-200 rounded-sm pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-[#01803d]" />
        </div>
      </div>
      
      <div class="flex-1 overflow-y-auto custom-scrollbar">
        <div 
          v-for="session in sessions" 
          :key="session.session_id"
          @click="selectSession(session)"
          :class="[
            'p-4 border-b border-slate-50 cursor-pointer transition-all flex gap-3 relative group',
            activeSession?.session_id === session.session_id ? 'bg-white border-l-4 border-l-[#01803d] shadow-sm' : 'hover:bg-white/60'
          ]"
        >
          <div class="w-10 h-10 rounded-sm bg-slate-100 flex items-center justify-center shrink-0">
             <User class="w-5 h-5 text-slate-400" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-start mb-0.5">
              <span class="text-xs font-black text-slate-800 uppercase truncate pr-2">{{ session.guest_name || 'Tamu' }}</span>
              <span class="text-[8px] font-bold text-slate-300 uppercase">{{ formatTime(session.last_message_at) }}</span>
            </div>
            <p class="text-[9px] text-slate-500 truncate mb-1">{{ session.guest_contact }}</p>
            <p class="text-[10px] text-slate-400 truncate font-medium italic">"{{ session.last_message }}"</p>
          </div>
          <div v-if="session.unread_count > 0" class="absolute right-4 bottom-4 w-4 h-4 bg-pink-600 text-white text-[8px] font-black rounded-full flex items-center justify-center animate-pulse">
            {{ session.unread_count }}
          </div>
        </div>
        
        <div v-if="sessions.length === 0" class="p-12 text-center">
          <MessageSquare class="w-10 h-10 text-slate-100 mx-auto mb-4" />
          <p class="text-[10px] font-black text-slate-300 uppercase tracking-widest">Belum ada obrolan</p>
        </div>
      </div>
    </div>

    <!-- Main Chat Area -->
    <div class="flex-1 flex flex-col bg-slate-50/10">
      <template v-if="activeSession">
        <!-- Chat Header -->
        <div class="h-20 px-8 border-b border-slate-100 bg-white flex justify-between items-center shadow-sm relative z-10">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-sm bg-[#01803d]/10 flex items-center justify-center">
               <User class="w-6 h-6 text-[#01803d]" />
            </div>
            <div>
              <h3 class="text-sm font-black text-slate-800 uppercase tracking-tight">{{ activeSession.guest_name }}</h3>
              <p class="text-[10px] font-bold text-slate-500">{{ activeSession.guest_contact }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button class="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-sm transition-all"><Phone class="w-4 h-4" /></button>
            <button class="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-sm transition-all"><MoreVertical class="w-4 h-4" /></button>
          </div>
        </div>

        <!-- Messages container -->
        <div ref="chatContainer" class="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          <div v-for="msg in messages" :key="msg.id" :class="['flex', msg.sender_role === 'admin' ? 'justify-end' : 'justify-start']">
            <div :class="[
              'max-w-[70%] space-y-1.5',
              msg.sender_role === 'admin' ? 'items-end' : 'items-start'
            ]">
              <div :class="[
                'p-4 text-sm shadow-md',
                msg.sender_role === 'admin' ? 'bg-[#01803d] text-white rounded-sm rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-sm rounded-tl-none'
              ]">
                <p class="font-medium leading-relaxed">{{ msg.message }}</p>
              </div>
              <div class="flex items-center gap-2 px-1">
                <span class="text-[8px] font-bold text-slate-300 uppercase">{{ formatTime(msg.created_at) }}</span>
                <CheckCheck v-if="msg.sender_role === 'admin'" class="w-3 h-3 text-emerald-500" />
              </div>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="p-6 bg-white border-t border-slate-100 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
          <form @submit.prevent="sendMessage" class="flex gap-4">
            <input 
              v-model="messageInput"
              type="text" 
              placeholder="Tulis balasan Anda di sini..." 
              class="flex-1 bg-slate-50 border border-slate-200 rounded-sm px-6 py-4 text-sm focus:outline-none focus:border-[#01803d] font-medium"
            />
            <button 
              type="submit" 
              :disabled="!messageInput.trim() || isSending"
              class="bg-[#01803d] text-white px-8 py-4 rounded-sm hover:bg-[#016932] transition-all disabled:opacity-50 disabled:bg-slate-400 flex items-center gap-3 shadow-xl shadow-emerald-500/20"
            >
              <span class="text-xs font-black uppercase tracking-widest">Kirim</span>
              <Send class="w-4 h-4" />
            </button>
          </form>
        </div>
      </template>

      <div v-else class="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4 opacity-30">
        <div class="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
           <MessageSquare class="w-10 h-10 text-slate-400" />
        </div>
        <h3 class="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Pilih Percakapan</h3>
        <p class="text-[10px] font-bold text-slate-400 max-w-xs leading-loose">Silakan pilih salah satu percakapan di bilah sisi untuk mulai membalas pesan Muzakki atau Mustahik.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.05);
  border-radius: 10px;
}
</style>
