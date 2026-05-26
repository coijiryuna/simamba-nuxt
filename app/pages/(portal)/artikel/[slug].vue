<script setup>
definePageMeta({
  layout: 'default'
})

const route = useRoute()
const slug = route.params.slug

// Fetch the specific post
const { data: post, pending, error } = await useFetch(`/api/v1/posts/${slug}`)

// Fetch related/other news
const { data: recentPosts } = useFetch('/api/news', {
  query: { limit: 5 }
})

useSeoMeta({
  title: () => `${post.value?.post_title || 'Detail Berita'} - BAZNAS Kabupaten Tangerang`,
  ogTitle: () => post.value?.post_title,
  description: () => post.value?.post_excerpt || 'Baca berita terbaru dari BAZNAS Kabupaten Tangerang.',
  ogDescription: () => post.value?.post_excerpt,
  ogImage: () => post.value?.featured_image_url || '/logo.png',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-12">
    <div v-if="pending" class="flex flex-col items-center justify-center py-32 space-y-4">
      <div class="w-12 h-12 border-4 border-[#01803d] border-t-transparent rounded-full animate-spin"></div>
      <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Memuat Berita...</p>
    </div>

    <div v-else-if="error" class="text-center py-32 bg-red-50 rounded-2xl border border-red-100">
      <p class="text-red-500 font-bold mb-4">Waduh! Berita tidak ditemukan.</p>
      <NuxtLink to="/" class="text-sm font-black text-[#01803d] uppercase tracking-widest hover:underline">Kembali ke Beranda</NuxtLink>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-12">
      <!-- MAIN CONTENT -->
      <article class="lg:col-span-8 space-y-8 animate-slide-up">
        <!-- Breadcrumbs -->
        <nav class="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <NuxtLink to="/" class="hover:text-[#01803d]">Beranda</NuxtLink>
          <span>/</span>
          <span class="text-[#01803d] truncate max-w-[200px]">{{ post.post_title }}</span>
        </nav>

        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <span class="bg-[#fecb00] text-slate-900 text-[8px] font-black px-2 py-0.5 rounded-sm uppercase tracking-widest">
              {{ post.post_type || 'Berita' }}
            </span>
            <span class="text-[10px] font-bold text-slate-400">{{ new Date(post.post_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) }}</span>
          </div>
          <h1 class="text-xl md:text-3xl font-black text-slate-800 tracking-tighter leading-tight">
            {{ post.post_title }}
          </h1>
          <div class="flex items-center gap-2 pt-1">
            <div class="w-6 h-6 bg-[#01803d] rounded-full flex items-center justify-center text-white text-[10px] font-bold">
              {{ post.author?.charAt(0) }}
            </div>
            <div class="text-[9px] font-black uppercase tracking-widest text-slate-500">
              Oleh <span class="text-slate-800">{{ post.author || 'Admin BAZNAS' }}</span>
            </div>
          </div>
        </div>

        <div class="rounded-sm overflow-hidden shadow-2xl border border-slate-100">
          <img :src="post.featured_image_url || 'https://via.placeholder.com/1200x600?text=Baznas+Berita'" class="w-full h-full object-cover" />
        </div>

        <div class="prose prose-slate prose-lg max-w-none prose-img:rounded-sm prose-a:text-[#01803d] prose-strong:font-black article-content text-sm md:text-lg line-clamp-none leading-relaxed text-justify" v-html="post.post_content">
        </div>

        <!-- Share Buttons -->
        <div class="pt-12 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bagikan Berita Ini</div>
          <div class="flex items-center gap-2">
            <button class="p-3 bg-slate-800 text-white rounded-sm hover:bg-[#01803d] transition-all"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></button>
            <button class="p-3 bg-slate-800 text-white rounded-sm hover:bg-[#01803d] transition-all"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg></button>
            <button class="p-3 bg-slate-800 text-white rounded-sm hover:bg-[#01803d] transition-all"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg></button>
          </div>
        </div>
      </article>

      <!-- SIDEBAR -->
      <aside class="lg:col-span-4 space-y-12">
        <div class="bg-slate-50 p-8 rounded-sm border border-slate-100">
          <h3 class="text-xs font-black uppercase tracking-[0.2em] mb-6 text-slate-800">Berita Terkini</h3>
          <div class="space-y-6">
            <NuxtLink v-for="recent in recentPosts?.data" :key="recent.ID" :to="`/berita/${recent.slug}`" class="flex gap-4 group">
               <div class="w-16 h-16 shrink-0 bg-slate-200 rounded-sm overflow-hidden">
                 <img :src="recent.featured_image_url || 'https://via.placeholder.com/100x100'" class="w-full h-full object-cover group-hover:scale-110 transition-transform" />
               </div>
               <div class="space-y-1">
                 <h4 class="text-xs font-bold leading-snug group-hover:text-[#01803d] transition-colors line-clamp-2">{{ recent.post_title }}</h4>
                 <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ new Date(recent.post_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) }}</p>
               </div>
            </NuxtLink>
          </div>
        </div>
        <!-- Daftar rekening dari BankCard -->
        <BankCard />
        <!-- Ad/Promo Card -->
        <div class="bg-[#01803d] p-8 rounded-sm text-white relative overflow-hidden group">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-all"></div>
          <h3 class="text-xl font-black uppercase tracking-tighter leading-tight mb-4 relative z-10">Tunaikan Zakat Sekarang</h3>
          <p class="text-emerald-100 text-xs font-medium mb-6 relative z-10 italic">Bersihkan harta, tenangkan jiwa dengan zakat online melalui BAZNAS.</p>
          <NuxtLink to="/zakat" class="inline-block w-full bg-[#fecb00] text-slate-900 text-center py-3 rounded-sm font-black text-[10px] uppercase tracking-widest relative z-10 shadow-lg active:scale-95 transition-transform">Bayar Zakat</NuxtLink>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.article-content :deep(p) {
  margin-bottom: 1.5rem;
  line-height: 1.8;
  color: #334155;
}

.article-content :deep(h2) {
  font-size: 1.5rem;
  font-weight: 900;
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  color: #1e293b;
  text-transform: uppercase;
  letter-spacing: -0.025em;
}
</style>
