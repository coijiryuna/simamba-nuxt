<script setup>
const { data: layoutData } = await useAsyncData('layout-data', async () => {
  const [categories, links] = await Promise.all([
    $fetch('/api/v1/categories'),
    $fetch('/api/v1/links'),
  ])
  return { categories, links }
})

const categories = computed(() => layoutData.value?.categories || [])
const links = computed(() => layoutData.value?.links || [])
// Inject settings from app.vue
const settings = inject('settings', computed(() => ({})))

const navbarItems = computed(() => {
  const data = categories.value
  if (!Array.isArray(data)) return []
  
  return data
    .filter(cat => (cat.term_navbar == 1 || cat.term_navbar == '1') && (cat.parent == 0 || cat.parent == '0'))
    .map(root => ({
      ...root,
      children: data.filter(child => Number(child.parent) === Number(root.id))
    }))
})

const getLink = (item) => {
  if (item.term_link && item.term_link !== '#') return item.term_link
  return `/${item.slug}`
}

const isMenuOpen = ref(false)
const openMenus = ref([])

const toggleMenu = (id) => {
  // Try to use numeric ID if it's a number-like string, otherwise use raw ID (for 'about-mobile' etc)
  const menuId = isNaN(Number(id)) ? id : Number(id)
  
  if (openMenus.value.includes(menuId)) {
    openMenus.value = openMenus.value.filter(m => m !== menuId)
  } else {
    openMenus.value.push(menuId)
  }
}

