<script setup>
// Redirect ke halaman settings dengan tab visi-misi aktif
onMounted(() => {
  navigateTo('/admin/settings?tab=visimisi')
})
</script>

<template>
  <div class="flex items-center justify-center min-h-[400px]">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
  </div>
</template>
