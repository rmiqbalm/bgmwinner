<template>
  <div>
    <h1 class="page-title">Selamat datang, {{ auth.user?.name }}</h1>
    <p class="page-sub">{{ today }} &middot; Ringkasan aktivitas BGM Winner hari ini.</p>

    <div v-if="loading" class="muted">Memuat...</div>

    <template v-else-if="data">
      <div class="grid grid-4 mb">
        <div v-for="(s, i) in statItems" :key="s.label" class="stat">
          <div class="stat-icon" :class="tones[i % tones.length]">
            <AppIcon :name="s.icon" />
          </div>
          <div>
            <div class="label">{{ s.label }}</div>
            <div class="value">{{ s.value }}</div>
          </div>
        </div>
      </div>

      <!-- ADMIN: daftar setoran hari ini -->
      <div v-if="auth.isAdmin" class="card">
        <h3>Setoran Hari Ini</h3>
        <DepositTable :deposits="todayDeposits" />
      </div>

      <!-- STAFF: lapak + aksi -->
      <div v-if="auth.isStaff" class="grid grid-2">
        <div class="card">
          <h3>Lapak Aktif</h3>
          <ul style="padding-left: 18px; line-height: 2">
            <li v-for="l in data.lapaks" :key="l.id">
              <b>{{ l.name }}</b> <span class="muted">- {{ l.location }}</span>
            </li>
          </ul>
          <router-link to="/app/staff/sales" class="btn-link">
            Buka Halaman Penjualan <AppIcon name="arrowRight" :size="14" />
          </router-link>
        </div>
        <div class="card">
          <h3>Info Hari Ini</h3>
          <table>
            <tbody>
              <tr><td>Total setoran</td><td><b>{{ data.summary.depositCount }}</b></td></tr>
              <tr><td>Stok awal</td><td><b>{{ data.summary.totalInitial }} pcs</b></td></tr>
              <tr><td>Terjual</td><td><b>{{ data.summary.totalSold }} pcs</b></td></tr>
              <tr><td>Sisa stok</td><td><b>{{ data.summary.remaining }} pcs</b></td></tr>
              <tr><td>Omzet</td><td><b>Rp {{ rupiah(data.summary.revenue) }}</b></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- MITRA -->
      <div v-if="auth.isMitra" class="grid grid-2">
        <div class="card">
          <h3>Produk Saya Hari Ini</h3>
          <div v-if="data.deposits.length === 0" class="muted">
            Belum ada setoran hari ini.
            <router-link to="/app/mitra/deposit">Setor produk sekarang</router-link>
          </div>
          <div v-for="d in data.deposits" :key="d.id" class="mb">
            <div class="toolbar" style="justify-content: space-between; margin-bottom: 8px">
              <b>{{ d.lapak.name }}</b>
              <span v-if="d.status === 'CLOSED'" class="badge gray">Ditutup</span>
              <span v-else class="badge green">Buka</span>
            </div>
            <table>
              <thead><tr><th>Produk</th><th>Masuk</th><th>Terjual</th><th>Sisa</th></tr></thead>
              <tbody>
                <tr v-for="it in d.items" :key="it.id">
                  <td>{{ it.product?.name }}</td>
                  <td>{{ it.initialQty }}</td>
                  <td>{{ it.soldQty }}</td>
                  <td>{{ it.remainingQty }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <div class="card mb">
            <h3>Status Saya</h3>
            <p>
              <span v-if="data.summary.leaveToday" class="badge amber">Libur hari ini</span>
              <span v-else class="badge green">Aktif hari ini</span>
            </p>
            <p class="muted">Estimasi pendapatan hari ini</p>
            <div style="font-size: 22px; font-weight: 800; color: var(--primary-2)">
              Rp {{ rupiah(data.summary.estimatedIncome) }}
            </div>
          </div>
          <div class="card">
            <h3>Aksi Cepat</h3>
            <div class="toolbar" style="gap: 8px">
              <router-link to="/app/mitra/deposit"><button class="small">Setor Produk</button></router-link>
              <router-link to="/app/mitra/stocks"><button class="small ghost">Cek Stok Saya</button></router-link>
              <router-link to="/app/mitra/leave"><button class="small ghost">Form Libur</button></router-link>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import client from '../api/client'
import { useAuthStore } from '../stores/auth'
import DepositTable from '../components/DepositTable.vue'
import AppIcon from '../components/AppIcon.vue'

const auth = useAuthStore()
const data = ref(null)
const loading = ref(true)
const todayDeposits = ref([])

const tones = ['tone-red', 'tone-green', 'tone-amber', 'tone-blue', 'tone-slate']

const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

function rupiah(n) {
  return Number(n || 0).toLocaleString('id-ID')
}

const statItems = computed(() => {
  if (!data.value) return []
  const s = data.value.summary
  if (auth.isAdmin) {
    return [
      { icon: 'box', label: 'Setoran Hari Ini', value: s.depositCount },
      { icon: 'tag', label: 'Produk Terjual', value: s.totalSold + ' pcs' },
      { icon: 'cashflow', label: 'Omzet Hari Ini', value: 'Rp ' + rupiah(s.revenue) },
      { icon: 'wallet', label: 'Jasa BGM', value: 'Rp ' + rupiah(s.bgmIncome) },
      { icon: 'users', label: 'Mitra Aktif', value: s.activeMitras },
      { icon: 'store', label: 'Lapak Aktif', value: s.activeLapaks },
      { icon: 'calendar', label: 'Mitra Libur', value: s.leaveCountToday },
      { icon: 'note', label: 'Total Produk', value: s.totalProducts }
    ]
  }
  if (auth.isStaff) {
    return [
      { icon: 'box', label: 'Setoran Hari Ini', value: s.depositCount },
      { icon: 'tag', label: 'Produk Terjual', value: s.totalSold + ' pcs' },
      { icon: 'eye', label: 'Sisa Stok', value: s.remaining + ' pcs' },
      { icon: 'cashflow', label: 'Omzet', value: 'Rp ' + rupiah(s.revenue) }
    ]
  }
  return [
    { icon: 'box', label: 'Setoran Hari Ini', value: s.depositCount },
    { icon: 'tag', label: 'Produk Terjual', value: s.totalSold + ' pcs' },
    { icon: 'cashflow', label: 'Estimasi Pendapatan', value: 'Rp ' + rupiah(s.estimatedIncome) },
    { icon: 'note', label: 'Produk Terdaftar', value: s.productCount }
  ]
})

onMounted(async () => {
  try {
    const d = await client.get('/dashboard')
    data.value = d
    if (auth.isAdmin) {
      const res = await client.get('/deposits')
      todayDeposits.value = res.deposits
    }
  } finally {
    loading.value = false
  }
})
</script>
