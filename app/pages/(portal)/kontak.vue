<script setup>
definePageMeta({
  layout: 'default'
})

useSeoMeta({
  title: 'Hubungi Kami - BAZNAS Kabupaten Tangerang',
  description: 'Butuh bantuan atau informasi lebih lanjut? Hubungi layanan BAZNAS Kabupaten Tangerang melalui WhatsApp, Telepon, atau Kunjungi Kantor kami.',
  ogTitle: 'Kontak BAZNAS Kabupaten Tangerang',
  ogImage: '/logo.png'
})

const { data: settingsData } = await useFetch('/api/v1/settings')
const settings = computed(() => settingsData.value?.data || {})

import Swal from 'sweetalert2'

const form = ref({
  name: '',
  email: '',
  subject: '',
  phone: '',
  message: ''
})

const loading = ref(false)

const handleSubmit = async () => {
  loading.value = true
  try {
    const res = await $fetch('/api/v1/messages', {
      method: 'POST',
      body: form.value
    })
    
    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: res.message,
      timer: 3000,
      showConfirmButton: false
    })

    // Reset form
    form.value = {
      name: '',
      email: '',
      subject: '',
      phone: '',
      message: ''
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: error.data?.statusMessage || 'Terjadi kesalahan saat mengirim pesan.'
    })
  } finally {
    loading.value = false
  }
}

