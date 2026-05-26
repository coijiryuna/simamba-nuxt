<script setup>
definePageMeta({
  layout: 'default'
})

useSeoMeta({
  title: 'BAZNAS Kabupaten Tangerang - Pilihan Pertama Pembayar Zakat',
  description: 'Lembaga resmi pemerintah yang mengelola Zakat, Infaq, dan Sedekah secara profesional dan transparan di Kabupaten Tangerang.',
  ogTitle: 'BAZNAS Kabupaten Tangerang - Pilihan Pertama Pembayar Zakat',
  ogDescription: 'Lembaga resmi pemerintah yang mengelola Zakat, Infaq, dan Sedekah secara profesional dan transparan di Kabupaten Tangerang.',
  ogImage: '/logo.png'
})

const config = useRuntimeConfig()
const donasiurl = config.public.donasiBase

// Fetching all necessary data for the portal in parallel with lazy mode
const { data: homeData, pending } = useAsyncData('home-data', async () => {
  const [postsRes, articlesRes, programsRes, campaigns, stats, gallery, sliders] = await Promise.all([
    $fetch('/api/news', { query: { limit: 4, type: 'post' } }),
    $fetch('/api/news', { query: { limit: 4, type: 'article' } }),
    $fetch('/api/news', { query: { limit: 4, type: 'program' } }),
    $fetch('/api/v1/campaigns'),
    $fetch('/api/v1/stats'),
    $fetch('/api/v1/gallery'),
    $fetch('/api/sliders')
  ])
  return {
    posts: postsRes?.data || [],
    articles: articlesRes?.data || [],
    programs: programsRes?.data || [],
    campaigns,
    stats,
    gallery,
    sliders
  }
}, { lazy: true })

const posts = computed(() => homeData.value?.posts || [])
const articles = computed(() => homeData.value?.articles || [])
const programs = computed(() => homeData.value?.programs || [])
const campaigns = computed(() => homeData.value?.campaigns || [])
const statsData = computed(() => homeData.value?.stats || {})
const gallery = computed(() => homeData.value?.gallery || [])
const sliders = computed(() => homeData.value?.sliders || { data: [] })

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount || 0)
}

const calculateProgress = (current, goal) => {
  if (!goal || goal == 0) return 0
  return Math.min(Math.round((current / goal) * 100), 100)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}
</script>

