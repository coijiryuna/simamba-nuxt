<script setup>
// Ambil data bank dari API
const search = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)

const { data: bankData, pending, refresh } = await useFetch('/api/v1/bank', {
    query: computed(() => ({
        search: search.value,
        page: currentPage.value,
        limit: itemsPerPage.value
    }))
})
</script>
<template>
    <div class="bg-slate-50 rounded-sm border border-slate-100">
        <!-- Tampilkan rekening bank sebagai sidebar -->
         <div class="bg-green-700 mb-3">
        <h2 class=" p-3 text-sm font-bold text-white mb-4">Rekening Zakat, Infaq dan Sedekah BAZNAS</h2>
        </div>
        <ul class="space-y-4 p-3">
            <li v-for="bank in bankData?.data" :key="bank.ID" class="flex items-center gap-4">
                <img :src="bank.bank_logo_url" alt="" class="w-12 h-12 object-cover rounded-full">
                <div>
                    <p class="font-semibold">{{ bank.bank_name }}</p>
                    <p>{{ bank.bank_account_number }}</p>
                    <small  class="text-xs text-green-900">{{ bank.bank_account_name }}</small>
                </div>
            </li>
            <hr>
        </ul>
    </div>
</template>