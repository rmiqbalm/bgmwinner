<template>
  <div class="page">
    <div class="page-head">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="pub-container-inner">
        <span class="page-tag">Pemantauan Stok</span>
        <h1>Stok Produk</h1>
        <p>
          Daftar produk yang masih tersedia di lapak BGM Winner hari ini. Produk yang habis otomatis
          tidak ditampilkan.
        </p>
      </div>
    </div>

    <div class="pub-container-inner page-body">
      <div class="toolbar">
        <input v-model="date" type="date" @change="load" />
        <select v-model="lapakId" @change="load">
          <option :value="null">Semua Lapak</option>
          <option v-for="l in lapaks" :key="l.id" :value="l.id">{{ l.name }}</option>
        </select>
        <button @click="load">Muat Ulang</button>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Produk</th>
              <th>Lapak</th>
              <th>Mitra</th>
              <th>Harga</th>
              <th>Sisa Stok</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in stocks" :key="s.id">
              <td>
                <div class="prod-name">{{ s.product.name }}</div>
                <div class="muted">{{ s.product.unit }}</div>
              </td>
              <td>{{ s.lapak.name }}</td>
              <td>{{ s.mitra.name }}</td>
              <td>Rp {{ rupiah(s.product.price) }}</td>
              <td><span class="badge green">{{ s.remainingQty }} {{ s.product.unit }}</span></td>
            </tr>
          </tbody>
        </table>
        <div v-if="loading" class="empty">Memuat...</div>
        <div v-else-if="stocks.length === 0" class="empty">
          Tidak ada produk dengan stok tersedia pada tanggal tersebut.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import client from '../api/client'

const stocks = ref([])
const lapaks = ref([])
const date = ref('')
const lapakId = ref(null)
const loading = ref(true)

function rupiah(n) {
  return Number(n || 0).toLocaleString('id-ID')
}

async function load() {
  loading.value = true
  const params = {}
  if (date.value) params.date = date.value
  if (lapakId.value) params.lapakId = lapakId.value
  try {
    const data = await client.get('/stocks', { params })
    stocks.value = data.stocks
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  const today = new Date()
  date.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const d = await client.get('/lapaks')
  lapaks.value = d.lapaks.filter((l) => l.status === 'ACTIVE')
  await load()
})
</script>

<style scoped>
.page {
  padding-bottom: 48px;
}

.page-head {
  background: var(--pagehead-bg);
  color: var(--text);
  padding: 52px 0;
  position: relative;
  overflow: hidden;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: var(--orb-opacity);
  pointer-events: none;
}

.orb-1 {
  width: 360px;
  height: 360px;
  top: -140px;
  right: -80px;
  background: radial-gradient(circle, #e6212a, transparent 70%);
}

.orb-2 {
  width: 300px;
  height: 300px;
  bottom: -150px;
  left: -80px;
  background: radial-gradient(circle, #c0141c, transparent 70%);
}

.pub-container-inner {
  max-width: 1160px;
  margin: 0 auto;
  padding: 0 24px;
  position: relative;
  z-index: 1;
}

.page-tag {
  display: inline-block;
  background: var(--primary-soft);
  border: 1px solid rgba(230, 33, 42, 0.3);
  color: var(--primary-2);
  padding: 5px 13px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  margin-bottom: 14px;
}

.page-head h1 {
  margin: 0 0 10px;
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.page-head p {
  margin: 0;
  color: var(--muted);
  font-size: 15px;
  max-width: 560px;
  line-height: 1.7;
}

.page-body {
  padding-top: 28px;
}

.table-wrap {
  overflow-x: auto;
}

.prod-name {
  font-weight: 700;
}

.empty {
  padding: 48px 20px;
  text-align: center;
  color: var(--muted);
  background: var(--surface);
  border: var(--empty-border);
  border-radius: var(--radius);
  margin-top: 4px;
}
</style>
