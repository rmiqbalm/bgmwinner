<template>
  <div>
    <h2>Laporan Cashflow</h2>

    <div class="toolbar">
      <input v-model="from" type="date" />
      <span class="muted">s/d</span>
      <input v-model="to" type="date" />
      <button @click="load">Tampilkan</button>
    </div>

    <div v-if="summary" class="grid grid-4 mb">
      <div class="stat"><div class="label">Produk Terjual</div><div class="value">{{ summary.qty }}</div></div>
      <div class="stat"><div class="label">Cash In (Penjualan)</div><div class="value">Rp {{ rupiah(summary.cashIn) }}</div></div>
      <div class="stat"><div class="label">Bagian Mitra</div><div class="value">Rp {{ rupiah(summary.mitraShare) }}</div></div>
      <div class="stat"><div class="label">Pendapatan Jasa BGM</div><div class="value">Rp {{ rupiah(summary.bgmIncome) }}</div></div>
    </div>

    <div class="card mb">
      <h3>Rekap Harian</h3>
      <table>
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Qty</th>
            <th>Cash In</th>
            <th>Bagian Mitra</th>
            <th>Jasa BGM</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in byDay" :key="d.date">
            <td>{{ d.date }}</td>
            <td>{{ d.qty }}</td>
            <td>Rp {{ rupiah(d.revenue) }}</td>
            <td>Rp {{ rupiah(d.mitraShare) }}</td>
            <td>Rp {{ rupiah(d.bgmFee) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card">
      <h3>Rekap Bulanan</h3>
      <table>
        <thead>
          <tr>
            <th>Bulan</th>
            <th>Qty</th>
            <th>Cash In</th>
            <th>Bagian Mitra</th>
            <th>Jasa BGM</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in byMonth" :key="m.month">
            <td>{{ m.month }}</td>
            <td>{{ m.qty }}</td>
            <td>Rp {{ rupiah(m.revenue) }}</td>
            <td>Rp {{ rupiah(m.mitraShare) }}</td>
            <td>Rp {{ rupiah(m.bgmFee) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import client from '../../api/client'

const from = ref('')
const to = ref('')
const summary = ref(null)
const byDay = ref([])
const byMonth = ref([])

function rupiah(n) {
  return Number(n || 0).toLocaleString('id-ID')
}

async function load() {
  const data = await client.get('/reports/cashflow', { params: { from: from.value, to: to.value } })
  summary.value = data.summary
  byDay.value = data.byDay
  byMonth.value = data.byMonth
}

onMounted(() => {
  const now = new Date()
  from.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  to.value = now.toISOString().slice(0, 10)
  load()
})
</script>