// Function to handle Google Maps Embed URL
const embedMapsUrl = computed(() => {
  const url = settings.value?.site_maps_url || ''
  if (url.includes('google.com/maps/embed') || url.includes('google.com/maps/api')) {
    return url
  }
  
  // Default embed for BAZNAS Kabupaten Tangerang based on the provided location
  return "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.1155644218125!2d106.53403517579113!3d-6.248499393739896!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69fd8aebcbc0c9%3A0x2d6f50ad9b40a3e2!2sIslamic%20Center%20Kab.%20Tanggerang%2C%20Ciakar%2C%20Kec.%20Panongan%2C%20Kabupaten%20Tangerang%2C%20Banten!5e0!3m2!1sid!2sid!4v1778689354504!5m2!1sid!2sid"
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-12">
    <div class="mb-12">
      <h1 class="text-2xl md:text-4xl font-black text-slate-800 uppercase tracking-tighter leading-none mb-4">Hubungi Kami</h1>
      <div class="w-16 h-1.5 bg-[#fecb00] rounded-sm"></div>
      <p class="mt-4 text-slate-500 font-medium uppercase tracking-[0.3em] text-[10px]">Kami Siap Melayani Anda</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
      <!-- Contact Info -->
      <div class="lg:col-span-4 space-y-8">
        <div class="bg-white p-8 rounded-sm border border-slate-100 shadow-sm space-y-6">
          <div class="space-y-2">
            <h3 class="text-[10px] font-black text-[#01803d] uppercase tracking-widest">Alamat Kantor</h3>
            <p class="text-sm font-bold text-slate-700 leading-relaxed whitespace-pre-line">
              {{ settings.site_address || 'Gedung BAZNAS Kabupaten Tangerang\nJl. Raya Tigaraksa, Kec. Tigaraksa\nKabupaten Tangerang, Banten 15720' }}
            </p>
          </div>
          <div class="space-y-2">
            <h3 class="text-[10px] font-black text-[#01803d] uppercase tracking-widest">Kontak & Hotline</h3>
            <p class="text-sm font-bold text-slate-700">
              Telp: {{ settings.site_phone || '(021) 12345678' }}<br>
              Email: {{ settings.admin_email || 'baznas.tangerang@example.com' }}
            </p>
          </div>
          <div class="space-y-2">
            <h3 class="text-[10px] font-black text-[#01803d] uppercase tracking-widest">Jam Operasional</h3>
            <p class="text-sm font-bold text-slate-700">
              Senin - Jumat: 08.00 - 16.00 WIB
            </p>
          </div>
          
          <div v-if="settings.site_facebook || settings.site_instagram || settings.site_twitter" class="pt-6 border-t border-slate-50 flex items-center gap-3">
            <a v-if="settings.site_facebook" :href="settings.site_facebook" target="_blank" class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-[#01803d] hover:text-white transition-all">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a v-if="settings.site_instagram" :href="settings.site_instagram" target="_blank" class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-[#01803d] hover:text-white transition-all">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a v-if="settings.site_twitter" :href="settings.site_twitter" target="_blank" class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-[#01803d] hover:text-white transition-all">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
          </div>
        </div>
      </div>

      <!-- Contact Form -->
      <div class="lg:col-span-8">
        <div class="bg-white p-8 md:p-12 rounded-sm border border-slate-100 shadow-xl">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-[10px] font-black uppercase tracking-widest text-slate-400">Nama Lengkap</label>
                <input v-model="form.name" required type="text" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:border-[#01803d] transition-colors font-bold text-sm" placeholder="Masukkan nama Anda">
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black uppercase tracking-widest text-slate-400">Email</label>
                <input v-model="form.email" required type="email" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:border-[#01803d] transition-colors font-bold text-sm" placeholder="email@contoh.com">
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-[10px] font-black uppercase tracking-widest text-slate-400">Subjek Pesan</label>
                <input v-model="form.subject" type="text" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:border-[#01803d] transition-colors font-bold text-sm" placeholder="Apa yang ingin Anda tanyakan?">
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black uppercase tracking-widest text-slate-400">Telphone</label>
                <input v-model="form.phone" type="text" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:border-[#01803d] transition-colors font-bold text-sm" placeholder="Nomor telphone atau WA">
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest text-slate-400">Isi Pesan</label>
              <textarea v-model="form.message" required rows="6" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:border-[#01803d] transition-colors font-bold text-sm" placeholder="Tuliskan pesan Anda di sini..."></textarea>
            </div>
            <button :disabled="loading" type="submit" class="w-full bg-[#01803d] text-white py-4 rounded-sm font-black text-xs uppercase tracking-[0.2em] hover:bg-[#016932] transition-colors shadow-lg shadow-emerald-500/20 disabled:bg-slate-400">
              {{ loading ? 'Mengirim...' : 'Kirim Pesan Sekarang' }}
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Google Map Section -->
    <div v-if="settings.site_maps_url" class="mt-16 reveal">
      <!-- Google Maps Embed Section -->
      <div v-if="settings.site_maps_url" class="bg-white p-2 rounded-sm shadow-xl border border-slate-100">
        <div class="w-full h-[450px] rounded-sm overflow-hidden bg-slate-100">
          <iframe 
            :src="embedMapsUrl" 
            class="w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-700" 
            allowfullscreen="" 
            loading="lazy" 
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
        <div class="p-6 flex justify-between items-center">
          <div>
            <h3 class="text-xs font-black text-slate-800 uppercase tracking-widest mb-1">Lokasi Kantor</h3>
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{{ settings.site_address }}</p>
          </div>
          <a :href="settings.site_maps_url" target="_blank" class="bg-slate-800 text-white px-6 py-2.5 rounded-sm font-black text-[9px] uppercase tracking-widest hover:bg-[#01803d] transition-colors">
            Buka di Google Maps
          </a>
        </div>
      </div>

      <!-- Fallback if URL is not an embed URL -->
      <div v-else class="bg-[#01803d] p-12 rounded-sm shadow-2xl text-center space-y-6 relative overflow-hidden group">
        <div class="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
        <div class="relative z-10 space-y-4">
          <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </div>
          <h3 class="text-xl md:text-3xl font-black text-white uppercase tracking-tighter">Kunjungi Kantor Kami</h3>
          <p class="text-white/70 max-w-lg mx-auto text-sm font-medium">{{ settings.site_address }}</p>
          <div class="pt-4">
            <a :href="settings.site_maps_url" target="_blank" class="inline-flex items-center gap-3 bg-[#fecb00] text-slate-900 px-8 py-4 rounded-sm font-black text-xs uppercase tracking-[0.2em] hover:bg-white transition-all shadow-xl">
              Petunjuk Arah (Google Maps)
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
