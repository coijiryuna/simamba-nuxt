<script setup>
definePageMeta({
  layout: 'default'
})
const { data: settingsRes } = await useFetch('/api/v1/settings')
const settings = computed(() => settingsRes.value?.data || {})

useSeoMeta({
  title: 'Profil BAZNAS - Kabupaten Tangerang',
  description: 'Kenali lebih dekat BAZNAS Kabupaten Tangerang, lembaga resmi pengelola zakat yang amanah dan profesional.',
  ogTitle: 'Profil BAZNAS Kabupaten Tangerang',
  ogDescription: 'Kenali lebih dekat BAZNAS Kabupaten Tangerang, lembaga resmi pengelola zakat yang amanah dan profesional.',
  ogImage: settings.value.site_logo || '/logo.png'
})

const { data: pimpinanRes } = await useFetch('/api/v1/pimpinan')
const chairperson = computed(() => {
  const pimpinan = pimpinanRes.value?.data || []
  return pimpinan.find(p => p.bidang_id == 0 || p.bidang_id == '0')
})
</script>

<template>
  <div class="max-w-7xl mx-auto space-y-16 pb-20">
    <!-- Header -->
    <div class="text-center space-y-6">
      <h1 class="text-2xl md:text-5xl font-black text-slate-800 uppercase tracking-tighter leading-none">Profil BAZNAS</h1>
      <div class="w-20 h-2 bg-[#fecb00] mx-auto rounded-sm"></div>
      <p class="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs">Kabupaten Tangerang</p>
    </div>

    <!-- Sambutan Ketua -->
    <div v-if="settings.speech" class="bg-white rounded-sm shadow-xl border border-slate-100 overflow-hidden">
      <div class="grid grid-cols-1 md:grid-cols-3">
        <div class="md:col-span-1 bg-slate-50 p-8 md:p-12 flex flex-col items-center justify-center text-center border-r border-slate-100">
           <div class="w-32 h-32 md:w-40 md:h-40 bg-white rounded-full flex items-center justify-center mb-6 overflow-hidden border-4 border-[#01803d]/10 shadow-xl">
             <img v-if="chairperson?.image_url" :src="chairperson.image_url" class="w-full h-full object-cover object-top" />
             <svg v-else class="w-16 h-16 md:w-20 md:h-20 text-[#01803d]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
           </div>
           <div class="text-[10px] md:text-xs font-black text-[#01803d] uppercase tracking-[0.2em] mb-2">Sambutan</div>
           <div class="text-sm md:text-lg font-black text-slate-800 uppercase tracking-tight">{{ chairperson?.nama_pimpinan || 'Ketua BAZNAS' }}</div>
           <div class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Ketua BAZNAS</div>
        </div>
        <div class="md:col-span-2 p-8 md:p-16 relative">
          <svg class="absolute top-4 right-8 w-12 h-12 text-slate-100" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.896 14.912 16 16.017 16H19.017V14H15.017C13.912 14 13.017 13.104 13.017 12V10C13.017 8.896 13.912 8 15.017 8H19.017C20.122 8 21.017 8.896 21.017 10V18C21.017 19.657 19.674 21 18.017 21H14.017ZM3.017 21L3.017 18C3.017 16.896 3.912 16 5.017 16H8.017V14H4.017C2.912 14 2.017 13.104 2.017 12V10C2.017 8.896 2.912 8 4.017 8H8.017C9.122 8 10.017 8.896 10.017 10V18C10.017 19.657 8.674 21 7.017 21H3.017Z"/></svg>
          <div class="prose prose-slate md:prose-lg max-w-none text-slate-600 font-medium italic leading-relaxed relative z-10" v-html="settings.speech"></div>
        </div>
      </div>
    </div>

    <!-- Vision Section -->
    <div class="bg-green-900 rounded-sm shadow-2xl overflow-hidden relative group py-20 px-8 md:px-24 text-center space-y-8">
      <div class="absolute top-0 left-0 w-full h-1.5 bg-[#fecb00]"></div>
      <div class="absolute -bottom-24 -right-24 w-64 h-64 bg-[#01803d]/20 rounded-full blur-3xl"></div>
      <div class="text-[10px] md:text-xs font-black text-[#fecb00] uppercase tracking-[0.4em]">Visi Kami</div>
      <h2 class="text-xl md:text-5xl font-black text-white uppercase tracking-tight leading-tight italic">
        "{{ settings.vision || 'Menjadi Lembaga Utama Menyejahterakan Ummat' }}"
      </h2>
    </div>

    <!-- Misi, Tujuan, Sasaran Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Misi -->
      <div class="bg-white p-8 md:p-10 rounded-sm border border-slate-100 shadow-lg space-y-6">
        <div class="w-12 h-12 bg-emerald-50 rounded-sm flex items-center justify-center text-[#01803d]">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <h3 class="text-lg md:text-xl font-black text-slate-800 uppercase tracking-tighter border-b-2 border-emerald-500 pb-2 inline-block">Misi</h3>
        <div class="prose prose-slate md:prose-base max-w-none text-slate-600 font-medium leading-relaxed" v-html="settings.mission"></div>
      </div>

      <!-- Tujuan -->
      <div class="bg-white p-8 md:p-10 rounded-sm border border-slate-100 shadow-lg space-y-6">
        <div class="w-12 h-12 bg-blue-50 rounded-sm flex items-center justify-center text-blue-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        </div>
        <h3 class="text-lg md:text-xl font-black text-slate-800 uppercase tracking-tighter border-b-2 border-blue-500 pb-2 inline-block">Tujuan</h3>
        <div class="prose prose-slate md:prose-base max-w-none text-slate-600 font-medium leading-relaxed" v-html="settings.purpose"></div>
      </div>

      <!-- Sasaran -->
      <div class="bg-white p-8 md:p-10 rounded-sm border border-slate-100 shadow-lg space-y-6">
        <div class="w-12 h-12 bg-amber-50 rounded-sm flex items-center justify-center text-amber-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
        </div>
        <h3 class="text-lg md:text-xl font-black text-slate-800 uppercase tracking-tighter border-b-2 border-amber-500 pb-2 inline-block">Sasaran</h3>
        <div class="prose prose-slate md:prose-base max-w-none text-slate-600 font-medium leading-relaxed" v-html="settings.target"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(ol) {
  list-style-type: decimal;
  padding-left: 1.25rem;
  margin-top: 1rem;
}
:deep(li) {
  margin-bottom: 0.75rem;
}
</style>
