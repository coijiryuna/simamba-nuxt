<script setup>
definePageMeta({
    layout: 'default'
})
const { data: settingsRes } = await useFetch('/api/v1/settings')
const settings = computed(() => settingsRes.value?.data || {})

const route = useRoute()
const slug = route.params.slug

// 1. Prioritas: Cari sebagai postingan tunggal
const { data: fallbackPost, pending: postPending } = await useAsyncData(`post-${slug}`, async () => {
    try {
        return await $fetch(`/api/v1/agendas/${slug}`)
    } catch (e) {
        return null
    }
})


const { data: latestPosts } = await useFetch('/api/v1/agendas', {
    query: { limit: 5 }
})


useSeoMeta({
    title: () => {
        if (fallbackPost.value) return `${fallbackPost.value.agenda_title} - BAZNAS Kabupaten Tangerang`
        return 'Halaman Tidak Ditemukan'
    },
    description: () => fallbackPost.value?.agenda_excerpt || 'Informasi dari BAZNAS Kabupaten Tangerang.',
    ogImage: () => fallbackPost.value?.featured_image_url || settings.value.site_logo || '/favicon.ico',
    twitterImage: () => fallbackPost.value?.featured_image_url || settings.value.site_logo || '/favicon.ico',
    twitterTitle: () => fallbackPost.value?.agenda_title,
    twitterDescription: () => fallbackPost.value?.agenda_excerpt,
    twitterCard: 'summary_large_image',
})
</script>

<template>
    <div class="max-w-7xl mx-auto px-4 py-6">

        <div v-if="postPending" class="space-y-6">
            <div class="h-8 bg-slate-200 rounded-sm w-1/2 animate-pulse"></div>
            <div class="h-4 bg-slate-200 rounded-sm w-full animate-pulse"></div>
            <div class="h-4 bg-slate-200 rounded-sm w-full animate-pulse"></div>
            <div class="h-4 bg-slate-200 rounded-sm w-3/4 animate-pulse"></div>
            <div class="h-96 bg-slate-200 rounded-sm animate-pulse"></div>
        </div>

        <div v-else-if="fallbackPost" class="prose max-w-none">
            <div class="space-y-3">
                <div class="flex items-center gap-3">
                    <span
                        class="bg-[#fecb00] text-slate-900 text-[8px] font-black px-2 py-0.5 rounded-sm uppercase tracking-widest">
                        {{ fallbackPost.agenda_type || 'Berita' }}
                    </span>
                    <span class="text-[10px] font-bold text-slate-400">{{ new
                        Date(fallbackPost.agenda_date).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'long', year:
                        'numeric' }) }}</span>
                </div>
                <h1 class="text-xl md:text-3xl font-black text-slate-800 tracking-tighter leading-tight">
                    {{ fallbackPost.agenda_title }}
                </h1>
                <div class="flex items-center gap-2 pt-1">
                    <div
                        class="w-6 h-6 bg-[#01803d] rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                        {{ fallbackPost.author?.charAt(0) }}
                    </div>
                    <div class="text-[9px] font-black uppercase tracking-widest text-slate-500">
                        Oleh <span class="text-slate-800">{{ fallbackPost.author || 'Admin BAZNAS' }}</span>
                    </div>
                </div>
            </div>
            <img :src="fallbackPost.featured_image_url" alt="" class="w-full h-auto rounded-md mb-6" />
            <div v-html="fallbackPost.agenda_content"></div>

            <!-- Tampilkan galeri gambar jika ada -->
            <div v-if="fallbackPost.gallery_images && fallbackPost.gallery_images.length > 0" class="mt-12">
                <h2 class="text-xl font-bold mb-6 border-l-4 border-[#01803d] pl-4 uppercase tracking-tight">Galeri Kegiatan {{ fallbackPost.agenda_type  }}</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div v-for="(imgUrl, index) in fallbackPost.gallery_images" :key="index" class="aspect-video relative h-auto overflow-hidden rounded-sm border border-slate-100 shadow-sm">
                        <img :src="imgUrl" class="w-full h-auto object-cover    hover:scale-110 transition-transform duration-700" alt="Gallery Image" />
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="text-center py-20">
            <h2 class="text-3xl font-bold mb-4">Agenda Tidak Ditemukan</h2>
            <p class="text-slate-500 mb-8">Maaf, agenda yang Anda cari tidak ditemukan. Silakan kembali ke halaman utama atau jelajahi agenda lainnya.</p>
            <NuxtLink to="/agenda" class="inline-block px-6 py-3 bg-[#01803d] text-white rounded-sm hover:bg-[#01662b] transition-colors">Kembali ke Agenda</NuxtLink>
        </div>

    </div>
</template>
