<template>
  <div>
    <h2>Kelola Setoran</h2>

    <div class="card mb">
      <h3>Input Setoran (atas nama Mitra)</h3>
      <div class="toolbar">
        <select v-model="form.lapakId">
          <option :value="null" disabled>Pilih Lapak</option>
          <option v-for="l in lapaks" :key="l.id" :value="l.id">{{ l.name }}</option>
        </select>
        <select v-model="form.mitraId" @change="loadMitraProducts">
          <option :value="null" disabled>Pilih Mitra</option>
          <option v-for="m in mitras" :key="m.id" :value="m.id">{{ m.name }} ({{ m.phone }})</option>
        </select>
      </div>

      <table v-if="form.mitraId">
        <thead>
          <tr>
            <th>Produk</th>
            <th>Harga</th>
            <th>Jumlah</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in mitraProducts" :key="p.id">
            <td>{{ p.name }} ({{ p.unit }})</td>
            <td>Rp {{ rupiah(p.price) }}</td>
            <td><input v-model.number="qtyMap[p.id]" type="number" min="1" style="width: 80px" /></td>
            <td>
              <button v-if="qtyMap[p.id] > 0" class="small success" @click="qtyMap[p.id] = 0">Reset</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="toolbar mt">
        <button :disabled="!form.lapakId || !form.mitraId" @click="submit">Simpan Setoran</button>
      </div>
      <div v-if="msg" class="success-msg">{{ msg }}</div>
      <div v-if="err" class="error">{{ err }}</div>
    </div>

    <h3 class="mb">Setoran Hari Ini</h3>
    <div class="toolbar">
      <input v-model="date" type="date" @change="load" />
    </div>
    <table>
      <thead>
        <tr>
          <th>Lapak</th>
          <th>Mitra</th>
          <th>Produk</th>
          <th>Masuk</th>
          <th>Terjual</th>
          <th>Sisa</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="d in deposits" :key="d.id">
          <tr v-for="it in d.items" :key="it.id">
            <td>{{ d.lapak.name }}</td>
            <td>{{ d.mitra.name }}</td>
            <td>{{ it.product?.name }}</td>
            <td>{{ it.initialQty }}</td>
            <td>{{ it.soldQty }}</td>
            <td>{{ it.remainingQty }}</td>
            <td>
              <span v-if="d.status === 'CLOSED'" class="badge gray">Ditutup</span>
              <span v-else class="badge green">Buka</span>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import client from '../../api/client'

const lapaks = ref([])
const mitras = ref([])
const mitraProducts = ref([])
const deposits = ref([])
const date = ref('')
const qtyMap = ref({})
const msg = ref('')
const err = ref('')
const form = ref({ lapakId: null, mitraId: null })

function rupiah(n) {
  return Number(n || 0).toLocaleString('id-ID')
}

async function load() {
  const params = {}
  if (date.value) params.date = date.value
  const data = await client.get('/deposits', { params })
  deposits.value = data.deposits
}

onMounted(async () => {
  const [d, u] = await Promise.all([
    client.get('/lapaks'),
    client.get('/users', { params: { role: 'MITRA' } })
  ])
  lapaks.value = d.lapaks.filter((l) => l.status === 'ACTIVE')
  mitras.value = u.users.filter((m) => m.status === 'ACTIVE')
  const today = new Date()
  date.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  await load()
})

async function loadMitraProducts() {
  qtyMap.value = {}
  const data = await client.get('/products', { params: { mitraId: form.value.mitraId } })
  mitraProducts.value = data.products
}

async function submit() {
  msg.value = ''
  err.value = ''
  const items = Object.entries(qtyMap.value)
    .filter(([, q]) => q > 0)
    .map(([productId, qty]) => ({ productId: parseInt(productId, 10), qty }))
  if (items.length === 0) {
    err.value = 'Minimal isi satu produk'
    return
  }
  try {
    await client.post('/deposits', { lapakId: form.value.lapakId, mitraId: form.value.mitraId, items })
    msg.value = 'Setoran berhasil disimpan'
    qtyMap.value = {}
    await load()
  } catch (e) {
    err.value = e.response?.data?.error || 'Gagal menyimpan setoran'
  }
}
</script>
