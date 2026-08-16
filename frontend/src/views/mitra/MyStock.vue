<template>
  <div>
    <h2>Stok Produk Saya</h2>
    <p class="muted mb">Menampilkan produk yang masih tersedia (stok &gt; 0). Produk yang habis otomatis tidak ditampilkan.</p>

    <div class="toolbar">
      <input v-model="date" type="date" @change="load" />
      <button @click="load">Muat Ulang</button>
    </div>

    <div v-if="stocks.length === 0" class="card">
      <p class="muted">Tidak ada produk dengan stok tersedia.</p>
    </div>

    <div v-for="s in stocks" :key="s.id" class="card mb">
      <div class="toolbar" style="justify-content: space-between">
        <div>
          <b>{{ s.product.name }}</b>
          <span class="muted"> - {{ s.lapak.name }} ({{ s.date }})</span>
        </div>
        <div class="stock-quantity">{{ s.remainingQty }} <span class="muted" style="font-size: 14px">{{ s.product.unit }}</span></div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Stok Masuk</th>
            <th>Terjual</th>
            <th>Sisa</th>
            <th>Harga</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{{ s.initialQty }}</td>
            <td>{{ s.soldQty }}</td>
            <td>{{ s.remainingQty }}</td>
            <td>Rp {{ rupiah(s.product.price) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import client from '../../api/client'

const stocks = ref([])
const date = ref('')

function rupiah(n) {
  return Number(n || 0).toLocaleString('id-ID')
}

async function load() {
  const params = {}
  if (date.value) params.date = date.value
  const data = await client.get('/stocks', { params })
  stocks.value = data.stocks
}

onMounted(() => {
  const today = new Date()
  date.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  load()
})
</script>
