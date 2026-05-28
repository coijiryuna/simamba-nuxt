<script setup>
import { 
  Calculator, Coins, Users, Info, 
  ArrowRight, CheckCircle2, AlertCircle,
  TrendingUp, Scale
} from 'lucide-vue-next'

const { data: calcData, refresh } = await useAsyncData('kalkulator-data', () => $fetch('/api/kalkulator-data'))

const activeTab = ref('maal') // 'maal' or 'fitrah'
const harta = ref('')
const jiwa = ref('1')

const goldPrice = computed(() => calcData.value?.goldPrice || 0)
const fitrahPrice = computed(() => calcData.value?.fitrahPrice || 45000)
const nisabValue = computed(() => goldPrice.value * 85)

const isMaalObligatory = computed(() => {
  const val = parseFloat(harta.value) || 0
  return val >= nisabValue.value
})

const zakatMaalAmount = computed(() => {
  const val = parseFloat(harta.value) || 0
  return Math.round(val * 0.025)
})

const zakatFitrahAmount = computed(() => {
  const count = parseInt(jiwa.value) || 0
  return count * fitrahPrice.value
})

const formatIDR = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val)
}

useSeoMeta({
  title: 'Kalkulator Zakat - BAZNAS Kabupaten Tangerang',
  description: 'Hitung kewajiban zakat maal dan zakat fitrah Anda dengan mudah dan akurat sesuai syariat.'
  
})
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-12">
    <div class="text-center mb-12">
      <h1 class="text-xl md:text-3xl font-black text-slate-800 uppercase tracking-tighter mb-4">Kalkulator Zakat</h1>
      <p class="text-slate-500 max-w-lg mx-auto font-medium">
        Tunaikan kewajiban Anda dengan perhitungan yang akurat dan transparan sesuai ketentuan syariah.
      </p>
    </div>

    <!-- Tabs Selection -->
    <div class="flex p-1.5 bg-slate-100 rounded-sm mb-8 max-w-md mx-auto">
      <button 
        @click="activeTab = 'maal'"
        :class="activeTab === 'maal' ? 'bg-white shadow-md text-[#01803d]' : 'text-slate-500 hover:text-slate-700'"
        class="flex-1 py-3 px-6 rounded-sm font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2"
      >
        <Coins :size="16" />
        Zakat Maal
      </button>
      <button 
        @click="activeTab = 'fitrah'"
        :class="activeTab === 'fitrah' ? 'bg-white shadow-md text-[#01803d]' : 'text-slate-500 hover:text-slate-700'"
        class="flex-1 py-3 px-6 rounded-sm font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2"
      >
        <Users :size="16" />
        Zakat Fitrah
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Input Section -->
      <div class="lg:col-span-7 space-y-6">
        <div class="bg-white rounded-sm shadow-xl border border-slate-100 p-8">
          
          <div v-if="activeTab === 'maal'" class="space-y-6 animate-in fade-in duration-500">
            <div class="flex items-center gap-4 mb-8">
              <div class="w-12 h-12 bg-emerald-50 text-[#01803d] rounded-sm flex items-center justify-center">
                <Scale :size="24" />
              </div>
              <div>
                <h2 class="text-lg font-black text-slate-900 uppercase leading-none">Zakat Maal</h2>
                <p class="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">Harta Kekayaan (Tabungan/Emas)</p>
              </div>
            </div>

            <div class="space-y-4">
              <label class="block text-[11px] font-black text-slate-700 uppercase tracking-widest">Total Harta (Rupiah)</label>
              <div class="relative">
                <span class="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300">Rp</span>
                <input 
                  v-model="harta"
                  type="number" 
                  placeholder="0"
                  class="w-full bg-slate-50 border-2 border-slate-100 rounded-sm pl-16 pr-6 py-5 text-xl font-black text-slate-700 focus:border-[#01803d] focus:ring-0 transition-all placeholder:text-slate-200"
                >
              </div>
            </div>

            <div class="p-6 bg-emerald-50 rounded-sm border border-emerald-100 flex items-start gap-4 mt-8">
              <Info :size="20" class="text-[#01803d] shrink-0 mt-1" />
              <div>
                <p class="text-[10px] font-black text-[#01803d] uppercase tracking-widest mb-1">Info Nisab Terkini</p>
                <p class="text-xs text-slate-600 font-medium leading-relaxed">
                  Nisab Zakat Maal setara dengan <span class="font-bold">85 gram emas</span>. 
                  Harga emas saat ini: <span class="font-bold">{{ formatIDR(goldPrice) }}/gram</span>.
                  Maka Nisab adalah <span class="font-bold">{{ formatIDR(nisabValue) }}</span>.
                </p>
              </div>
            </div>
          </div>

          <div v-else class="space-y-6 animate-in fade-in duration-500">
            <div class="flex items-center gap-4 mb-8">
              <div class="w-12 h-12 bg-emerald-50 text-[#01803d] rounded-sm flex items-center justify-center">
                <Users :size="24" />
              </div>
              <div>
                <h2 class="text-lg font-black text-slate-900 uppercase leading-none">Zakat Fitrah</h2>
                <p class="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">Kewajiban per Jiwa</p>
              </div>
            </div>

            <div class="space-y-4">
              <label class="block text-[11px] font-black text-slate-700 uppercase tracking-widest">Jumlah Jiwa (Anggota Keluarga)</label>
              <input 
                v-model="jiwa"
                type="number" 
                min="1"
                class="w-full bg-slate-50 border-2 border-slate-100 rounded-sm px-6 py-5 text-xl font-black text-slate-700 focus:border-[#01803d] focus:ring-0 transition-all"
              >
            </div>

            <div class="p-6 bg-emerald-50 rounded-sm border border-emerald-100 flex items-start gap-4 mt-8">
              <Info :size="20" class="text-[#01803d] shrink-0 mt-1" />
              <div>
                <p class="text-[10px] font-black text-[#01803d] uppercase tracking-widest mb-1">Ketentuan Fitrah</p>
                <p class="text-xs text-slate-700 font-bold leading-relaxed">
                  Harga Zakat Fitrah yang ditetapkan saat ini adalah <span class="font-black text-[#01803d]">{{ formatIDR(fitrahPrice) }}</span> per jiwa.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Result Section -->
      <div class="lg:col-span-5">
        <div class="bg-[#003d1c] rounded-sm shadow-2xl p-8 text-white sticky top-28 overflow-hidden">
          <!-- Background Decoration -->
          <div class="absolute -right-12 -top-12 w-48 h-48 bg-white/5 rounded-full blur-sm"></div>
          <div class="absolute -left-12 -bottom-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-sm"></div>

          <div class="relative z-10">
            <h3 class="text-xs font-black text-[#fecb00] uppercase tracking-[0.3em] mb-8">Hasil Perhitungan</h3>

            <div v-if="activeTab === 'maal'" class="space-y-8">
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest text-emerald-400/80 mb-2">Estimasi Zakat Anda</p>
                <p class="text-4xl font-black tracking-tighter">{{ formatIDR(zakatMaalAmount) }}</p>
              </div>

              <div class="pt-6 border-t border-white/10">
                <div v-if="harta && isMaalObligatory" class="flex gap-4 items-start bg-white/5 p-4 rounded-sm">
                  <CheckCircle2 class="text-yellow-400 shrink-0" :size="24" />
                  <div>
                    <p class="text-xs font-black uppercase tracking-widest text-yellow-400 mb-1">Wajib Zakat</p>
                    <p class="text-[11px] text-emerald-100/70 font-medium leading-relaxed">Total harta Anda telah mencapai Nisab. Sangat disarankan untuk menunaikan Zakat Maal.</p>
                  </div>
                </div>
                <div v-else-if="harta" class="flex gap-4 items-start bg-white/5 p-4 rounded-sm">
                  <AlertCircle class="text-emerald-300 shrink-0" :size="24" />
                  <div>
                    <p class="text-xs font-black uppercase tracking-widest text-emerald-300 mb-1">Belum Wajib Zakat</p>
                    <p class="text-[11px] text-emerald-100/70 font-medium leading-relaxed">Harta Anda belum mencapai Nisab. Namun Anda tetap bisa berinfaq/sedekah seikhlasnya.</p>
                  </div>
                </div>
              </div>

              <NuxtLink 
                :to="isMaalObligatory ? '/zakat' : '/infaq'"
                class="w-full bg-[#fecb00] text-slate-900 py-5 rounded-sm font-black text-[11px] uppercase tracking-widest hover:bg-yellow-300 transition-all flex items-center justify-center gap-3 shadow-xl"
              >
                Tunaikan Sekarang
                <ArrowRight :size="18" />
              </NuxtLink>
            </div>

            <div v-else class="space-y-8">
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest text-emerald-400/80 mb-2">Total Zakat Fitrah</p>
                <p class="text-4xl font-black tracking-tighter">{{ formatIDR(zakatFitrahAmount) }}</p>
                <p class="text-[11px] font-bold text-emerald-200/50 mt-2">Untuk {{ jiwa }} Jiwa</p>
              </div>

              <div class="pt-6 border-t border-white/10">
                <div class="flex gap-4 items-start bg-white/5 p-4 rounded-sm">
                  <CheckCircle2 class="text-yellow-400 shrink-0" :size="24" />
                  <div>
                    <p class="text-xs font-black uppercase tracking-widest text-yellow-400 mb-1">Zakat Fitrah</p>
                    <p class="text-[11px] text-emerald-100/70 font-medium leading-relaxed">Zakat Fitrah wajib ditunaikan bagi setiap jiwa muslim yang mampu sebelum Shalat Idul Fitri.</p>
                  </div>
                </div>
              </div>

              <NuxtLink 
                to="/zakat"
                class="w-full bg-[#fecb00] text-slate-900 py-5 rounded-sm font-black text-[11px] uppercase tracking-widest hover:bg-yellow-300 transition-all flex items-center justify-center gap-3 shadow-xl"
              >
                Bayar Zakat Fitrah
                <ArrowRight :size="18" />
              </NuxtLink>
            </div>

            <div class="mt-8 flex items-center justify-center gap-2">
              <TrendingUp :size="14" class="text-emerald-400" />
              <p class="text-[9px] font-bold text-emerald-400/40 uppercase tracking-widest italic">Data Terupdate Secara Real-time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Hide arrow buttons in number input */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type=number] {
  -moz-appearance: textfield;
}
</style>
