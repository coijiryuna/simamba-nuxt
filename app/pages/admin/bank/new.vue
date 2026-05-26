<script setup>
definePageMeta({
    layout: 'admin'
})

import {
    ArrowLeft,
    Save,
    Image as ImageIcon,
    X,
    Upload
} from 'lucide-vue-next'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const type = route.query.type || 'post'

// Form State
const form = reactive({
    bank_name:'',
    bank_account_number:'',
    bank_account_name:'',
    bank_logo:null,
})
const imagePreview = ref(null)
// Handle Image Change
const onFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
        form.bank_logo = file
        imagePreview.value = URL.createObjectURL(file)
    }
}
// Submit Form
const loading = ref(false)
const submit = async () => {
    if (!form.bank_name || !form.bank_account_number || !form.bank_account_name) {
        Swal.fire('Oops!', 'Semua field wajib diisi!', 'warning')
        return
    }

    loading.value = true
    const formData = new FormData()
    formData.append('bank_name', form.bank_name)
    formData.append('bank_account_number', form.bank_account_number)
    formData.append('bank_account_name', form.bank_account_name)
    if (form.bank_logo) {
        formData.append('bank_logo', form.bank_logo)
    }

    try {
        await $fetch('/api/v1/bank', {
            method: 'POST',
            body: formData
        })
        Swal.fire('Sukses!', 'Bank berhasil ditambahkan.', 'success')
        router.push('/admin/bank')
    } catch (error) {
        Swal.fire('Error!', error.message || 'Terjadi kesalahan.', 'error')
    } finally {
        loading.value = false
    }
}
</script>
<template>
    <div>
        <div class="flex items-center gap-4 mb-8">
            <NuxtLink to="/admin/bank" class="p-2 hover:bg-white rounded-sm border border-slate-200 text-slate-500">
                <ArrowLeft class="w-5 h-5" />
            </NuxtLink>
            <div>
                <h1 class="text-2xl font-bold text-slate-800">Buat Data Bank dan Rekening Baru</h1>
                <p class="text-sm text-slate-500">Tuliskan informasi terbaru untuk disebarkan ke publik.</p>
            </div>
        </div>
        <!-- // Form -->
        <form @submit.prevent="submit" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Main Content Area -->
            <div class="lg:col-span-2 space-y-6">
                <div class="bg-white p-6 border border-slate-200 rounded-sm shadow-sm"> 
                    <div class="mb-6">
                        <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Nama Bank</label>
                        <input v-model="form.bank_name" type="text" placeholder="Masukkan nama bank di sini..."
                            class="w-full text-xl font-bold bg-slate-50 border border-slate-200 rounded-sm py-3 px-4 text-slate-800 outline-none focus:border-emerald-600 transition-all" />
                    </div>
                    <div class="mb-6">
                        <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Nomor Rekening</label>
                        <input v-model="form.bank_account_number" type="text" placeholder="Masukkan nomor rekening di sini..."
                            class="w-full text-xl font-bold bg-slate-50 border border-slate-200 rounded-sm py-3 px-4 text-slate-800 outline-none focus:border-emerald-600 transition-all" />
                    </div>
                    <div class="mb-6">
                        <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Nama Pemilik Rekening</label>
                        <input v-model="form.bank_account_name" type="text" placeholder="Masukkan nama pemilik rekening di sini..."
                            class="w-full text-xl font-bold bg-slate-50 border border-slate-200 rounded-sm py-3 px-4 text-slate-800 outline-none focus:border-emerald-600 transition-all" />
                    </div>
        
                </div>
            </div>
            <!-- Sidebar -->
            <div class="space-y-4">
                <div class="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
                    <div class="px-4 py-3 bg-slate-50 border-b border-slate-200">
                        <h3 class="text-xs font-black uppercase tracking-widest text-slate-800">Logo Bank</h3>
                    </div>
                    <div class="p-4">
                        <div v-if="imagePreview" class="relative mb-4 group">
                            <img :src="imagePreview"
                                class="w-full aspect-video object-cover rounded-sm border border-slate-200 shadow-sm" />
                            <button @click="imagePreview = null; form.bank_logo = null"
                                class="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-sm shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                <X class="w-4 h-4" />
                            </button>
                        </div>
                        <div v-else
                            class="border-2 border-dashed border-slate-200 rounded-sm p-8 text-center hover:border-emerald-400 transition-colors group cursor-pointer relative">
                            <input type="file" @change="onFileChange" accept="image/*"
                                class="absolute inset-0 opacity-0 cursor-pointer" />
                            <Upload class="w-8 h-8 text-slate-300 mx-auto mb-2 group-hover:text-emerald-500" />
                            <p
                                class="text-xs font-bold text-slate-400 group-hover:text-emerald-600 uppercase tracking-widest">
                                Klik untuk Upload</p>
                        </div>
                    </div>
                </div>
                <button type="submit" :disabled="loading"
                    class="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-3 rounded-sm font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 disabled:bg-slate-400">
                    <Save v-if="!loading" class="w-4 h-4" />
                    <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {{ loading ? 'Menyimpan...' : 'Simpan & Publikasikan' }}
                </button>
            </div>
        </form>
    </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e2e8f0;
}
</style>