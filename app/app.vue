<script setup>
const { data: settingsRes } = await useFetch('/api/v1/settings')
const settings = computed(() => settingsRes.value?.data || {})

useHead({
  link: [
    { 
      rel: 'icon', 
      type: 'image/x-icon', 
      href: computed(() => settings.value.site_favicon || '/favicon.ico')
    }
  ]
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
