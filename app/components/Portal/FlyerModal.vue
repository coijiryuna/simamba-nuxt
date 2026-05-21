<script setup>
import { X } from 'lucide-vue-next'

const { data: layoutData } = useNuxtData('layout-data')
const settings = computed(() => layoutData.value?.settings || {})

const route = useRoute()
const showFlyer = ref(false)

onMounted(() => {
  // Check if we are on home page, flyer is active and has image
  if (route.path === '/' && settings.value.flyer_active === 'yes' && settings.value.flyer_image) {
    // Show only once per session or use localStorage for once per day
    const flyerShownAt = localStorage.getItem('flyer_shown_at')
    const today = new Date().toDateString()
    
    if (flyerShownAt !== today) {
      // Delay a bit for effect
      setTimeout(() => {
        showFlyer.value = true
      }, 1500)
    }
  }
})

const closeFlyer = () => {
  showFlyer.value = false
  localStorage.setItem('flyer_shown_at', new Date().toDateString())
}

const handleFlyerClick = () => {
  if (settings.value.flyer_link) {
    window.open(settings.value.flyer_link, '_blank')
    closeFlyer()
  }
}
</script>

<template>
  <Transition name="fade">
    <div v-if="showFlyer" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div class="relative max-w-lg w-full transform transition-all animate-in zoom-in duration-300">
        <!-- Close Button -->
        <button 
          @click="closeFlyer"
          class="absolute -top-12 right-0 md:-right-12 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-all border border-white/20 backdrop-blur-md"
        >
          <X class="w-6 h-6" />
        </button>

        <!-- Flyer Content -->
        <div 
          class="bg-white rounded-sm shadow-2xl overflow-hidden border-4 border-white cursor-pointer group"
          @click="handleFlyerClick"
        >
          <img 
            :src="settings.flyer_image" 
            alt="Flyer Himbauan"
            class="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-105"
          />
          
          <!-- Click Indicator if link exists -->
          <div v-if="settings.flyer_link" class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
            <div class="bg-emerald-600 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all shadow-xl">
              Lihat Selengkapnya
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@keyframes zoom-in {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
.animate-in {
  animation-fill-mode: forwards;
}
</style>
