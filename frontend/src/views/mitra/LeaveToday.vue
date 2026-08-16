<template>
  <div>
    <h2>Mitra Libur Hari Ini</h2>
    <p class="muted mb">Daftar Mitra yang libur dapat dilihat oleh seluruh Mitra.</p>

    <div class="toolbar">
      <input v-model="date" type="date" @change="load" />
      <button @click="load">Muat Ulang</button>
    </div>

    <table>
      <thead>
        <tr>
          <th>Mitra</th>
          <th>No. HP</th>
          <th>Lapak</th>
          <th>Alasan</th>
          <th>Sumber</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="l in leaves" :key="l.id">
          <td>{{ l.mitra.name }}</td>
          <td>{{ l.mitra.phone }}</td>
          <td>{{ l.lapak.name }}</td>
          <td>{{ l.reason || '-' }}</td>
          <td>
            <span v-if="l.source === 'MANUAL'" class="badge blue">Isi Form</span>
            <span v-else class="badge amber">Otomatis</span>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-if="leaves.length === 0" class="muted mt">Tidak ada Mitra yang libur pada tanggal tersebut.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import client from '../../api/client'

const leaves = ref([])
const date = ref('')

async function load() {
  const params = {}
  if (date.value) params.date = date.value
  const data = await client.get('/leaves/today', { params })
  leaves.value = data.leaves
}

onMounted(() => {
  const today = new Date()
  date.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  load()
})
</script>
