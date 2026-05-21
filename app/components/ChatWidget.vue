<script setup>
import { MessageCircle, X, Send, User } from 'lucide-vue-next'

const isOpen = ref(false)
const message = ref('')
const messages = ref([])
const sessionId = ref('')
const isSending = ref(false)
const chatContainer = ref(null)

const guestName = ref('')
const guestContact = ref('')
const isRegistered = ref(false)
const showPrompt = ref(false)

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 11) return 'Selamat Pagi'
  if (hour >= 11 && hour < 15) return 'Selamat Siang'
  if (hour >= 15 && hour < 18) return 'Selamat Sore'
  return 'Selamat Malam'
})

// Initialize session ID
onMounted(() => {
  let storedId = localStorage.getItem('chat_session_id')
  if (!storedId) {
    storedId = 'sess_' + Math.random().toString(36).substring(2, 15)
    localStorage.getItem('chat_session_id', storedId)
  }
  sessionId.value = storedId
  
  const savedName = localStorage.getItem('chat_guest_name')
  const savedContact = localStorage.getItem('chat_guest_contact')
  if (savedName && savedContact) {
    guestName.value = savedName
    guestContact.value = savedContact
    isRegistered.value = true
  }

  // Start polling for new messages if open
  setInterval(() => {
    if (isOpen.value) {
      fetchMessages()
    }
  }, 5000)

  // Show prompt after 8 seconds
  setTimeout(() => {
    if (!isOpen.value && !isRegistered.value) {
      showPrompt.value = true
    }
  }, 8000)
})

const toggleChat = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    showPrompt.value = false
    fetchMessages()
  }
}

const fetchMessages = async () => {
  try {
    const res = await $fetch('/api/v1/chats', {
      query: { sessionId: sessionId.value }
    })
    messages.value = res.data
    scrollToBottom()
  } catch (e) {
    console.error('Failed to fetch chats')
  }
}

const sendMessage = async () => {
  if (!message.value.trim() || isSending.value) return
  
  const text = message.value
  message.value = ''
  isSending.value = true
  
  try {
    await $fetch('/api/v1/chats', {
      method: 'POST',
      body: {
        sessionId: sessionId.value,
        senderRole: 'guest',
        senderName: guestName.value,
        senderContact: guestContact.value,
        message: text
      }
    })
    await fetchMessages()
  } catch (e) {
    console.error('Failed to send message')
  } finally {
    isSending.value = false
  }
}

const registerGuest = () => {
  if (guestName.value.trim() && guestContact.value.trim()) {
    localStorage.setItem('chat_guest_name', guestName.value)
    localStorage.setItem('chat_guest_contact', guestContact.value)
    isRegistered.value = true
    fetchMessages()
  }
}


const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

watch(isOpen, (val) => {
  if (val) scrollToBottom()
})
</script>

