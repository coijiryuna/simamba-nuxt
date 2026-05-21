<script setup>
definePageMeta({
  layout: "default",
});

useSeoMeta({
  title: 'Daftar UPZ - BAZNAS Kabupaten Tangerang',
  description: 'Daftar Unit Pengumpul Zakat (UPZ) resmi BAZNAS Kabupaten Tangerang yang tersebar di berbagai wilayah.',
  ogTitle: 'Unit Pengumpul Zakat (UPZ) Kabupaten Tangerang',
  ogImage: '/logo.png'
})

const { data: upzData, pending } = await useFetch("/api/v1/upz-baznas", {
  query: { per_page: 200 },
});

const allUpz = computed(() => upzData.value?.data || []);

const kelompokList = [
  { key: "Semua", label: "Semua", color: "bg-slate-800 text-white" },
  { key: "Dinas", label: "Dinas / OPD", color: "bg-blue-600 text-white" },
  { key: "Lembaga", label: "Lembaga", color: "bg-purple-600 text-white" },
  { key: "Kecamatan", label: "Kecamatan", color: "bg-yellow-600 text-white" },
  {
    key: "Badan Usaha",
    label: "Badan Usaha",
    color: "bg-amber-500 text-white",
  },
  { key: "Masjid", label: "Masjid", color: "bg-emerald-600 text-white" },
];

const activeTab = ref("Semua");
const search = ref("");

const filtered = computed(() => {
  let list = allUpz.value;
  if (activeTab.value !== "Semua") {
    list = list.filter((u) => u.tipe === activeTab.value);
  }
  if (search.value.trim()) {
    const q = search.value.toLowerCase();
    list = list.filter(
      (u) =>
        u.nama?.toLowerCase().includes(q) ||
        u.nama_ketua?.toLowerCase().includes(q),
    );
  }
  return list;
});

const countByTipe = (tipe) => {
  if (tipe === "Semua") return allUpz.value.length;
  return allUpz.value.filter((u) => u.tipe === tipe).length;
};

const badgeColor = (tipe) => {
  const map = {
    Dinas: "bg-blue-100 text-blue-700",
    "Badan Usaha": "bg-amber-100 text-amber-700",
    Masjid: "bg-emerald-100 text-emerald-700",
    Lembaga: "bg-purple-100 text-purple-700",
    Kecamatan: "bg-yellow-100 text-yellow-700",
  };
  return map[tipe] || "bg-slate-100 text-slate-600";
};
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 pb-20 space-y-8">
    <!-- Header -->
    <div class="text-center space-y-4">
      <h1
        class="text-xl md:text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none"
      >
        UPZ BAZNAS
      </h1>
      <div class="w-20 h-2 bg-[#fecb00] mx-auto rounded-sm"></div>
      <p
        class="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs"
      >
        Unit Pengumpul Zakat — Kabupaten Tangerang
      </p>
    </div>

    <!-- Loading Skeleton -->
    <div
      v-if="pending"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <div
        v-for="i in 9"
        :key="i"
        class="bg-white rounded-sm border border-slate-100 p-5 space-y-3 animate-pulse"
      >
        <div class="h-3 bg-slate-100 rounded w-1/3"></div>
        <div class="h-4 bg-slate-100 rounded w-3/4"></div>
        <div class="h-3 bg-slate-100 rounded w-1/2"></div>
      </div>
    </div>

    <template v-else>
      <!-- Tab Kelompok -->
      <div class="flex flex-wrap gap-2 align-center">
        <button
          v-for="k in kelompokList"
          :key="k.key"
          @click="activeTab = k.key"
          :class="
            activeTab === k.key
              ? k.color
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          "
          class="px-4 py-2 rounded-sm text-[10px] md:text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2"
        >
          {{ k.label }}
          <span
            class="text-[8px] font-black opacity-70 bg-black/10 px-1.5 py-0.5 rounded-sm"
          >
            {{ countByTipe(k.key) }}
          </span>
        </button>
      </div>

      <!-- Search Bar -->
      <div
        class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <p></p>
        <div class="relative w-full md:w-72">
          <svg
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
            />
          </svg>
          <input
            v-model="search"
            type="text"
            placeholder="Cari nama UPZ..."
            class="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-sm text-sm font-medium focus:outline-none focus:border-[#01803d] transition-colors"
          />
        </div>
      </div>

      <!-- Grid UPZ -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="upz in filtered"
          :key="upz.id"
          class="bg-white rounded-sm border border-slate-100 shadow-sm p-5 space-y-3 hover:shadow-md hover:border-slate-200 transition-all group"
        >
          <div class="flex items-start justify-between gap-2">
            <span
              :class="badgeColor(upz.tipe)"
              class="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm shrink-0"
            >
              {{ upz.tipe }}
            </span>
            <span
              v-if="upz.npwz"
              class="text-[12px] text-slate-400 font-mono truncate max-w-[140px]"
              >{{ upz.npwz }}</span
            >
          </div>

          <h3
            class="text-sm font-black text-slate-800 uppercase tracking-tight leading-tight group-hover:text-[#01803d] transition-colors"
          >
            {{ upz.nama }}
          </h3>

          <div
            v-if="upz.nama_ketua"
            class="flex items-center gap-2 text-[12px] text-slate-500 font-medium"
          >
            <svg
              class="w-3 h-3 text-slate-400 shrink-0"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
              />
            </svg>
            {{ upz.nama_ketua }}
          </div>

          <div
            v-if="upz.tgl_registrasi && upz.tgl_registrasi !== '1970-01-01'"
            class="flex items-center gap-2 text-[10px] text-slate-400 font-medium"
          >
            <svg
              class="w-3 h-3 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-width="2"
                stroke-linecap="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Terdaftar: {{ upz.tgl_registrasi }}
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filtered.length === 0" class="text-center py-20 space-y-4">
        <svg
          class="w-16 h-16 text-slate-200 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-width="1.5"
            stroke-linecap="round"
            d="M9.172 16.172a4 4 0 0 1 5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
          />
        </svg>
        <p class="text-slate-400 font-bold text-sm uppercase tracking-widest">
          Data tidak ditemukan
        </p>
      </div>
    </template>
  </div>
</template>
