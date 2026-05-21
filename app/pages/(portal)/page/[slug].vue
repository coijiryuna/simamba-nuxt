<script setup>
definePageMeta({
  layout: 'default'
})

const route = useRoute()
const slug = route.params.slug

// Fetch the specific page content
const { data: page, pending, error } = await useFetch(`/api/v1/posts/${slug}`)

useSeoMeta({
  title: () => `${page.value?.post_title || 'Halaman'} - BAZNAS Kabupaten Tangerang`,
  ogTitle: () => `${page.value?.post_title} - BAZNAS Kabupaten Tangerang`,
  description: () => page.value?.post_excerpt || 'Informasi resmi dari BAZNAS Kabupaten Tangerang.',
  ogDescription: () => page.value?.post_excerpt || 'Informasi resmi dari BAZNAS Kabupaten Tangerang.',
  ogImage: () => page.value?.featured_image_url || '/logo.png',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-16">
    <div v-if="pending" class="flex flex-col items-center justify-center py-32 space-y-4">
      <div class="w-12 h-12 border-4 border-[#01803d] border-t-transparent rounded-full animate-spin"></div>
      <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Memuat Halaman...</p>
    </div>

    <div v-else-if="error || !page" class="text-center py-32 bg-red-50 rounded-sm border border-red-100">
      <p class="text-red-500 font-bold mb-4 uppercase tracking-widest text-xs">Halaman Tidak Ditemukan</p>
      <NuxtLink to="/" class="text-xs font-black text-[#01803d] uppercase tracking-widest hover:underline">Kembali ke Beranda</NuxtLink>
    </div>

    <div v-else class="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <!-- Header -->
      <div class="space-y-6">
        <nav class="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-widest">
          <NuxtLink to="/" class="hover:text-[#01803d]">Beranda</NuxtLink>
          <span class="text-slate-300">/</span>
          <span class="text-[#01803d]">{{ page.post_title }}</span>
        </nav>
        
        <h1 class="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none uppercase italic">
          {{ page.post_title }}
        </h1>
        <div class="w-20 h-2 bg-[#fecb00] rounded-sm"></div>
      </div>

      <!-- Featured Image if any -->
      <div v-if="page.featured_image_url" class="rounded-sm overflow-hidden shadow-2xl border border-slate-100">
        <img :src="page.featured_image_url" class="w-full h-auto" :alt="page.post_title" />
      </div>

      <!-- Content -->
      <div 
        class="prose prose-slate prose-lg max-w-none prose-img:rounded-sm prose-a:text-[#01803d] prose-strong:font-black text-slate-800 font-medium leading-relaxed article-content" 
        v-html="page.post_content"
      >
      </div>
    </div>
  </div>
</template>

<style scoped>
.article-content :deep(p) {
  margin-bottom: 1.5rem;
}
.article-content :deep(h2) {
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: -0.025em;
  color: #0f172a;
  margin-top: 3rem;
  margin-bottom: 1rem;
}
</style>
