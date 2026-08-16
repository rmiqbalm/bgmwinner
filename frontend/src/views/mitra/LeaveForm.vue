<template>
  <div>
    <h2>Form Libur</h2>
    <p class="muted mb">Isi form ini jika Anda libur. Jika tidak isi form dan tidak setor produk, sistem akan otomatis menandai Anda libur.</p>

    <div class="card" style="max-width: 480px">
      <div class="form-group">
        <label>Tanggal Libur</label>
        <input v-model="leaveDate" type="date" style="width: 100%" />
      </div>
      <div class="form-group">
        <label>Alasan</label>
        <textarea v-model="reason" rows="2" placeholder="Alasan libur (opsional)" style="width: 100%" />
      </div>
      <div class="form-group">
        <label>Lapak (kosongkan = semua lapak terdaftar)</label>
        <label v-for="ml in lapaks" :key="ml.id" class="check-item">
          <input type="checkbox" :value="ml.lapakId" v-model="selectedLapaks" />
          {{ ml.lapak.name }}
        </label>
      </div>
      <button @click="submit">Kirim Form Libur</button>
      <div v-if="msg" class="success-msg">{{ msg }}</div>
      <div v-if="err" class="error">{{ err }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import client from '../../api/client'

const leaveDate = ref('')
const reason = ref('')
const lapaks = ref([])
const selectedLapaks = ref([])
const msg = ref('')
const err = ref('')

onMounted(async () => {
  const today = new Date()
  leaveDate.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const data = await client.get('/auth/me')
  lapaks.value = data.user.mitraLapaks
})

async function submit() {
  msg.value = ''
  err.value = ''
  try {
    await client.post('/leaves', {
      leaveDate: leaveDate.value,
      reason: reason.value,
      lapakIds: selectedLapaks.value
    })
    msg.value = 'Form libur terkirim'
  } catch (e) {
    err.value = e.response?.data?.error || 'Gagal mengirim form libur'
  }
}
</script>

<style scoped>
.check-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  margin-bottom: 6px;
}
</style>
