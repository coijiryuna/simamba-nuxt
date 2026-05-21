<script setup>
definePageMeta({
  layout: 'default'
})

const { data: pimpinanData } = await useFetch('/api/v1/pimpinan')

const allPimpinan = computed(() => pimpinanData.value?.data || [])

// Pisahkan Ketua & Bendahara dari pimpinan bidang
const ketuaBendahara = computed(() => allPimpinan.value.find(p => p.bidang_id == 0 || p.bidang_id == '0'))
const pimpinanBidang = computed(() => allPimpinan.value.filter(p => p.bidang_id != 0 && p.bidang_id != '0'))

const tahunPeriode = computed(() => {
  const first = allPimpinan.value[0]
  if (!first) return ''
  return `${first.tahun_awal} – ${first.tahun_akhir}`
})

useSeoMeta({
  title: 'Struktur Pimpinan - BAZNAS Kabupaten Tangerang',
  description: 'Daftar pimpinan dan struktur organisasi BAZNAS Kabupaten Tangerang periode saat ini.',
  ogTitle: 'Struktur Pimpinan BAZNAS Kabupaten Tangerang',
  ogImage: '/logo.png'
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 pb-20 space-y-16">
    <!-- Header -->
    <div class="text-center space-y-6">
      <h1 class="text-xl md:text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none">Struktur Pimpinan BAZNAS</h1>
      <div class="w-20 h-2 bg-[#fecb00] mx-auto rounded-sm"></div>
      <p class="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs">
        Kabupaten Tangerang — Periode {{ tahunPeriode }}
      </p>
    </div>

    <!-- Ketua & Bendahara (ditampilkan paling atas, lebih besar) -->
    <div v-if="ketuaBendahara" class="flex justify-center">
      <div class="relative bg-white rounded-sm shadow-2xl border border-slate-100 overflow-hidden max-w-sm w-full group">
        <!-- Garis aksen atas -->
        <div class="absolute top-0 left-0 w-full h-1.5 bg-[#fecb00]"></div>

        <!-- Badge -->
        <div class="absolute top-5 right-5 bg-[#01803d] text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-sm">
          Pimpinan
        </div>

        <!-- Foto -->
        <div class="pt-8 pb-0 flex justify-center bg-slate-50">
          <img
            :src="ketuaBendahara.image_url"
            :alt="ketuaBendahara.nama_pimpinan"
            class="h-100 w-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          >
        </div>

        <!-- Info -->
        <div class="p-6 space-y-3 text-center border-t border-slate-100">
          <div class="text-[10px] md:text-xs font-black text-[#01803d] uppercase tracking-widest">KETUA BAZNAS</div>
          <h2 class="text-base md:text-xl font-black text-slate-800 uppercase tracking-tight leading-tight">
            {{ ketuaBendahara.nama_pimpinan }}
          </h2>
          <div class="h-px w-12 bg-[#fecb00] mx-auto"></div>
          <p class="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">
            {{ ketuaBendahara.nama_kabid }}
          </p>
        </div>
      </div>
    </div>

    <!-- Connector line (hiasan) -->
    <div class="flex justify-center -my-2">
      <div class="w-px h-12 bg-slate-200"></div>
    </div>

    <!-- Grid Pimpinan Bidang -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="pimpinan in pimpinanBidang"
        :key="pimpinan.id"
        class="relative bg-white rounded-sm shadow-lg border border-slate-100 overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
      >
        <!-- Aksen warna atas -->
        <div class="absolute top-0 left-0 w-full h-1 bg-[#01803d]"></div>

        <!-- Foto -->
        <div class="bg-slate-50 overflow-hidden h-100">
          <img
            :src="pimpinan.image_url"
            :alt="pimpinan.nama_pimpinan"
            class="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          >
        </div>

        <!-- Info -->
        <div class="p-5 space-y-2 border-t border-slate-100">
          <div class="text-[9px] font-black text-[#01803d] uppercase tracking-widest leading-tight">
            {{ pimpinan.ref_nama_bidang || pimpinan.nama_bidang }}
          </div>
          <h3 class="text-sm font-black text-slate-800 uppercase tracking-tight leading-tight">
            {{ pimpinan.nama_pimpinan }}
          </h3>
          <div class="h-px w-8 bg-[#fecb00]"></div>
          <p class="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
            {{ pimpinan.nama_kabid }}
          </p>
        </div>
      </div>
    </div>

    <!-- Periode Footer -->
    <div class="text-center pt-8 border-t border-slate-100">
      <p class="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">
        Masa Jabatan: Periode {{ tahunPeriode }}
      </p>
    </div>
  </div>
</template>
