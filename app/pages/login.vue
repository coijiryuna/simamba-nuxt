<script setup>
definePageMeta({
  layout: false
})

const { loggedIn, user, session, fetch } = useUserSession()

const credentials = reactive({
  username: '',
  password: ''
})

const loading = ref(false)
const errorMsg = ref('')

const manualLogin = async () => {
  console.log('Sending login request for:', credentials.username)
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await $fetch('/api/auth/login', {
      method: 'POST',
      body: credentials
    })
    console.log('Login response:', res)
    // Refresh session dan pindah ke admin
    console.log('Fetching session...')
    await fetch()
    console.log('Session fetched, redirecting...')
    navigateTo('/admin')
  } catch (err) {
    console.error('Login failed:', err)
    errorMsg.value = err.statusMessage || 'Username atau password salah'
  } finally {
    loading.value = false
  }
}

const loginWithGoogle = async () => {
  window.location.href = '/api/auth/google'
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-emerald-500/30 font-sans">
    <div class="w-full max-w-100">
      <!-- Logo & Branding -->
      <div class="text-center mb-10">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-[#01803d] rounded-sm shadow-2xl mb-6 rotate-3">
          <span class="text-white font-black text-3xl">B</span>
        </div>
        <h1 class="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none mb-2">SiMAMBA Panel</h1>
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Badan Amil Zakat Nasional</p>
      </div>

      <!-- Login Card -->
      <div class="bg-white border border-slate-200 rounded-sm shadow-2xl p-8 relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-1.5 bg-[#fecb00]"></div>

        <div class="mb-8">
          <h2 class="text-sm font-black text-slate-800 uppercase tracking-widest mb-1 italic">Selamat Datang</h2>
          <p class="text-xs text-slate-500 font-medium">Gunakan akun Google yang terdaftar untuk masuk ke dashboard.</p>
        </div>

        <div class="space-y-5">
          <!-- Error Message -->
          <div v-if="errorMsg" class="bg-red-50 border-l-4 border-red-500 p-3 mb-4">
            <p class="text-[10px] font-bold text-red-700 uppercase tracking-widest">{{ errorMsg }}</p>
          </div>

          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Username</label>
            <input v-model="credentials.username" type="text" placeholder="Masukkan username..."
              class="w-full bg-slate-50 border border-slate-200 rounded-sm py-3 px-4 text-sm outline-none focus:border-emerald-600 font-bold" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Password</label>
            <input v-model="credentials.password" type="password" placeholder="••••••••"
              class="w-full bg-slate-50 border border-slate-200 rounded-sm py-3 px-4 text-sm outline-none focus:border-emerald-600 font-bold" />
          </div>

          <button @click="manualLogin" :disabled="loading"
            class="w-full bg-emerald-700 text-white py-3 rounded-sm font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-700/20 active:scale-[0.98] disabled:opacity-50">
            {{ loading ? 'Masuk...' : 'Sign In' }}
          </button>

          <!-- Divider -->
          <div class="flex items-center gap-4 py-2">
            <div class="flex-1 h-px bg-slate-100"></div>
            <span class="text-[9px] font-black text-slate-300 uppercase tracking-widest">Atau</span>
            <div class="flex-1 h-px bg-slate-100"></div>
          </div>

          <button @click="loginWithGoogle"
            class="w-full bg-white border border-slate-200 py-3 rounded-sm flex items-center justify-center gap-3 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-[0.98]">
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4" />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853" />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05" />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335" />
            </svg>
            <span class="text-xs font-black text-slate-700 uppercase tracking-widest">Login with Google</span>
          </button>
        </div>

        <div class="mt-10 pt-6 border-t border-slate-100 flex flex-col items-center gap-4">
          <div class="flex items-center gap-1.5 opacity-30">
            <div class="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
            <div class="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
            <div class="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
          </div>
          <p class="text-[9px] text-slate-300 font-black uppercase tracking-[0.4em]">SiMAMBA v2.0 - 2026</p>
        </div>
      </div>

      <!-- Footer Info -->
      <p class="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-8">
        Butuh bantuan? Hubungi IT BAZNAS
      </p>
    </div>
  </div>
</template>
