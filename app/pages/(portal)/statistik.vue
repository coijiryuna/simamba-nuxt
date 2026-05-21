<script setup>
import { 
  Users, 
  Building2, 
  HeartHandshake, 
  TrendingUp, 
  Target,
  ArrowUpRight,
  PieChart,
  LayoutGrid
} from 'lucide-vue-next'

definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'Statistik & Dampak - BAZNAS Kabupaten Tangerang',
  description: 'Transparansi pengelolaan dana zakat, infaq, dan sedekah melalui data statistik penyaluran yang akurat.',
  ogTitle: 'Statistik Penyaluran BAZNAS Kabupaten Tangerang',
  ogImage: '/logo.png'
})

const tahun = ref(new Date().getFullYear())

const { data: statsRes, pending, refresh } = await useFetch('/api/v1/dashboard-stats', {
  query: computed(() => ({ tahun: tahun.value }))
})

const stats = computed(() => statsRes.value?.data || {})
const pengumpulan   = computed(() => stats.value.pengumpulan || [])
const penyDist      = computed(() => stats.value.penyaluran_dist || [])
const penyDaya      = computed(() => stats.value.penyaluran_daya || [])
const asnafDist     = computed(() => stats.value.asnaf_dist || [])
const asnafDaya     = computed(() => stats.value.asnaf_daya || [])

// Total summary
const totalRencana   = computed(() => pengumpulan.value.reduce((s, i) => s + (i.rencana || 0), 0))
const totalRealisasi = computed(() => stats.value.total_realisasi_ytd || (penyDist.value.reduce((s, i) => s + (i.realisasi || 0), 0) + penyDaya.value.reduce((s, i) => s + (i.realisasi || 0), 0)))
const totalPenerima  = computed(() => stats.value.total_mustahik_perorangan || (penyDist.value.reduce((s, i) => s + (i.realisasi_penerima || 0), 0) + penyDaya.value.reduce((s, i) => s + (i.realisasi_penerima || 0), 0)))

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0)
const fmtShort = (n) => {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)} M`
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)} Jt`
  return fmt(n)
}

const sectorColor = (index) => {
  const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-purple-500', 'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500']
  return colors[index % colors.length]
}

