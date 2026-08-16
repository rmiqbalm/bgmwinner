<template>
  <div>
    <h2>Setor Produk</h2>
    <p class="muted mb">Jam setoran setiap hari 05:00 - 06:00 di lapak yang Anda daftarkan.</p>

    <div v-if="!user" class="muted">Memuat...</div>

    <template v-else>
      <div class="card mb">
        <h3>Lapak Saya</h3>
        <div class="toolbar">
          <select v-model="selectedLapak" @change="loadProducts">
            <option :value="null" disabled>Pilih Lapak</option>
            <option v-for="ml in user.mitraLapaks" :key="ml.id" :value="ml.lapakId">
              {{ ml.lapak.name }}
            </option>
          </select>
        </div>
        <p v-if="user.mitraLapaks.length === 0" class="muted">
          Anda belum terdaftar di lapak mana pun. Hubungi admin.
        </p>
      </div>

      <div v-if="selectedLapak" class="card mb">
        <h3>Isi Produk</h3>
        <div v-if="products.length === 0" class="muted mb">
          Anda belum punya daftar produk. <button class="small ghost" @click="showAddProduct = true">+ Tambah Produk</button>
        </div>
        <table v-else>
          <thead>
            <tr>
              <th>Produk</th>
              <th>Harga</th>
              <th>Jumlah Setor</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in products" :key="p.id">
              <td>{{ p.name }} ({{ p.unit }})</td>
              <td>Rp {{ rupiah(p.price) }}</td>
              <td><input v-model.number="qtyMap[p.id]" type="number" min="1" style="width: 90px" /></td>
              <td>
                <button v-if="qtyMap[p.id] > 0" class="small success" @click="qtyMap[p.id] = 0">Reset</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="toolbar mt">
          <button class="small ghost" @click="showAddProduct = true">+ Tambah Produk</button>
          <button :disabled="products.length === 0" @click="submit">Simpan Setoran</button>
        </div>
        <div v-if="msg" class="success-msg">{{ msg }}</div>
        <div v-if="err" class="error">{{ err }}</div>
      </div>

      <!-- Add product modal -->
      <div v-if="showAddProduct" class="modal">
        <div class="modal-card card">
          <h3>Tambah Produk</h3>
          <div class="form-group">
            <label>Nama Produk</label>
            <input v-model="newProduct.name" style="width: 100%" />
          </div>
          <div class="form-group">
            <label>Satuan</label>
            <input v-model="newProduct.unit" placeholder="pcs / bungkus" style="width: 100%" />
          </div>
          <div class="form-group">
            <label>Harga Mitra (Rp)</label>
            <input v-model.number="newProduct.price" type="number" style="width: 100%" />
          </div>
          <div class="toolbar">
            <button @click="addProduct">Simpan Produk</button>
            <button class="ghost" @click="showAddProduct = false">Batal</button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import client from '../../api/client'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const user = ref(null)
const products = ref([])
const selectedLapak = ref(null)
const qtyMap = ref({})
const showAddProduct = ref(false)
const newProduct = ref({ name: '', unit: 'pcs', price: 9000 })
const msg = ref('')
const err = ref('')

function rupiah(n) {
  return Number(n || 0).toLocaleString('id-ID')
}

onMounted(async () => {
  user.value = (await client.get('/auth/me')).user
})

async function loadProducts() {
  qtyMap.value = {}
  const data = await client.get('/products')
  products.value = data.products
}

async function submit() {
  msg.value = ''
  err.value = ''
  const items = Object.entries(qtyMap.value)
    .filter(([, q]) => q > 0)
    .map(([productId, qty]) => ({ productId: parseInt(productId, 10), qty }))
  if (items.length === 0) {
    err.value = 'Isi minimal satu produk'
    return
  }
  try {
    await client.post('/deposits', { lapakId: selectedLapak.value, items })
    msg.value = 'Setoran berhasil disimpan. Stok hari ini bertambah.'
    qtyMap.value = {}
  } catch (e) {
    err.value = e.response?.data?.error || 'Gagal menyimpan setoran'
  }
}

async function addProduct() {
  if (!newProduct.value.name) return
  await client.post('/products', newProduct.value)
  showAddProduct.value = false
  newProduct.value = { name: '', unit: 'pcs', price: 9000 }
  await loadProducts()
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
  width: 400px;
}
</style>
