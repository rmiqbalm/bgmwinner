<template>
  <div>
    <h2>Pembayaran Mitra</h2>

    <div class="card mb">
      <h3>Buat Pembayaran Baru</h3>
      <div class="toolbar">
        <select v-model="form.mitraId">
          <option :value="null" disabled>Pilih Mitra</option>
          <option v-for="m in mitras" :key="m.id" :value="m.id">{{ m.name }} ({{ m.phone }})</option>
        </select>
        <input v-model="form.dateFrom" type="date" />
        <span class="muted">s/d</span>
        <input v-model="form.dateTo" type="date" />
        <button @click="createPayment">Hitung & Buat</button>
      </div>
      <div v-if="formError" class="error">{{ formError }}</div>
      <p class="muted">Pembayaran = jumlah produk terjual dalam rentang tanggal x Rp 9.000 (bagian Mitra).</p>
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Mitra</th>
          <th>Periode</th>
          <th>Qty Terjual</th>
          <th>Total</th>
          <th>Status</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in payments" :key="p.id">
          <td>{{ p.id }}</td>
          <td>{{ p.mitra.name }}</td>
          <td>{{ p.dateFrom.slice(0, 10) }} s/d {{ p.dateTo.slice(0, 10) }}</td>
          <td>{{ p.totalQty }}</td>
          <td>Rp {{ rupiah(p.totalAmount) }}</td>
          <td>
            <span v-if="p.status === 'PAID'" class="badge green">Lunas</span>
            <span v-else class="badge amber">Belum</span>
          </td>
          <td>
            <button v-if="p.status !== 'PAID'" class="small success" @click="pay(p)">Tandai Lunas</button>
            <span v-else class="muted">{{ p.payer?.name }} - {{ fmt(p.paidAt) }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import client from '../../api/client'

const payments = ref([])
const mitras = ref([])
const formError = ref('')
const form = ref({ mitraId: null, dateFrom: '', dateTo: '' })

function rupiah(n) {
  return Number(n || 0).toLocaleString('id-ID')
}

function fmt(d) {
  return d ? new Date(d).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '-'
}

async function load() {
  const [p, u] = await Promise.all([
    client.get('/payments'),
    client.get('/users', { params: { role: 'MITRA' } })
  ])
  payments.value = p.payments
  mitras.value = u.users
}

onMounted(load)

async function createPayment() {
  formError.value = ''
  if (!form.value.mitraId || !form.value.dateFrom || !form.value.dateTo) {
    formError.value = 'Pilih Mitra dan rentang tanggal'
    return
  }
  try {
    await client.post('/payments', form.value)
    await load()
  } catch (e) {
    formError.value = e.response?.data?.error || 'Gagal membuat pembayaran'
  }
}

async function pay(p) {
  await client.post(`/payments/${p.id}/pay`)
  await load()
}
</script>
