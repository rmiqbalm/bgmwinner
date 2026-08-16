<template>
  <div>
    <h2>Kelola Lapak</h2>

    <div class="card mb">
      <h3>Tambah Lapak</h3>
      <div class="toolbar">
        <input v-model="newName" placeholder="Nama lapak (mis. Lapak D)" />
        <input v-model="newLocation" placeholder="Lokasi / alamat" />
        <button @click="create">Simpan</button>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Nama</th>
          <th>Lokasi</th>
          <th>Mitra Terdaftar</th>
          <th>Status</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="l in lapaks" :key="l.id">
          <td>{{ l.id }}</td>
          <td>{{ l.name }}</td>
          <td>{{ l.location || '-' }}</td>
          <td>{{ l._count.mitraLapaks }}</td>
          <td>
            <span v-if="l.status === 'ACTIVE'" class="badge green">Aktif</span>
            <span v-else class="badge red">Nonaktif</span>
          </td>
          <td>
            <button class="small ghost" @click="openEdit(l)">Edit</button>
            <button class="small" :class="l.status === 'ACTIVE' ? 'danger' : 'success'" @click="toggle(l)">
              {{ l.status === 'ACTIVE' ? 'Nonaktifkan' : 'Aktifkan' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="showEdit" class="modal">
      <div class="modal-card card">
        <h3>Edit Lapak</h3>
        <div class="form-group">
          <label>Nama</label>
          <input v-model="editForm.name" style="width: 100%" />
        </div>
        <div class="form-group">
          <label>Lokasi</label>
          <input v-model="editForm.location" style="width: 100%" />
        </div>
        <div class="toolbar">
          <button @click="saveEdit">Simpan</button>
          <button class="ghost" @click="showEdit = false">Batal</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import client from '../../api/client'

const lapaks = ref([])
const newName = ref('')
const newLocation = ref('')
const showEdit = ref(false)
const editForm = ref({})

async function load() {
  const data = await client.get('/lapaks')
  lapaks.value = data.lapaks
}

onMounted(load)

async function create() {
  if (!newName.value) return
  await client.post('/lapaks', { name: newName.value, location: newLocation.value })
  newName.value = ''
  newLocation.value = ''
  await load()
}

function openEdit(l) {
  editForm.value = { id: l.id, name: l.name, location: l.location }
  showEdit.value = true
}

async function saveEdit() {
  await client.patch(`/lapaks/${editForm.value.id}`, editForm.value)
  showEdit.value = false
  await load()
}

async function toggle(l) {
  const next = l.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
  await client.patch(`/lapaks/${l.id}`, { status: next })
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
  width: 400px;
}
</style>
