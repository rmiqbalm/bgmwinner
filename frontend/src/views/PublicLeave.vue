<template>
  <div class="page">
    <div class="page-head">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="pub-container-inner">
        <span class="page-tag">Informasi Harian</span>
        <h1>Mitra Libur Hari Ini</h1>
        <p>
          Daftar Mitra yang berhalangan hadir pada hari ini. Informasi ini dapat dilihat oleh seluruh
          Mitra dan pengunjung.
        </p>
      </div>
    </div>

    <div class="pub-container-inner page-body">
      <div class="toolbar">
        <input v-model="date" type="date" @change="load" />
        <button @click="load">Muat Ulang</button>
      </div>

      <div class="table-wrap">
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
              <td>
                <div class="mitra-cell">
                  <div class="avatar">{{ l.mitra.name.charAt(0) }}</div>
                  <span class="prod-name">{{ l.mitra.name }}</span>
                </div>
              </td>
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
        <div v-if="loading" class="empty">Memuat...</div>
        <div v-else-if="leaves.length === 0" class="empty">
          Tidak ada Mitra yang libur pada tanggal tersebut.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import client from '../api/client'

const leaves = ref([])
const date = ref('')
const loading = ref(true)

async function load() {
  loading.value = true
  const params = {}
  if (date.value) params.date = date.value
  try {
    const data = await client.get('/leaves/today', { params })
    leaves.value = data.leaves
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const today = new Date()
  date.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  load()
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

.mitra-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(230, 33, 42, 0.3), rgba(192, 20, 28, 0.3));
  color: #fff;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
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
