<template>
  <div>
    <div class="toolbar">
      <h2 style="margin: 0">Penjualan Lapak</h2>
    </div>

    <div class="toolbar">
      <input v-model="date" type="date" @change="load" />
      <select v-model="lapakId" @change="load">
        <option :value="null" disabled>Pilih Lapak</option>
        <option v-for="l in lapaks" :key="l.id" :value="l.id">{{ l.name }}</option>
      </select>
      <button @click="load">Muat Ulang</button>
      <span class="muted">Auto refresh tiap 10 detik</span>
    </div>

    <div v-if="!lapakId" class="card">
      <p class="muted">Silakan pilih lapak terlebih dahulu.</p>
    </div>

    <div v-else-if="deposits.length === 0" class="card">
      <p class="muted">Tidak ada setoran untuk lapak ini pada tanggal tersebut.</p>
    </div>

    <div v-for="d in deposits" :key="d.id" class="card mb">
      <div class="toolbar" style="justify-content: space-between">
        <h3 style="margin: 0">{{ d.mitra.name }}</h3>
        <div>
          <span v-if="d.status === 'CLOSED'" class="badge gray">Ditutup {{ fmt(d.closedAt) }}</span>
          <span v-else class="badge green">Buka</span>
          <button v-if="d.status === 'OPEN'" class="small" @click="openClosing(d)">Closing Lapak</button>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Produk</th>
            <th>Harga</th>
            <th>Masuk</th>
            <th>Terjual</th>
            <th>Sisa</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="it in d.items" :key="it.id">
            <td>{{ it.product.name }}</td>
            <td>Rp {{ rupiah(it.price) }}</td>
            <td>{{ it.initialQty }}</td>
            <td>{{ it.soldQty }}</td>
            <td class="stock-quantity">{{ it.remainingQty }}</td>
            <td>
              <button
                class="sell-btn"
                :disabled="d.status === 'CLOSED' || it.remainingQty <= 0"
                @click="sell(it, d)"
              >
                Terjual {{ it.remainingQty <= 0 ? '(Habis)' : '' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Closing modal -->
    <div v-if="closingDeposit" class="modal">
      <div class="modal-card card">
        <h3>Closing Setoran - {{ closingDeposit.mitra.name }}</h3>
        <p class="muted">Hitung ulang sisa stok fisik. Selisih akan dicatat sebagai terjual / penyesuaian.</p>
        <table>
          <thead>
            <tr><th>Produk</th><th>Terjual</th><th>Stok Sistem</th><th>Stok Fisik</th><th>Catatan</th></tr>
          </thead>
          <tbody>
            <tr v-for="it in closingDeposit.items" :key="it.id">
              <td>{{ it.product.name }}</td>
              <td>{{ it.soldQty }}</td>
              <td>{{ it.remainingQty }}</td>
              <td><input v-model.number="adjustments[it.id]" type="number" style="width: 80px" /></td>
              <td><input v-model="adjustNotes[it.id]" placeholder="opsional" style="width: 120px" /></td>
            </tr>
          </tbody>
        </table>
        <div class="toolbar mt">
          <button @click="doClose">Konfirmasi Closing</button>
          <button class="ghost" @click="closingDeposit = null">Batal</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import client from '../../api/client'

const lapaks = ref([])
const lapakId = ref(null)
const date = ref('')
const deposits = ref([])
const closingDeposit = ref(null)
const adjustments = ref({})
const adjustNotes = ref({})
let timer = null

function rupiah(n) {
  return Number(n || 0).toLocaleString('id-ID')
}

function fmt(d) {
  return d ? new Date(d).toLocaleString('id-ID', { timeStyle: 'short' }) : '-'
}

async function load() {
  if (!lapakId.value) return
  const data = await client.get('/deposits', { params: { date: date.value, lapakId: lapakId.value } })
  deposits.value = data.deposits
}

onMounted(async () => {
  const d = await client.get('/lapaks')
  lapaks.value = d.lapaks.filter((l) => l.status === 'ACTIVE')
  const today = new Date()
  date.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  timer = setInterval(load, 10000)
})

onUnmounted(() => clearInterval(timer))

async function sell(item, deposit) {
  await client.post(`/deposits/${deposit.id}/sell`, { itemId: item.id })
  await load()
}

function openClosing(d) {
  closingDeposit.value = d
  adjustments.value = {}
  adjustNotes.value = {}
  for (const it of d.items) adjustments.value[it.id] = it.remainingQty
}

async function doClose() {
  const adjustmentsArr = Object.keys(adjustments.value).map((itemId) => ({
    itemId: parseInt(itemId, 10),
    actualQty: adjustments.value[itemId],
    note: adjustNotes.value[itemId] || null
  }))
  await client.post(`/deposits/${closingDeposit.value.id}/close`, { adjustments: adjustmentsArr })
  closingDeposit.value = null
  await load()
}
</script>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}
.modal-card {
  width: 680px;
  max-height: 90vh;
  overflow-y: auto;
}
</style>