const availableYears = computed(() => {
  const current = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => current - i)
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 pb-24 space-y-12">
    <!-- HERO HEADER -->
    <div class="relative py-12 px-8 bg-green-900 rounded-sm overflow-hidden shadow-2xl">
      <div class="absolute top-0 right-0 w-96 h-96 bg-[#01803d]/20 rounded-full blur-[100px] -mr-48 -mt-48"></div>
      <div class="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-[80px] -ml-32 -mb-32"></div>
      
      <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div class="space-y-4 text-center md:text-left">
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span class="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Live Statistics {{ tahun }}</span>
          </div>
          <h1 class="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none">
            Transparansi <br/> <span class="text-emerald-500">Penyaluran</span>
          </h1>
          <p class="text-slate-200 font-bold max-w-md text-sm md:text-base">
            Laporan real-time pendayagunaan zakat, infak, dan sedekah untuk masyarakat Kabupaten Tangerang.
          </p>
        </div>

        <div class="bg-white/10 backdrop-blur-md p-4 rounded-sm border border-white/20 w-full md:w-auto">
          <div class="text-[10px] font-black text-slate-100 uppercase tracking-widest mb-2 px-2">Pilih Tahun Laporan</div>
          <select
            v-model="tahun"
            @change="refresh()"
            class="w-full md:w-48 px-4 py-3 bg-white text-black border-none rounded-sm font-black focus:ring-2 focus:ring-emerald-500 transition-all uppercase tracking-widest text-xs"
          >
            <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- MAIN SUMMARY CARDS -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      <div class="bg-white p-6 rounded-sm shadow-xl border-t-4 border-emerald-500 group hover:-translate-y-1 transition-all duration-300">
        <div class="flex justify-between items-start mb-4">
          <div class="p-2 bg-emerald-50 text-emerald-600 rounded-sm"><Users class="w-5 h-5"/></div>
          <div class="text-[8px] font-black text-slate-500 uppercase tracking-widest">Master Data</div>
        </div>
        <div class="text-xs font-black text-slate-600 uppercase tracking-widest mb-1">Total Muzakki</div>
        <div class="text-3xl font-black text-slate-800 tracking-tighter">{{ stats.total_muzakki?.toLocaleString('id-ID') || 0 }}</div>
      </div>

      <div class="bg-white p-6 rounded-sm shadow-xl border-t-4 border-slate-800 group hover:-translate-y-1 transition-all duration-300">
        <div class="flex justify-between items-start mb-4">
          <div class="p-2 bg-slate-100 text-slate-800 rounded-sm"><Building2 class="w-5 h-5"/></div>
          <div class="text-[8px] font-black text-slate-500 uppercase tracking-widest">Network</div>
        </div>
        <div class="text-xs font-black text-slate-600 uppercase tracking-widest mb-1">Total UPZ</div>
        <div class="text-3xl font-black text-slate-800 tracking-tighter">{{ stats.total_upz || 0 }}</div>
      </div>

      <div class="bg-white p-6 rounded-sm shadow-xl border-t-4 border-yellow-500 group hover:-translate-y-1 transition-all duration-300">
        <div class="flex justify-between items-start mb-4">
          <div class="p-2 bg-yellow-50 text-yellow-600 rounded-sm"><HeartHandshake class="w-5 h-5"/></div>
          <div class="text-[8px] font-black text-slate-500 uppercase tracking-widest">Mustahik</div>
        </div>
        <div class="text-xs font-black text-slate-600 uppercase tracking-widest mb-1">Mustahik</div>
        <div class="text-3xl font-black text-slate-800 tracking-tighter">{{ stats.total_mustahik_perorangan?.toLocaleString('id-ID') || 0 }}</div>
      </div>

      <div class="bg-white p-6 rounded-sm shadow-xl border-t-4 border-blue-600 group hover:-translate-y-1 transition-all duration-300">
        <div class="flex justify-between items-start mb-4">
          <div class="p-2 bg-blue-50 text-blue-600 rounded-sm"><TrendingUp class="w-5 h-5"/></div>
          <div class="text-[8px] font-black text-slate-500 uppercase tracking-widest">Realisasi</div>
        </div>
        <div class="text-xs font-black text-slate-600 uppercase tracking-widest mb-1">Penyaluran</div>
        <div class="text-2xl font-black text-blue-600 tracking-tighter">{{ fmtShort(totalRealisasi) }}</div>
      </div>

      <div class="bg-white p-6 rounded-sm shadow-xl border-t-4 border-slate-200 group hover:-translate-y-1 transition-all duration-300">
        <div class="flex justify-between items-start mb-4">
          <div class="p-2 bg-slate-50 text-slate-400 rounded-sm"><Target class="w-5 h-5"/></div>
          <div class="text-[8px] font-black text-slate-500 uppercase tracking-widest">Budget</div>
        </div>
        <div class="text-xs font-black text-slate-600 uppercase tracking-widest mb-1">Target</div>
        <div class="text-2xl font-black text-slate-600 tracking-tighter">{{ fmtShort(totalRencana) }}</div>
      </div>
    </div>

    <!-- DATA BREAKDOWN -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
      
      <!-- LEFT: PENGUMPULAN & ASNAF -->
      <div class="lg:col-span-1 space-y-10">
        <!-- PENGUMPULAN -->
        <div class="bg-white rounded-sm shadow-xl border border-slate-100 overflow-hidden">
          <div class="px-6 py-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <ArrowUpRight class="w-5 h-5 text-emerald-500" />
              <h2 class="text-sm font-black text-slate-800 uppercase tracking-widest">Pengumpulan</h2>
            </div>
          </div>
          <div class="p-6 space-y-6">
            <div v-for="item in pengumpulan" :key="item.id" class="group">
              <div class="flex justify-between items-center mb-2">
                <span class="text-[10px] font-black text-slate-700 uppercase tracking-tight">{{ item.nama }}</span>
                <span class="text-[10px] font-bold text-slate-400">{{ item.persentase?.toFixed(1) }}%</span>
              </div>
              <div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-1 p-0.5 border border-slate-200/50">
                <div class="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-sm"
                  :style="{ width: Math.min(item.persentase, 100) + '%' }"></div>
              </div>
              <div class="flex justify-between text-[9px] font-black text-slate-600">
                <span>{{ fmtShort(item.realisasi) }}</span>
                <span class="opacity-70">Target: {{ fmtShort(item.rencana) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- SEBARAN ASNAF -->
        <div class="bg-white rounded-sm shadow-xl border border-slate-100 overflow-hidden">
          <div class="px-6 py-5 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
            <PieChart class="w-5 h-5 text-purple-600" />
            <h2 class="text-sm font-black text-slate-800 uppercase tracking-widest">Sebaran Asnaf</h2>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div v-for="(a, idx) in asnafDist" :key="a.asnaf" class="flex items-center gap-4 group">
                <div class="w-8 h-8 rounded-sm flex items-center justify-center text-[10px] font-black shrink-0 shadow-sm" :class="sectorColor(idx)">
                  {{ a.asnaf.charAt(0) }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-center mb-1">
                    <span class="text-[10px] font-black text-slate-700 uppercase truncate">{{ a.asnaf }}</span>
                    <span class="text-[10px] font-black text-slate-800">{{ fmtShort(a.realisasi) }}</span>
                  </div>
                  <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-1000" :class="sectorColor(idx)"
                      :style="{ width: Math.min((a.realisasi / (totalRealisasi || 1)) * 100 * 5, 100) + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: PENYALURAN PROGRAM -->
      <div class="lg:col-span-2 space-y-10">
        <!-- PENDISTRIBUSIAN -->
        <div class="bg-white rounded-sm shadow-xl border border-slate-100 overflow-hidden">
          <div class="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <LayoutGrid class="w-5 h-5 text-blue-600" />
              <h2 class="text-base font-black text-slate-800 uppercase tracking-[0.1em]">Bidang Pendistribusian</h2>
            </div>
            <span class="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">
              Total: {{ fmtShort(penyDist.reduce((s, i) => s + i.realisasi, 0)) }}
            </span>
          </div>
          <div class="p-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div v-for="(item, idx) in penyDist" :key="item.id" class="space-y-3">
                <div class="flex justify-between items-end">
                  <div class="space-y-1">
                    <h3 class="text-xs font-black text-slate-800 uppercase tracking-tight">{{ item.nama }}</h3>
                    <div class="flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase">
                      <Users class="w-3 h-3" />
                      {{ item.realisasi_penerima?.toLocaleString('id-ID') }} Penerima Manfaat
                    </div>
                  </div>
                  <span class="text-xs font-black text-blue-700">{{ item.persentase?.toFixed(1) }}%</span>
                </div>
                <div class="w-full h-4 bg-slate-200/50 rounded-sm overflow-hidden p-0.5 border border-slate-300">
                  <div class="h-full bg-blue-600 rounded-xs transition-all duration-1000 shadow-sm"
                    :style="{ width: Math.min(item.persentase, 100) + '%' }"></div>
                </div>
                <div class="flex justify-between text-[10px] font-black text-slate-700">
                  <span>{{ fmt(item.realisasi) }}</span>
                  <span class="text-slate-500 font-black uppercase text-[8px]">Target: {{ fmtShort(item.rencana) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- PENDAYAGUNAAN -->
        <div class="bg-white rounded-sm shadow-xl border border-slate-100 overflow-hidden">
          <div class="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <TrendingUp class="w-5 h-5 text-amber-500" />
              <h2 class="text-base font-black text-slate-800 uppercase tracking-[0.1em]">Bidang Pendayagunaan</h2>
            </div>
            <span class="text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-widest">
              Total: {{ fmtShort(penyDaya.reduce((s, i) => s + i.realisasi, 0)) }}
            </span>
          </div>
          <div class="p-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div v-for="(item, idx) in penyDaya" :key="item.id" class="space-y-3">
                <div class="flex justify-between items-end">
                  <div class="space-y-1">
                    <h3 class="text-xs font-black text-slate-800 uppercase tracking-tight">{{ item.nama }}</h3>
                    <div class="flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase">
                      <Users class="w-3 h-3" />
                      {{ item.realisasi_penerima?.toLocaleString('id-ID') }} Penerima Manfaat
                    </div>
                  </div>
                  <span class="text-xs font-black text-amber-700">{{ item.persentase?.toFixed(1) }}%</span>
                </div>
                <div class="w-full h-4 bg-slate-200/50 rounded-sm overflow-hidden p-0.5 border border-slate-300">
                  <div class="h-full bg-amber-500 rounded-xs transition-all duration-1000 shadow-sm"
                    :style="{ width: Math.min(item.persentase, 100) + '%' }"></div>
                </div>
                <div class="flex justify-between text-[10px] font-black text-slate-700">
                  <span>{{ fmt(item.realisasi) }}</span>
                  <span class="text-slate-500 font-black uppercase text-[8px]">Target: {{ fmtShort(item.rencana) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.rounded-xs { border-radius: 1px; }
</style>
