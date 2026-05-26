<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const props = defineProps({
  data: {
    type: Object,
    default: () => ({ data: [] })
  }
})

const modules = [Autoplay, Pagination, Navigation];
</script>

<template>
  <div v-if="data?.data?.length > 0" class="mb-4 rounded-sm overflow-hidden shadow-2xl border border-white/5 relative group">
    <swiper
      :modules="modules"
      :slides-per-view="1"
      :loop="true"
      :autoplay="{
        delay: 6000,
        disableOnInteraction: false,
      }"
      :pagination="{ clickable: true }"
      :navigation="true"
class="h-75 md:h-150"
    >
      <swiper-slide v-for="slider in data.data" :key="slider.id">
        <div class="relative w-full h-full ">
          <img 
            :src="slider.image_url || slider.image || 'https://via.placeholder.com/1600x800?text=Baznas+Slider'" 
           class="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-20000 ease-in-out"
            alt="Slider Image"
          />
        </div>
      </swiper-slide>
    </swiper>
  </div>
</template>

<style scoped>
:deep(.swiper-pagination-bullet) {
  background: #01803d;
    opacity: 0.5;
  width: 12px;
  height: 4px;
  border-radius: 2px;
  transition: all 0.3s;
}
:deep(.swiper-pagination-bullet-active) {
  background: #fecb00;
  opacity: 1;
  width: 32px;
}
:deep(.swiper-button-next), :deep(.swiper-button-prev) {
  color: #fecb00;
  width: 40px;
    height: 40px;
  background: rgba(1, 42, 20, 0.5);
  backdrop-filter: blur(8px);
  border-radius: 50%;
    position: absolute;
  transition: all 0.3s;
  opacity: 0;
}
.group:hover :deep(.swiper-button-next), 
.group:hover :deep(.swiper-button-prev) {
  opacity: 1;
}
:deep(.swiper-button-next:hover), :deep(.swiper-button-prev:hover) {
  background: #01803d;
  color: white;
}
:deep(.swiper-button-next::after), :deep(.swiper-button-prev::after) {
  font-size: 13px;
  font-weight: 900;
}
</style>