<template>
  <div class="portal-home space-y-24 pb-24">
    <!-- HERO SECTION (SLIDER) -->
    <section class="-mx-4 lg:-mx-2 reveal relative z-0">
      <div v-if="pending && !sliders.data?.length"
        class="h-[300px] md:h-[600px] bg-slate-100 animate-pulse flex items-center justify-center">
        <div class="text-slate-300 font-black uppercase tracking-[0.5em]">BAZNAS TANGERANG</div>
      </div>
      <HomeSlider v-else :data="sliders" />
    </section>

    <!-- IMPACT STATS (FLOATING) -->
    <section class="max-w-7xl mx-auto px-4 reveal relative z-10 -mt-16 md:-mt-18">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <template v-if="pending && !statsData.total_donasi">
          <div v-for="i in 4" :key="i" class="h-32 bg-slate-50 border border-slate-100 rounded-sm animate-pulse"></div>
        </template>
        <template v-else>
          <div
            class="bg-white p-8 rounded-sm shadow-xl border-b-4 border-emerald-500 hover:-translate-y-1 transition-all duration-500 group">
            <div
              class="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 group-hover:text-emerald-500 transition-colors">
              Dana Terkumpul</div>
            <div class="text-xl md:text-3xl font-black text-slate-800 tracking-tighter">{{
              formatCurrency(statsData.total_donasi) }}</div>
          </div>
          <div
            class="bg-white p-8 rounded-sm shadow-xl border-b-4 border-[#fecb00] hover:-translate-y-1 transition-all duration-500 group">
            <div
              class="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 group-hover:text-yellow-600 transition-colors">
              Muzakki</div>
            <div class="text-xl md:text-3xl font-black text-slate-800 tracking-tighter">{{ statsData.total_muzakki }}
            </div>
          </div>
          <div
            class="bg-white p-8 rounded-sm shadow-xl border-b-4 border-emerald-500 hover:-translate-y-1 transition-all duration-500 group">
            <div
              class="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 group-hover:text-emerald-500 transition-colors">
              Penyaluran</div>
            <div class="text-xl md:text-3xl font-black text-slate-800 tracking-tighter">{{
              formatCurrency(statsData.total_penyaluran) }}</div>
          </div>
          <div
            class="bg-white p-8 rounded-sm shadow-xl border-b-4 border-[#fecb00] hover:-translate-y-1 transition-all duration-500 group">
            <div
              class="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 group-hover:text-yellow-600 transition-colors">
              Mustahik</div>
            <div class="text-xl md:text-3xl font-black text-slate-800 tracking-tighter">{{ statsData.total_mustahik }}
            </div>
          </div>
        </template>
      </div>
    </section>

    <!-- PROGRAM UNGGULAN -->
    <section class="max-w-7xl mx-auto px-4 space-y-8 reveal">
      <div class="flex items-end justify-between border-b border-slate-100 pb-6">
        <div class="space-y-2">
          <h2 class="text-xl md:text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none">Program
            Unggulan
          </h2>
          <p class="text-[8px] md:text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Bantu Sesama Melalui
            Program
            BAZNAS</p>
        </div>
        <a :href="`${donasiurl}/campaigns`"
          class="text-[10px] md:text-sm font-black text-[#01803d] uppercase tracking-widest hover:tracking-[0.2em] transition-all duration-300">Lihat
          Semua</a>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <template v-if="pending && !campaigns.length">
          <div v-for="i in 4" :key="i" class="space-y-4">
            <div class="aspect-video bg-slate-100 animate-pulse rounded-sm"></div>
            <div class="h-4 bg-slate-100 animate-pulse w-3/4 rounded-sm"></div>
            <div class="h-10 bg-slate-100 animate-pulse rounded-sm"></div>
          </div>
        </template>
        <template v-else>
          <div v-for="campaign in campaigns" :key="campaign.id"
            class="bg-white rounded-sm overflow-hidden shadow-lg border border-slate-100 group flex flex-col h-auto hover:shadow-2xl transition-all duration-500">
            <div class="relative h-auto overflow-hidden bg-slate-100">
              <img
                :src="campaign.cover_image_url || campaign.image || 'https://via.placeholder.com/600x400?text=Baznas+Campaign'"
                class="w-auto h-auto object-cover group-hover:scale-110 transition-transform duration-700"
                :alt="campaign.title" loading="lazy">
              <div
                class="absolute top-4 left-4 bg-[#01803d] text-white px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-sm shadow-lg">
                {{ campaign.category_name }}
              </div>
            </div>
            <div class="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div class="space-y-4">
                <h3
                  class="text-sm font-black text-slate-800 uppercase tracking-tight line-clamp-2 leading-tight min-h-[2.5rem]">
                  {{ campaign.title }}</h3>
                <div class="space-y-2">
                  <div class="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                    <span class="text-slate-400">Terkumpul</span>
                    <span class="text-emerald-600">{{ formatCurrency(campaign.current_amount) }}</span>
                  </div>
                  <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                      :style="{ width: calculateProgress(campaign.current_amount, campaign.target_amount) + '%' }">
                    </div>
                  </div>
                </div>
              </div>
              <a :href="`${donasiurl}/campaigns/${campaign.slug}`"
                class="block w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 text-center py-4 rounded-sm font-black text-[10px] uppercase tracking-widest shadow-md transition-all border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1 mt-6">
                Donasi Sekarang
              </a>
            </div>
          </div>
        </template>
      </div>
    </section>

    <!-- BERITA TERKINI -->
    <section class="max-w-7xl mx-auto px-4 space-y-8 reveal">
      <div class="flex items-end justify-between border-b border-slate-100 pb-6">
        <div class="space-y-2">
          <h2 class="text-xl md:text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none">Berita
            Terkini
          </h2>
          <p class="text-[8px] md:text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Kabar Terbaru &
            Informasi
            Zakat</p>
        </div>
        <NuxtLink to="/berita"
          class="text-[10px] md:text-sm font-black text-[#01803d] uppercase tracking-widest hover:tracking-[0.2em] transition-all duration-300">
          Lihat Semua</NuxtLink>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <template v-if="pending && !posts.length">
          <div v-for="i in 4" :key="i" class="space-y-4">
            <div class="aspect-video bg-slate-100 animate-pulse rounded-sm"></div>
            <div class="h-4 bg-slate-100 animate-pulse w-full rounded-sm"></div>
            <div class="h-12 bg-slate-100 animate-pulse rounded-sm"></div>
          </div>
        </template>
        <template v-else>
          <article v-for="post in posts" :key="post.ID" class="flex flex-col space-y-4 group">
            <div
              class="aspect-video bg-slate-100 rounded-sm overflow-hidden border border-slate-100 shadow-sm relative">
              <img :src="post.featured_image_url || 'https://via.placeholder.com/800x450?text=Baznas+News'"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                :alt="post.post_title" loading="lazy">
              <div
                class="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              </div>
            </div>
            <div class="space-y-2">
              <div class="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{{
                formatDate(post.post_date) }}</div>
              <NuxtLink :to="`/berita/${post.slug}`">
                <h3
                  class="text-sm font-black text-slate-800 uppercase tracking-tight group-hover:text-emerald-600 transition-colors line-clamp-2 leading-tight h-10">
                  {{ post.post_title }}
                </h3>
              </NuxtLink>
              <p class="text-[10px] text-slate-500 line-clamp-2 leading-relaxed font-bold" v-html="post.post_content">
              </p>
              <NuxtLink :to="`/berita/${post.slug}`"
                class="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-all pt-2 group/link">
                Baca Selengkapnya
                <span
                  class="w-4 h-0.5 bg-slate-200 group-hover/link:w-8 group-hover/link:bg-emerald-500 transition-all"></span>
              </NuxtLink>
            </div>
          </article>
        </template>
      </div>
    </section>

    <!-- PROGRAM KERJA -->
    <section class="max-w-7xl mx-auto px-4 space-y-8 reveal">
      <div class="flex items-end justify-between border-b border-slate-100 pb-6">
        <div class="space-y-2">
          <h2 class="text-xl md:text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none">Program
            Kerja
          </h2>
          <p class="text-[8px] md:text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Aksi Nyata BAZNAS Untuk
            Umat
          </p>
        </div>
        <NuxtLink to="/program"
          class="text-[10px] md:text-sm font-black text-[#01803d] uppercase tracking-widest hover:tracking-[0.2em] transition-all duration-300">
          Lihat Semua</NuxtLink>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <template v-if="pending && !programs.length">
          <div v-for="i in 4" :key="i" class="space-y-4">
            <div class="aspect-video bg-slate-100 animate-pulse rounded-sm"></div>
            <div class="h-4 bg-slate-100 animate-pulse w-full rounded-sm"></div>
          </div>
        </template>
        <template v-else>
          <article v-for="post in programs" :key="post.ID" class="flex flex-col space-y-4 group">
            <div
              class="aspect-video bg-slate-100 rounded-sm overflow-hidden border border-slate-100 shadow-sm relative">
              <img :src="post.featured_image_url || 'https://via.placeholder.com/800x450?text=Baznas+Program'"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                :alt="post.post_title" loading="lazy">
            </div>
            <div class="space-y-2">
              <div class="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{{
                formatDate(post.post_date) }}</div>
              <NuxtLink :to="`/berita/${post.slug}`">
                <h3
                  class="text-sm font-black text-slate-800 uppercase tracking-tight group-hover:text-emerald-600 transition-colors line-clamp-2 leading-tight h-10">
                  {{ post.post_title }}</h3>
              </NuxtLink>

              <NuxtLink :to="`/berita/${post.slug}`"
                class="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-all pt-2 group/link">
                Detail Program
                <span
                  class="w-4 h-0.5 bg-slate-200 group-hover/link:w-8 group-hover/link:bg-emerald-500 transition-all"></span>
              </NuxtLink>
            </div>
          </article>
        </template>
      </div>
    </section>

    <!-- ARTIKEL PILIHAN -->
    <section class="max-w-7xl mx-auto px-4 space-y-8 reveal">
      <div class="flex items-end justify-between border-b border-slate-100 pb-6">
        <div class="space-y-2">
          <h2 class="text-xl md:text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none">Artikel
            Pilihan
          </h2>
          <p class="text-[8px] md:text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Wawasan & Edukasi
            Keislaman
          </p>
        </div>
        <NuxtLink to="/artikel"
          class="text-[10px] md:text-sm font-black text-[#01803d] uppercase tracking-widest hover:tracking-[0.2em] transition-all duration-300">
          Lihat Semua</NuxtLink>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <template v-if="pending && !articles.length">
          <div v-for="i in 4" :key="i" class="space-y-4">
            <div class="aspect-video bg-slate-100 animate-pulse rounded-sm"></div>
            <div class="h-4 bg-slate-100 animate-pulse w-full rounded-sm"></div>
          </div>
        </template>
        <template v-else>
          <article v-for="post in articles" :key="post.ID" class="flex flex-col space-y-4 group">
            <div
              class="aspect-video bg-slate-100 rounded-sm overflow-hidden border border-slate-100 shadow-sm relative">
              <img :src="post.featured_image_url || 'https://via.placeholder.com/800x450?text=Baznas+Article'"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                :alt="post.post_title" loading="lazy">
            </div>
            <div class="space-y-2">
              <div class="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{{
                formatDate(post.post_date) }}</div>
              <NuxtLink :to="`/artikel/${post.slug}`">
                <h3
                  class="text-sm font-black text-slate-800 uppercase tracking-tight group-hover:text-emerald-600 transition-colors line-clamp-2 leading-tight h-10">
                  {{ post.post_title }}</h3>
              </NuxtLink>
              <NuxtLink :to="`/artikel/${post.slug}`"
                class="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-all pt-2 group/link">
                Baca Artikel
                <span
                  class="w-4 h-0.5 bg-slate-200 group-hover/link:w-8 group-hover/link:bg-emerald-500 transition-all"></span>
              </NuxtLink>
            </div>
          </article>
        </template>
      </div>
    </section>

    <!-- GALLERY SECTION -->
    <template v-if="pending && !gallery.length">
      <section class="max-w-7xl mx-auto px-4 space-y-8 reveal">
        <div class="flex items-end justify-between border-b border-slate-100 pb-6 relative z-10">
          <div class="space-y-2">
            <h2 class="text-xl md:text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none">Galeri
              Kegiatan</h2>
            <p class="text-[8px] md:text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Dokumentasi Penyaluran
              & Aktivitas</p>
          </div>
          <NuxtLink to="/galeri"
            class="text-[10px] md:text-sm font-black text-[#01803d] uppercase tracking-widest hover:tracking-[0.2em] transition-all duration-300">
            Lihat Semua</NuxtLink>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
          <div v-for="(item, index) in gallery.slice(0, 4)" :key="index"
            class="aspect-square bg-slate-800 rounded-sm overflow-hidden group cursor-pointer border border-white/5 shadow-lg">
            <img :src="item.image_url || item.image || 'https://via.placeholder.com/400x400?text=Baznas+Gallery'"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-70 group-hover:opacity-100"
              :alt="item.title" loading="lazy">
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.portal-home {
  animation: fadeIn 1s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Reveal on scroll basic style */
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

/* We could use an Intersection Observer here for real lazy reveal, 
   but for now we'll trigger the animation globally or rely on CSS 
   if we had a library. Let's add a simple class to trigger it. */
:deep(.reveal.active) {
  opacity: 1 !important;
  transform: translateY(0) !important;
}

/* Standard reveal without observer for initial load sections */
.reveal {
  animation: revealUp 1s forwards;
  animation-delay: 0.2s;
}

@keyframes revealUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Staggering delays for better feel */
section:nth-child(2) {
  animation-delay: 0.3s;
}

section:nth-child(3) {
  animation-delay: 0.4s;
}

section:nth-child(4) {
  animation-delay: 0.5s;
}

section:nth-child(5) {
  animation-delay: 0.6s;
}
</style>
