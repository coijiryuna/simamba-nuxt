<script setup>
definePageMeta({
  layout: 'admin'
})

const columns = [
  { id: 'created_at', header: 'Tanggal' },
  { id: 'donor_name', header: 'Donatur' },
  { id: 'campaign_title', header: 'Program' },
  { id: 'amount', header: 'Nominal' },
  { id: 'payment_type', header: 'Metode' },
  { id: 'transaction_status', header: 'Status' },
  { id: 'actions', header: '' }
]

const page = ref(1)
const search = ref('')
const statusFilter = ref('')

const donationsList = ref([])
const totalDonations = ref(0)
const pending = ref(false)

const fetchDonations = async () => {
  pending.value = true
  try {
    const res = await $fetch('/api/v1/donations', {
      query: {
        page: page.value,
        search: search.value,
        status: statusFilter.value
      }
    })
    donationsList.value = res.data || []
    totalDonations.value = res.total || 0
  } catch (error) {
    console.error('Fetch error:', error)
  } finally {
    pending.value = false
  }
}

onMounted(() => {
  fetchDonations()
})

watch([page, search, statusFilter], () => {
  fetchDonations()
})

const getStatusColorClass = (status) => {
  switch (status) {
    case 'settlement': return 'text-emerald-600 bg-emerald-50 border-emerald-100'
    case 'pending': return 'text-amber-600 bg-amber-50 border-amber-100'
    default: return 'text-slate-500 bg-slate-50 border-slate-100'
  }
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

// Modal for details
const isDetailOpen = ref(false)
const selectedDonation = ref(null)

const openDetail = (donation) => {
  selectedDonation.value = donation
  isDetailOpen.value = true
}
</script>

<template>
  <div class="p-4 md:p-8">
    <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Data Donasi</h1>
        <p class="text-gray-500">Kelola dan pantau seluruh transaksi donasi masuk.</p>
      </div>
    </div>

    <div class="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
      <div class="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <div class="flex gap-4 items-center">
          <input 
            v-model="search" 
            type="text" 
            placeholder="Cari donatur..." 
            class="px-3 py-1.5 text-sm border border-slate-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 w-64"
          >
          <select 
            v-model="statusFilter" 
            class="px-3 py-1.5 text-sm border border-slate-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">Semua Status</option>
            <option value="settlement">Berhasil</option>
            <option value="pending">Tertunda</option>
            <option value="expire">Kadaluarsa</option>
          </select>
        </div>
        <button 
          @click="fetchDonations" 
          :disabled="pending"
          class="px-4 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-sm text-sm hover:bg-slate-50 transition-all flex items-center gap-2"
        >
          <span v-if="pending" class="animate-spin text-emerald-600">↻</span>
          Refresh
        </button>
      </div>

      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-slate-50 border-b border-slate-200">
            <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal</th>
            <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Donatur</th>
            <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Program</th>
            <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nominal</th>
            <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
            <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-if="donationsList.length === 0 && !pending">
            <td colspan="6" class="px-6 py-12 text-center text-slate-400 italic">Tidak ada data ditemukan</td>
          </tr>
          <tr v-for="row in donationsList" :key="row.id" class="hover:bg-slate-50/50 transition-all group">
            <td class="px-6 py-4 text-xs text-slate-500">
              {{ formatDate(row.created_at) }}
            </td>
            <td class="px-6 py-4">
              <div class="flex flex-col">
                <span class="text-sm font-bold text-slate-800">{{ row.donor_display_name }}</span>
                <span class="text-[10px] text-slate-400">{{ row.donor_display_email }}</span>
              </div>
            </td>
            <td class="px-6 py-4">
              <span class="text-xs text-slate-600 line-clamp-1">{{ row.campaign_title }}</span>
            </td>
            <td class="px-6 py-4">
              <span class="text-sm font-black text-emerald-600">{{ formatCurrency(row.amount) }}</span>
            </td>
            <td class="px-6 py-4">
              <span :class="getStatusColorClass(row.transaction_status)" class="text-[9px] font-black uppercase px-2 py-0.5 rounded-full border">
                {{ row.transaction_status }}
              </span>
            </td>
            <td class="px-6 py-4 text-right">
              <button @click="openDetail(row)" class="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-sm transition-all">
                👁
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="px-6 py-4 border-t border-slate-100 flex justify-center">
        <div class="flex gap-2">
          <button @click="page--" :disabled="page <= 1" class="px-3 py-1 border border-slate-200 rounded disabled:opacity-30">«</button>
          <span class="px-4 py-1 bg-slate-50 text-sm font-bold">{{ page }}</span>
          <button @click="page++" :disabled="donationsList.length < 20" class="px-3 py-1 border border-slate-200 rounded disabled:opacity-30">»</button>
        </div>
      </div>
    </div>

    <!-- Detail Modal (Manual Tailwind) -->
    <div v-if="isDetailOpen && selectedDonation" class="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="isDetailOpen = false"></div>
      
      <!-- Modal Content -->
      <div class="relative bg-white rounded-xl shadow-2xl max-w-3xl max-h-[90vh] overflow-y-auto w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <div class="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 class="text-lg font-bold text-slate-800">Detail Transaksi</h3>
          <button @click="isDetailOpen = false" class="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            ✕
          </button>
        </div>

        <div class="p-6 space-y-5">
          <div class="grid grid-cols-2 gap-6">
            <div>
              <p class="text-[10px] text-slate-400 uppercase font-black tracking-wider">Order ID</p>
              <p class="font-mono text-sm font-bold text-slate-700">{{ selectedDonation.midtrans_order_id }}</p>
            </div>
            <div>
              <p class="text-[10px] text-slate-400 uppercase font-black tracking-wider">Status</p>
              <span :class="getStatusColorClass(selectedDonation.transaction_status)" class="text-[10px] font-black uppercase px-3 py-1 rounded-full border inline-block">
                {{ selectedDonation.transaction_status }}
              </span>
            </div>
          </div>

          <div class="h-px bg-slate-100"></div>

          <div>
            <p class="text-[10px] text-slate-400 uppercase font-black tracking-wider mb-2">Informasi Donatur</p>
            <div class="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-2 text-sm text-slate-600">
              <p><span class="font-bold text-slate-400 inline-block w-16">Nama:</span> <span class="text-slate-800 font-semibold">{{ selectedDonation.donor_display_name }}</span></p>
              <p><span class="font-bold text-slate-400 inline-block w-16">Email:</span> {{ selectedDonation.donor_display_email }}</p>
              <p><span class="font-bold text-slate-400 inline-block w-16">Phone:</span> {{ selectedDonation.donor_phone }}</p>
              <p><span class="font-bold text-slate-400 inline-block w-16 text-[11px]">Alamat:</span> {{ selectedDonation.donor_address }}</p>
            </div>
          </div>

          <div>
            <p class="text-[10px] text-slate-400 uppercase font-black tracking-wider mb-2">Pesan / Doa</p>
            <div class="italic text-slate-700 bg-emerald-50/50 p-4 rounded-lg border border-emerald-100 text-sm leading-relaxed">
              "{{ selectedDonation.message || 'Tidak ada pesan' }}"
            </div>
          </div>

          <div class="bg-emerald-600 text-white p-5 rounded-xl flex justify-between items-center shadow-lg shadow-emerald-200">
            <span class="text-sm font-medium opacity-90">Total Donasi</span>
            <span class="text-2xl font-black">{{ formatCurrency(selectedDonation.amount) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
