<script setup>
const { data: settingsRes } = await useFetch('/api/v1/settings')
const settings = computed(() => settingsRes.value?.data || {})

// Kelola meta head secara reaktif (Favicon, Title, dll)
useHead({
  title: computed(() => settings.value.blogname || 'Simamba'),
  meta: [
    { name: 'description', content: computed(() => settings.value.meta_description || settings.value.blogdescription) },
    // Open Graph / Facebook / WhatsApp
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: computed(() => settings.value.blogname) },
    { property: 'og:description', content: computed(() => settings.value.meta_description || settings.value.blogdescription) },
    { property: 'og:image', content: computed(() => settings.value.site_logo) },
    { property: 'og:image:alt', content: computed(() => settings.value.blogname) },
    // Twitter
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: computed(() => settings.value.blogname) },
    { name: 'twitter:description', content: computed(() => settings.value.meta_description || settings.value.blogdescription) },
    { name: 'twitter:image', content: computed(() => settings.value.site_logo) },
    // PWA Theme Color
    { name: 'theme-color', content: '#047857' } // Warna Emerald-700 sesuai branding
  ],
  link: [
    { rel: 'manifest', href: '/manifest.json' },
    {
      rel: 'icon',
      type: computed(() => {
        if (settings.value.site_favicon?.endsWith('.png')) return 'image/png'
        if (settings.value.site_favicon?.endsWith('.svg')) return 'image/svg+xml'
        return 'image/x-icon'
      }),
      href: computed(() => settings.value.site_favicon || '/favicon.ico')
    },
    {
      rel: 'apple-touch-icon',
      // Menggunakan logo sebagai prioritas untuk ikon layar utama karena biasanya resolusinya lebih tinggi
      href: computed(() => settings.value.site_logo || settings.value.site_favicon || '/favicon.ico')
    }
  ]
})

// Provide settings ke seluruh app
provide('settings', settings)

// Daftarkan Service Worker untuk fitur Offline PWA
onMounted(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
/* Reset dasar biar nggak ada margin aneh */
body {
  margin: 0;
  padding: 0;
}
</style>