const pinnedLinks = computed(() => {
  const data = links.value
  if (!Array.isArray(data)) return []
  return data.filter(link => link.link_category === 'Navbar' && link.link_visible === 'Y')
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-sans">
    <NuxtRouteAnnouncer />
    
    <!-- Top Green Bar (Miniaturized) -->
    <div class="bg-[#016932] text-white py-1.5 md:py-2 px-4 overflow-hidden relative border-b border-white/5">
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-8">
        <div class="flex items-center gap-2 md:gap-4 shrink-0">
          <span class="bg-[#fecb00] text-slate-900 text-[8px] md:text-[10px] font-black px-2 py-0.5 rounded-sm uppercase tracking-wider animate-pulse">Update</span>
        </div>
        <div class="flex-1 marquee-container overflow-hidden">
          <p class="marquee-text whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.2em] opacity-90">
            Badan Amil Zakat Nasional - Pilihan Utama Pembayar Zakat - Mensejahterakan Ummat Bersama BAZNAS Kabupaten Tangerang - Tunaikan Zakat, Infaq dan Sedekah Anda melalui portal resmi kami.
          </p>
        </div>
      </div>
    </div>

    <header class="bg-white text-slate-800 shadow-lg sticky top-0 z-50 border-b-2 border-[#fecb00]">
      <div class="container mx-auto px-4 lg:px-8 flex justify-between items-center h-16 md:h-20">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-3 group">
          <div v-if="!settings.site_logo" class="w-10 h-10 rounded-sm flex items-center justify-center group-hover:rotate-6 transition-transform">
            <span class="text-white font-black text-xl">B</span>
          </div>
          <img v-else :src="settings.site_logo" class="h-10 w-auto object-contain mix-blend-multiply" alt="BAZNAS Logo" />
          <div>
            <h1 class="text-base md:text-xl font-black text-[#01803d] leading-none uppercase tracking-tighter">BAZNAS</h1>
            <p class="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">Kabupaten Tangerang</p>
          </div>
        </NuxtLink>

        <!-- Navigation -->
        <nav class="hidden md:flex items-center h-full gap-4">
          <NuxtLink to="/" class="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-[#01803d] transition-colors py-8 border-b-2 border-transparent hover:border-[#01803d]" active-class="!text-[#01803d] !border-[#01803d]">
            Beranda
          </NuxtLink>
          
          <div class="md:flex items-center h-full gap-4 relative group">
            <div class="px-5 h-full flex items-center text-[10px] font-black text-slate-600 group-hover:text-[#01803d] group-hover:bg-slate-50 border-b-2 border-transparent group-hover:border-[#01803d] transition-all uppercase tracking-widest cursor-pointer">
              Tentang Kami
              <svg class="w-3 h-3 ml-1 opacity-50 group-hover:rotate-180 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
            <div class="absolute top-20 left-0 w-64 bg-white shadow-2xl rounded-sm py-2 invisible opacity-0 translate-y-2 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 border-t-4 border-[#01803d]">
              <NuxtLink to="/profil-baznas" class="block px-6 py-3 text-[10px] font-bold text-slate-600 hover:text-[#01803d] hover:bg-emerald-50 transition-all uppercase tracking-wider">Profil Baznas</NuxtLink>
              <NuxtLink to="/struktur-baznas" class="block px-6 py-3 text-[10px] font-bold text-slate-600 hover:text-[#01803d] hover:bg-emerald-50 transition-all uppercase tracking-wider">Struktur Baznas</NuxtLink>
              <NuxtLink to="/upz-baznas" class="block px-6 py-3 text-[10px] font-bold text-slate-600 hover:text-[#01803d] hover:bg-emerald-50 transition-all uppercase tracking-wider">UPZ Baznas</NuxtLink>
              <NuxtLink to="/statistik" class="block px-6 py-3 text-[10px] font-bold text-slate-600 hover:text-[#01803d] hover:bg-emerald-50 transition-all uppercase tracking-wider">Statistik Penyaluran</NuxtLink>
              <NuxtLink to="/kontak" class="block px-6 py-3 text-[10px] font-bold text-slate-600 hover:text-[#01803d] hover:bg-emerald-50 transition-all uppercase tracking-wider">Kontak Kami</NuxtLink>
              <NuxtLink to="/unduhan" class="block px-6 py-3 text-[10px] font-bold text-slate-600 hover:text-[#01803d] hover:bg-emerald-50 transition-all uppercase tracking-wider">Unduhan</NuxtLink>
            </div>
          </div>

          <template v-for="item in navbarItems" :key="item.id">
            <!-- With Children -->
            <div v-if="item.children?.length" class="md:flex items-center h-full gap-4 relative group">
              <NuxtLink :to="getLink(item)" class="px-4 h-full flex items-center text-[10px] font-black text-slate-600 group-hover:text-[#01803d] group-hover:bg-slate-50 border-b-2 border-transparent group-hover:border-[#01803d] transition-all uppercase tracking-widest cursor-pointer gap-1">
                {{ item.name }}
                <svg class="w-3 h-3 opacity-50 group-hover:rotate-180 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </NuxtLink>
              <div class="absolute top-20 left-0 w-64 bg-white shadow-2xl rounded-sm py-2 invisible opacity-0 translate-y-2 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 border-t-4 border-[#01803d] z-60">
                <NuxtLink v-for="child in item.children" :key="child.id" :to="getLink(child)" class="block px-6 py-3 text-[10px] font-bold text-slate-600 hover:text-[#01803d] hover:bg-emerald-50 transition-all uppercase tracking-wider">
                  {{ child.name }}
                </NuxtLink>
              </div>
            </div>
            <!-- Without Children -->
            <NuxtLink v-else :to="getLink(item)" class="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-[#01803d] transition-colors py-8 border-b-2 border-transparent hover:border-[#01803d]" active-class="!text-[#01803d] !border-[#01803d]">
              {{ item.name }}
            </NuxtLink>
          </template>

            <NuxtLink to="/kalkulator" class="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-[#01803d] transition-colors py-8 border-b-2 border-transparent hover:border-[#01803d]" active-class="!text-[#01803d] !border-[#01803d]">
              Kalkulator
            </NuxtLink>
            <NuxtLink v-if="settings.submission_enabled === 'yes'" to="/pengajuan" class="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-[#01803d] transition-colors py-8 border-b-2 border-transparent hover:border-[#01803d]" active-class="!text-[#01803d] !border-[#01803d]">
              Pengajuan
            </NuxtLink>
            <NuxtLink to="/cek-pengajuan" class="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-[#01803d] transition-colors py-8 border-b-2 border-transparent hover:border-[#01803d]" active-class="!text-[#01803d] !border-[#01803d]">
              Cek Pengajuan
            </NuxtLink>

            <NuxtLink 
              v-for="link in pinnedLinks" 
              :key="link.link_id" 
              :to="link.link_url" 
              class="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-[#01803d] transition-colors py-8 border-b-2 border-transparent hover:border-[#01803d]"
            >
              {{ link.link_name }}
            </NuxtLink>
        </nav>

        <!-- Mobile Menu Button -->
        <div class="flex items-center gap-3 lg:hidden">
          <NuxtLink to="/zakat" class="bg-[#fecb00] text-slate-900 px-3 py-1.5 rounded-sm font-black text-[7px] uppercase tracking-widest shadow-lg">ZAKAT</NuxtLink>
          <button @click="isMenuOpen = !isMenuOpen" class="p-1.5 text-slate-800 focus:outline-none">
            <svg v-if="!isMenuOpen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16m-7 6h7"/></svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation Overlay -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-4"
      >
        <div v-if="isMenuOpen" class="lg:hidden bg-white border-t-2 border-[#fecb00] shadow-2xl absolute w-full left-0 z-40 overflow-y-auto max-h-[85vh]">
          <nav class="p-6 space-y-1">
            <NuxtLink to="/" class="block py-3 text-[11px] font-bold uppercase tracking-widest text-slate-800 border-b border-slate-50" @click="isMenuOpen = false">Beranda</NuxtLink>
            
            <!-- Tentang Kami (Mobile) -->
            <div class="border-b border-slate-50">
              <button @click="toggleMenu('about-mobile')" class="flex items-center justify-between w-full py-3 text-[11px] font-bold uppercase tracking-widest text-slate-800">
                Tentang Kami
                <svg :class="{'rotate-180': openMenus.includes('about-mobile')}" class="w-3.5 h-3.5 transition-transform text-[#01803d]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
              </button>
              <div v-if="openMenus.includes('about-mobile')" class="bg-emerald-50 px-5 py-2 space-y-2 mb-3 rounded-sm border-l-2 border-[#01803d]">
                <NuxtLink to="/profil-baznas" class="block text-[10px] font-bold text-slate-600 uppercase py-2" @click="isMenuOpen = false">Profil Baznas</NuxtLink>
                <NuxtLink to="/struktur-baznas" class="block text-[10px] font-bold text-slate-600 uppercase py-2" @click="isMenuOpen = false">Struktur Organisasi</NuxtLink>
                <NuxtLink to="/upz-baznas" class="block text-[10px] font-bold text-slate-600 uppercase py-2" @click="isMenuOpen = false">UPZ Baznas</NuxtLink>
                <NuxtLink to="/statistik" class="block text-[10px] font-bold text-slate-600 uppercase py-2" @click="isMenuOpen = false">Statistik Penyaluran</NuxtLink>
                <NuxtLink to="/kontak" class="block text-[10px] font-bold text-slate-600 uppercase py-2" @click="isMenuOpen = false">Kontak Kami</NuxtLink>
                <NuxtLink to="/unduhan" class="block text-[10px] font-bold text-slate-600 uppercase py-2" @click="isMenuOpen = false">Pusat Unduhan</NuxtLink>
              </div>
            </div>

            <!-- Dynamic Items -->
            <div v-for="item in navbarItems" :key="item.id" class="border-b border-slate-50">
              <div class="flex items-center justify-between py-3">
                <NuxtLink :to="getLink(item)" class="text-[11px] font-bold uppercase tracking-widest text-slate-800" @click="isMenuOpen = false">{{ item.name }}</NuxtLink>
                <button v-if="item.children?.length > 0" @click="toggleMenu(item.id)" class="p-2 bg-slate-50 rounded-sm">
                  <svg :class="{'rotate-180': openMenus.includes(Number(item.id))}" class="w-3.5 h-3.5 transition-transform text-[#01803d]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
                </button>
              </div>
              <div v-if="openMenus.includes(Number(item.id)) && item.children?.length > 0" class="bg-emerald-50 px-5 py-2 space-y-3 mb-3 rounded-sm border-l-2 border-[#01803d]">
                <NuxtLink v-for="child in item.children" :key="child.id" :to="getLink(child)" class="block text-[10px] font-bold text-slate-600 uppercase py-2" @click="isMenuOpen = false">{{ child.name }}</NuxtLink>
              </div>
            </div>

            <NuxtLink to="/kalkulator" class="block py-3 text-[11px] font-bold uppercase tracking-widest text-slate-800 border-b border-slate-50" @click="isMenuOpen = false">Kalkulator</NuxtLink>
            <NuxtLink v-if="settings.submission_enabled === 'yes'" to="/pengajuan" class="block py-3 text-[11px] font-bold uppercase tracking-widest text-slate-800 border-b border-slate-50" @click="isMenuOpen = false">Pengajuan Online</NuxtLink>
            <NuxtLink to="/cek-pengajuan" class="block py-3 text-[11px] font-bold uppercase tracking-widest text-slate-800 border-b border-slate-50" @click="isMenuOpen = false">Cek Pengajuan</NuxtLink>

            <!-- Pinned Links (Mobile) -->
            <NuxtLink 
              v-for="link in pinnedLinks" 
              :key="link.link_id" 
              :to="link.link_url" 
              class="block py-3 text-[11px] font-bold uppercase tracking-widest text-slate-800 border-b border-slate-50"
              @click="isMenuOpen = false"
            >
              {{ link.link_name }}
            </NuxtLink>
          </nav>
        </div>
      </Transition>
    </header>

    <main class="container mx-auto py-10 px-4 lg:px-8 min-h-[60vh]">
      <slot />
    </main>

    <!-- Footer BAZNAS Style -->
    <footer class="bg-[#003d1c] text-white pt-20 pb-10 border-t-8 border-[#fecb00]">
      <div class="max-w-7xl mx-auto px-4 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 text-center md:text-left">
          <div class="space-y-6 col-span-1 md:col-span-1">
            <div class="flex items-center justify-center md:justify-start gap-3">
              <img v-if="settings.site_logo" :src="settings.site_logo" class="h-12 w-auto" alt="BAZNAS Logo" />
              <div class="text-left">
                <h3 class="text-xl font-black tracking-tighter text-white uppercase leading-none">BAZNAS</h3>
                <p class="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none mt-1">Kabupaten Tangerang</p>
              </div>
            </div>
            <p class="text-xs leading-relaxed text-white font-medium italic mx-auto md:mx-0 max-w-xs mt-6">
              {{ settings.blogdescription || 'Badan Amil Zakat Nasional (BAZNAS) Kabupaten Tangerang adalah lembaga resmi yang mengelola zakat, infaq, dan sedekah secara profesional dan amanah.' }}
            </p>
            <div v-if="settings.site_facebook || settings.site_instagram || settings.site_twitter" class="flex items-center justify-center md:justify-start gap-4 mt-8">
              <a v-if="settings.site_facebook" :href="settings.site_facebook" target="_blank" class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#fecb00] hover:text-slate-900 transition-all shadow-lg">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a v-if="settings.site_instagram" :href="settings.site_instagram" target="_blank" class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#fecb00] hover:text-slate-900 transition-all shadow-lg">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a v-if="settings.site_twitter" :href="settings.site_twitter" target="_blank" class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#fecb00] hover:text-slate-900 transition-all shadow-lg">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
          </div>

          <div>
            <h4 class="text-xs font-black uppercase tracking-[0.3em] text-[#fecb00] mb-8">Navigasi</h4>
            <ul class="space-y-2">
              <li><NuxtLink to="/" class="text-[10px] font-bold text-slate-100 hover:text-[#fecb00] transition-colors uppercase tracking-widest">Beranda</NuxtLink></li>
              <li><NuxtLink to="/profil-baznas" class="text-[10px] font-bold text-slate-100 hover:text-[#fecb00] transition-colors uppercase tracking-widest">Tentang Kami</NuxtLink></li>
              <li><NuxtLink to="/statistik" class="text-[10px] font-bold text-slate-100 hover:text-[#fecb00] transition-colors uppercase tracking-widest">Statistik & Dampak</NuxtLink></li>
              <li><NuxtLink to="/unduhan" class="text-[10px] font-bold text-slate-100 hover:text-[#fecb00] transition-colors uppercase tracking-widest">Pusat Unduhan</NuxtLink></li>
              <li><a href="https://donasi.baznastangerangkab.or.id" class="text-[10px] font-bold text-slate-100 hover:text-[#fecb00] transition-colors uppercase tracking-widest">Zakat Online</a></li>
            </ul>
          </div>

          <div>
            <h4 class="text-xs font-black uppercase tracking-[0.3em] text-[#fecb00] mb-8">Layanan</h4>
            <ul class="space-y-2">
              <li><NuxtLink to="/rekening-donasi" class="text-[10px] font-bold text-slate-100 hover:text-[#fecb00] transition-colors uppercase tracking-widest">Rekening Donasi</NuxtLink></li>
              <li><NuxtLink to="/layanan-mustahik" class="text-[10px] font-bold text-slate-100 hover:text-[#fecb00] transition-colors uppercase tracking-widest">Layanan Mustahik</NuxtLink></li>
              <li><NuxtLink to="/kontak" class="text-[10px] font-bold text-slate-100 hover:text-[#fecb00] transition-colors uppercase tracking-widest">Hubungi Kami</NuxtLink></li>
            </ul>
          </div>

          <div>
            <h4 class="text-xs font-black uppercase tracking-[0.3em] text-[#fecb00] mb-8">Hubungi Kami</h4>
            <div class="space-y-6">
              <div class="flex gap-4 justify-center md:justify-start text-left">
                <div class="shrink-0 text-[#fecb00]"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg></div>
                <p class="text-[11px] text-white font-medium leading-relaxed">
                  Jl. Islamic Center No.01 Citra Raya, Ciakar, Panongan, Kab. Tangerang, Banten 15711
                </p>
              </div>
              <div class="flex gap-4 justify-center md:justify-start text-left">
                <div class="shrink-0 text-[#fecb00]"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg></div>
                <p class="text-[11px] text-white font-bold uppercase tracking-widest leading-none">{{ settings.admin_email || 'baznas.tangerangkab@gmail.com' }}</p>
              </div>
              <div class="flex gap-4 justify-center md:justify-start text-left">
                <div class="shrink-0 text-[#fecb00] font-black text-xs">Hotline:</div>
                <p class="text-[11px] text-white font-black uppercase tracking-widest leading-none">{{ settings.site_phone || '0800-1-BAZNAS' }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="pt-10 border-t border-white/5 text-center">
          <p class="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">
            &copy; 2026 Badan Amil Zakat Nasional (BAZNAS) Kabupaten Tangerang
          </p>
        </div>
      </div>
    </footer>
    
    <!-- Real-time Support Chat -->
    <ChatWidget />

    <!-- Homepage Flyer Modal -->
    <PortalFlyerModal />
  </div>
</template>

<style scoped>
.router-link-active {
  background-color: rgb(236 253 245); /* emerald-50 */
  color: #01803d !important;
}

@keyframes marquee {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}

.animate-marquee {
  display: inline-block;
  animation: marquee 30s linear infinite;
}
</style>
