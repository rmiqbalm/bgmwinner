<template>
  <div>
    <h2>Laporan Stok IN/OUT</h2>

    <div class="toolbar">
      <input v-model="from" type="date" />
      <span class="muted">s/d</span>
      <input v-model="to" type="date" />
      <button @click="load">Tampilkan</button>
      <a v-if="rows.length" :href="exportUrl" class="btn-link">Export CSV</a>
    </div>

    <div v-if="summary" class="grid grid-4 mb">
      <div class="stat"><div class="label">Total Stok Masuk</div><div class="value">{{ summary.totalIn }}</div></div>
      <div class="stat"><div class="label">Total Terjual</div><div class="value">{{ summary.totalOut }}</div></div>
      <div class="stat"><div class="label">Total Sisa</div><div class="value">{{ summary.totalRemaining }}</div></div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Tanggal</th>
          <th>Lapak</th>
          <th>Mitra</th>
          <th>Produk</th>
          <th>Harga</th>
          <th>Stok Masuk</th>
          <th>Terjual</th>
          <th>Sisa</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(r, i) in rows" :key="i">
          <td>{{ r.date }}</td>
          <td>{{ r.lapak }}</td>
          <td>{{ r.mitra }}</td>
          <td>{{ r.product }} ({{ r.unit }})</td>
          <td>Rp {{ rupiah(r.price) }}</td>
          <td>{{ r.stockIn }}</td>
          <td>{{ r.sold }}</td>
          <td>{{ r.remaining }}</td>
          <td>
            <span v-if="r.status === 'CLOSED'" class="badge gray">Ditutup</span>
            <span v-else class="badge green">Buka</span>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-if="rows.length === 0" class="muted">Belum ada data.</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import client from '../../api/client'

const from = ref('')
const to = ref('')
const rows = ref([])
const summary = ref(null)

function rupiah(n) {
  return Number(n || 0).toLocaleString('id-ID')
}

const exportUrl = computed(() => {
  return `/api/reports/stock/export?from=${from.value}&to=${to.value}`
})

async function load() {
  const data = await client.get('/reports/stock', { params: { from: from.value, to: to.value } })
  rows.value = data.rows
  summary.value = data.summary
}

onMounted(() => {
  const today = new Date().toISOString().slice(0, 10)
  from.value = today
  to.value = today
  load()
})
</script>

<style scoped>
.btn-link {
  color: var(--primary);
  font-weight: 600;
  text-decoration: none;
}
</style>
