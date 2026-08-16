<template>
  <div>
    <h2>Laporan Saya</h2>
    <p class="muted mb">Rekap penjualan dan estimasi pendapatan produk Anda.</p>

    <div class="toolbar">
      <input v-model="from" type="date" />
      <span class="muted">s/d</span>
      <input v-model="to" type="date" />
      <button @click="load">Tampilkan</button>
    </div>

    <div v-if="stockData" class="grid grid-3 mb">
      <div class="stat"><div class="label">Total Stok Masuk</div><div class="value">{{ stockData.summary.totalIn }}</div></div>
      <div class="stat"><div class="label">Total Terjual</div><div class="value">{{ stockData.summary.totalOut }}</div></div>
      <div class="stat"><div class="label">Estimasi Pendapatan</div><div class="value">Rp {{ rupiah(cashData?.summary?.mitraShare || 0) }}</div></div>
    </div>

    <div class="card mb">
      <h3>Detail Produk Terjual</h3>
      <table>
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Lapak</th>
            <th>Produk</th>
            <th>Masuk</th>
            <th>Terjual</th>
            <th>Sisa</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r, i) in rows" :key="i">
            <td>{{ r.date }}</td>
            <td>{{ r.lapak }}</td>
            <td>{{ r.product }}</td>
            <td>{{ r.stockIn }}</td>
            <td>{{ r.sold }}</td>
            <td>{{ r.remaining }}</td>
          </tr>
        </tbody>
      </table>
      <p v-if="rows.length === 0" class="muted">Belum ada data.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import client from '../../api/client'

const from = ref('')
const to = ref('')
const rows = ref([])
const stockData = ref(null)
const cashData = ref(null)

function rupiah(n) {
  return Number(n || 0).toLocaleString('id-ID')
}

async function load() {
  const params = { from: from.value, to: to.value }
  stockData.value = await client.get('/reports/stock', { params })
  rows.value = stockData.value.rows
  cashData.value = await client.get('/reports/cashflow', { params })
}

onMounted(() => {
  const now = new Date()
  from.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  to.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  load()
})
</script>
