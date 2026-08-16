<template>
  <div>
    <h2>Pengaturan Sistem</h2>

    <div class="card">
      <h3>Nilai Ekonomi</h3>
      <div class="grid grid-3">
        <div class="form-group">
          <label>Bagian Mitra (Rp)</label>
          <input v-model.number="s.MITRA_SHARE" type="number" />
        </div>
        <div class="form-group">
          <label>Jasa BGM (Rp)</label>
          <input v-model.number="s.BGM_FEE" type="number" />
        </div>
        <div class="form-group">
          <label>Harga Jual (Rp)</label>
          <input v-model.number="s.SELLING_PRICE" type="number" />
        </div>
      </div>

      <h3>Jam Operasional</h3>
      <div class="grid grid-3">
        <div class="form-group">
          <label>Buka Setoran</label>
          <input v-model="s.DEPOSIT_OPEN" type="time" />
        </div>
        <div class="form-group">
          <label>Tutup Setoran</label>
          <input v-model="s.DEPOSIT_CLOSE" type="time" />
        </div>
        <div class="form-group">
          <label>Jam Closing Lapak</label>
          <input v-model="s.STALL_CLOSE" type="time" />
        </div>
      </div>

      <h3>Lainnya</h3>
      <div class="grid grid-3">
        <div class="form-group">
          <label>Jam Auto-Deteksi Libur</label>
          <input v-model="s.AUTO_LEAVE_HOUR" type="time" />
        </div>
        <div class="form-group">
          <label>Tegakkan jam setoran (Mitra)</label>
          <select v-model="s.WINDOW_ENFORCE">
            <option value="false">Tidak (fleksibel)</option>
            <option value="true">Ya (hanya 05:00-06:00)</option>
          </select>
        </div>
      </div>

      <button @click="save">Simpan Pengaturan</button>
      <div v-if="saved" class="success-msg mt">Pengaturan tersimpan.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import client from '../../api/client'

const s = ref({})
const saved = ref(false)

onMounted(async () => {
  const data = await client.get('/settings')
  for (const item of data.settings) s.value[item.key] = item.value
})

async function save() {
  await client.patch('/settings', s.value)
  saved.value = true
  setTimeout(() => (saved.value = false), 2500)
}
</script>