<template>
  <div class="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
    <!-- Chat Window -->
    <Transition name="slide-up">
      <div v-if="isOpen" class="mb-4 w-[350px] md:w-[400px] h-[500px] bg-white rounded-sm shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        <!-- Header -->
        <div class="bg-[#01803d] p-6 text-white flex justify-between items-center shadow-lg">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle class="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 class="text-xs font-black uppercase tracking-widest leading-none mb-1">Layanan BAZNAS</h3>
              <p class="text-[9px] font-bold text-emerald-100 uppercase tracking-widest flex items-center gap-1">
                <span class="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></span> Online
              </p>
            </div>
          </div>
          <button @click="isOpen = false" class="text-white/60 hover:text-white transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Messages Area -->
        <div v-if="isRegistered" ref="chatContainer" class="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50 custom-scrollbar">
          <div v-if="messages.length === 0" class="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
             <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                <User class="w-8 h-8 text-slate-200" />
             </div>
             <div>
               <p class="text-xs font-black text-slate-800 uppercase tracking-widest mb-1">Assalamu'alaikum!</p>
               <p class="text-[10px] text-slate-500 font-medium">Ada yang bisa kami bantu hari ini? Silakan tuliskan pesan Anda di bawah.</p>
             </div>
          </div>

          <div v-for="msg in messages" :key="msg.id" :class="['flex', msg.sender_role === 'guest' ? 'justify-end' : 'justify-start']">
            <div :class="[
              'max-w-[80%] p-4 rounded-sm text-sm shadow-sm',
              msg.sender_role === 'guest' ? 'bg-[#01803d] text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
            ]">
              <p class="font-medium">{{ msg.message }}</p>
              <p :class="['text-[8px] mt-2 font-bold uppercase tracking-widest opacity-60', msg.sender_role === 'guest' ? 'text-right' : 'text-left']">
                {{ new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Pre-Chat Registration Form -->
        <div v-else class="flex-1 p-8 bg-slate-50 flex flex-col justify-center">
           <div class="mb-8 text-center">
              <h4 class="text-sm font-black text-slate-800 uppercase tracking-widest mb-2">Selamat Datang</h4>
              <p class="text-[10px] text-slate-500 font-medium leading-loose">Silakan isi data diri Anda agar kami dapat menghubungi Anda kembali.</p>
           </div>
           <form @submit.prevent="registerGuest" class="space-y-4">
              <div class="space-y-1">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nama Anda</label>
                <input v-model="guestName" required type="text" class="w-full px-4 py-3 bg-white border border-slate-200 rounded-sm text-xs focus:outline-none focus:border-[#01803d] font-bold" placeholder="Masukkan nama lengkap">
              </div>
              <div class="space-y-1">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">No. WA / Email</label>
                <input v-model="guestContact" required type="text" class="w-full px-4 py-3 bg-white border border-slate-200 rounded-sm text-xs focus:outline-none focus:border-[#01803d] font-bold" placeholder="Contoh: 08123456789 atau email@anda.com">
              </div>
              <button type="submit" class="w-full bg-[#01803d] text-white py-4 rounded-sm font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#016932] transition-all shadow-lg shadow-emerald-500/20 mt-4">
                Mulai Obrolan
              </button>
           </form>
        </div>

        <!-- Input Area -->
        <form v-if="isRegistered" @submit.prevent="sendMessage" class="p-4 bg-white border-t border-slate-100 flex gap-2">
          <input 
            v-model="message"
            type="text" 
            placeholder="Tulis pesan..." 
            class="flex-1 bg-slate-50 border border-slate-200 rounded-sm px-4 py-2 text-xs focus:outline-none focus:border-[#01803d] font-medium"
          />
          <button 
            type="submit" 
            :disabled="!message.trim() || isSending"
            class="bg-[#01803d] text-white p-2 rounded-sm hover:bg-[#016932] transition-all disabled:opacity-50 disabled:bg-slate-400 shadow-lg shadow-emerald-500/20"
          >
            <Send class="w-4 h-4" />
          </button>
        </form>
      </div>
    </Transition>

    <!-- Floating Button -->
    <div class="relative flex flex-col items-end">
      <!-- Help Prompt Bubble -->
      <Transition name="pop">
        <div v-if="showPrompt && !isOpen" class="mb-4 mr-2 bg-white p-5 rounded-sm shadow-2xl border border-slate-100 relative w-56 animate-float">
          <button @click="showPrompt = false" class="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors border border-slate-100">
            <X :size="12" />
          </button>
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
               <User :size="20" class="text-[#01803d]" />
            </div>
            <div>
               <p class="text-[13px] font-black text-slate-800 uppercase tracking-tight leading-tight mb-1 italic">{{ greeting }}!</p>
               <p class="text-[11px] text-slate-600 font-bold leading-relaxed">Ada yang bisa kami bantu hari ini?</p>
            </div>
          </div>
          <!-- Triangle Tail -->
          <div class="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r border-b border-slate-100 rotate-45"></div>
        </div>
      </Transition>

      <button 
        @click="toggleChat"
        class="w-14 h-14 bg-[#01803d] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all active:scale-95 group relative z-50 animate-pulse-glow"
      >
        <Transition name="fade" mode="out-in">
          <MessageCircle v-if="!isOpen" class="w-6 h-6" />
          <X v-else class="w-6 h-6" />
        </Transition>
        <div v-if="!isOpen && !showPrompt" class="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white animate-bounce"></div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.05);
  border-radius: 10px;
}

/* New Animations */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes pulse-glow {
  0% { box-shadow: 0 0 0 0 rgba(1, 128, 61, 0.4); }
  70% { box-shadow: 0 0 0 15px rgba(1, 128, 61, 0); }
  100% { box-shadow: 0 0 0 0 rgba(1, 128, 61, 0); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-pulse-glow {
  animation: pulse-glow 2s infinite;
}

.pop-enter-active {
  animation: pop-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.pop-leave-active {
  animation: pop-in 0.3s reverse ease-in;
}

@keyframes pop-in {
  0% { opacity: 0; transform: scale(0.5) translateY(20px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
