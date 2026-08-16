<template>
  <div>
    <h2>Kelola Pengguna</h2>

    <div class="toolbar">
      <select v-model="roleFilter" @change="load">
        <option value="">Semua Role</option>
        <option value="ADMIN">Admin</option>
        <option value="STAFF">Staff</option>
        <option value="MITRA">Mitra</option>
      </select>
      <input v-model="search" placeholder="Cari nama / HP" @keyup.enter="load" />
      <button class="ghost small" @click="load">Cari</button>
      <button @click="openCreate">+ Tambah Pengguna</button>
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Nama</th>
          <th>No. HP</th>
          <th>Role</th>
          <th>Status</th>
          <th>Lapak / Produk</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in users" :key="u.id">
          <td>{{ u.id }}</td>
          <td>{{ u.name }}</td>
          <td>{{ u.phone }}</td>
          <td>
            <span class="badge blue">{{ roleName(u.role) }}</span>
          </td>
          <td>
            <span v-if="u.status === 'ACTIVE'" class="badge green">Aktif</span>
            <span v-else class="badge red">Nonaktif</span>
          </td>
          <td>
            <span v-if="u.role === 'MITRA'">{{ u._count.mitraLapaks }} lapak / {{ u._count.products }} produk</span>
            <span v-else class="muted">-</span>
          </td>
          <td>
            <button class="small ghost" @click="openEdit(u)">Edit</button>
            <button v-if="u.role === 'MITRA'" class="small ghost" @click="openLapaks(u)">Lapak</button>
            <button class="small" :class="u.status === 'ACTIVE' ? 'danger' : 'success'" @click="toggleStatus(u)">
              {{ u.status === 'ACTIVE' ? 'Nonaktifkan' : 'Aktifkan' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal create/edit -->
    <div v-if="showForm" class="modal">
      <div class="modal-card card">
        <h3>{{ editing ? 'Edit Pengguna' : 'Tambah Pengguna' }}</h3>
        <div v-if="formError" class="error">{{ formError }}</div>
        <div class="form-group">
          <label>Nama</label>
          <input v-model="form.name" style="width: 100%" />
        </div>
        <div class="form-group">
          <label>No. HP</label>
          <input v-model="form.phone" style="width: 100%" />
        </div>
        <div class="form-group">
          <label>Alamat</label>
          <input v-model="form.address" style="width: 100%" />
        </div>
        <div class="form-group">
          <label>Role</label>
          <select v-model="form.role" style="width: 100%">
            <option value="ADMIN">Admin</option>
            <option value="STAFF">Staff</option>
            <option value="MITRA">Mitra</option>
          </select>
        </div>
        <div class="form-group">
          <label>Password {{ editing ? '(kosongkan jika tidak diubah)' : '' }}</label>
          <input v-model="form.password" type="password" style="width: 100%" />
        </div>
        <div class="toolbar">
          <button @click="save">Simpan</button>
          <button class="ghost" @click="showForm = false">Batal</button>
        </div>
      </div>
    </div>

    <!-- Modal lapak assignment -->
    <div v-if="showLapakForm" class="modal">
      <div class="modal-card card">
        <h3>Pilih Lapak untuk {{ lapakTarget?.name }}</h3>
        <label v-for="l in lapaks" :key="l.id" class="check-item">
          <input type="checkbox" :value="l.id" v-model="lapakSelection" />
          {{ l.name }} <span class="muted">- {{ l.location }}</span>
        </label>
        <div class="toolbar mt">
          <button @click="saveLapaks">Simpan</button>
          <button class="ghost" @click="showLapakForm = false">Batal</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import client from '../../api/client'

const users = ref([])
const lapaks = ref([])
const roleFilter = ref('')
const search = ref('')
const showForm = ref(false)
const showLapakForm = ref(false)
const editing = ref(false)
const lapakTarget = ref(null)
const lapakSelection = ref([])
const form = ref({})
const formError = ref('')

function roleName(r) {
  return { ADMIN: 'Admin', STAFF: 'Staff', MITRA: 'Mitra' }[r] || r
}

async function load() {
  const params = {}
  if (roleFilter.value) params.role = roleFilter.value
  if (search.value) params.search = search.value
  const data = await client.get('/users', { params })
  users.value = data.users
}

onMounted(async () => {
  await load()
  const d = await client.get('/lapaks')
  lapaks.value = d.lapaks
})

function openCreate() {
  editing.value = false
  form.value = { name: '', phone: '', address: '', role: 'MITRA', password: '' }
  formError.value = ''
  showForm.value = true
}

function openEdit(u) {
  editing.value = true
  form.value = { id: u.id, name: u.name, phone: u.phone, address: u.address, role: u.role, password: '' }
  formError.value = ''
  showForm.value = true
}

async function save() {
  formError.value = ''
  try {
    if (editing.value) {
      await client.patch(`/users/${form.value.id}`, form.value)
    } else {
      await client.post('/users', form.value)
    }
    showForm.value = false
    await load()
  } catch (e) {
    formError.value = e.response?.data?.error || 'Gagal menyimpan'
  }
}

async function toggleStatus(u) {
  const next = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
  await client.patch(`/users/${u.id}`, { status: next })
  await load()
}

function openLapaks(u) {
  lapakTarget.value = u
  lapakSelection.value = u.mitraLapaks ? u.mitraLapaks.map((m) => m.lapakId) : []
  showLapakForm.value = true
}

async function saveLapaks() {
  await client.post(`/users/${lapakTarget.value.id}/mitra-lapaks`, { lapakIds: lapakSelection.value })
  showLapakForm.value = false
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
  width: 420px;
  max-height: 90vh;
  overflow-y: auto;
}
.check-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  margin-bottom: 6px;
}
</style>
