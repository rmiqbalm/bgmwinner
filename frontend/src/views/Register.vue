<template>
  <div class="auth-wrap">
    <div class="auth-theme"><ThemeToggle /></div>
    <div class="auth-side">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="grid-lines"></div>
      <div class="auth-side-inner">
        <div class="brand">
          <BrandLogo :size="46" />
          <div class="brand-text">
            <span class="brand-name">BGM Winner</span>
            <span class="brand-sub">Sistem Penitipan Produk</span>
          </div>
        </div>

        <div class="auth-message">
          <h1>Bergabung sebagai Mitra dan titipkan produk Anda di lapak kami.</h1>
          <p>Pilih satu atau lebih lapak BGM Winner. Setoran setiap pagi, hasil penjualan terpantau real-time.</p>
        </div>

        <ul class="auth-features">
          <li><span class="f-icon"><AppIcon name="store" :size="16" /></span>Pilih lebih dari satu lapak</li>
          <li><span class="f-icon"><AppIcon name="eye" :size="16" /></span>Pantau stok produk secara langsung</li>
          <li><span class="f-icon"><AppIcon name="wallet" :size="16" /></span>Bagian Mitra Rp 9.000 per produk</li>
        </ul>
      </div>
    </div>

    <div class="auth-panel">
      <div class="auth-card card">
        <h2>Daftar Mitra</h2>
        <p class="muted" style="margin-top: 4px">Isi data diri Anda untuk memulai.</p>

        <div v-if="error" class="error">{{ error }}</div>

        <form @submit.prevent="submit">
          <div class="form-group">
            <label>Nama Lengkap</label>
            <input v-model="form.name" required placeholder="Nama Anda" style="width: 100%" />
          </div>
          <div class="form-group">
            <label>Nomor Telp / HP</label>
            <input v-model="form.phone" required placeholder="0812xxxxxxx" style="width: 100%" />
          </div>
          <div class="form-group">
            <label>Alamat</label>
            <textarea v-model="form.address" required rows="2" placeholder="Alamat lengkap" style="width: 100%" />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input v-model="form.password" type="password" required placeholder="Buat password" style="width: 100%" />
          </div>
          <div class="form-group">
            <label>Pilih Lapak (boleh lebih dari satu)</label>
            <div v-if="lapaks.length === 0" class="muted">Memuat daftar lapak...</div>
            <label v-for="l in lapaks" :key="l.id" class="lapak-item">
              <input type="checkbox" :value="l.id" v-model="form.lapakIds" />
              <span class="lapak-name">
                <AppIcon name="store" :size="14" />
                {{ l.name }}
              </span>
              <span class="muted">{{ l.location }}</span>
            </label>
          </div>
          <button type="submit" :disabled="loading" style="width: 100%">
            {{ loading ? 'Mendaftar...' : 'Daftar' }}
          </button>
        </form>

        <p class="mt muted" style="text-align: center">
          Sudah punya akun?
          <router-link to="/login" class="btn-link">Masuk</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import client from '../api/client'
import AppIcon from '../components/AppIcon.vue'
import BrandLogo from '../components/BrandLogo.vue'
import ThemeToggle from '../components/ThemeToggle.vue'

const auth = useAuthStore()
const router = useRouter()
const lapaks = ref([])
const error = ref('')
const loading = ref(false)
const form = ref({ name: '', phone: '', address: '', password: '', lapakIds: [] })

onMounted(async () => {
  try {
    const data = await client.get('/lapaks')
    lapaks.value = data.lapaks.filter((l) => l.status === 'ACTIVE')
  } catch (e) {
    error.value = 'Gagal memuat daftar lapak'
  }
})

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await auth.register(form.value)
    router.push('/app/mitra/deposit')
  } catch (e) {
    error.value = e.response?.data?.error || 'Gagal mendaftar'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-wrap {
  min-height: 100vh;
  display: flex;
  background: var(--bg);
}

.auth-theme {
  position: fixed;
  top: 18px;
  right: 18px;
  z-index: 60;
}

.auth-side {
  width: 46%;
  background: var(--auth-side-bg);
  color: var(--text);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: var(--orb-opacity);
}

.orb-1 {
  width: 380px;
  height: 380px;
  top: -100px;
  right: -80px;
  background: radial-gradient(circle, #e6212a, transparent 70%);
}

.orb-2 {
  width: 300px;
  height: 300px;
  bottom: -120px;
  left: -80px;
  background: radial-gradient(circle, #c0141c, transparent 70%);
}

.grid-lines {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--gridline) 1px, transparent 1px),
    linear-gradient(90deg, var(--gridline) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: radial-gradient(90% 70% at 40% 30%, #000 40%, transparent 100%);
}

.auth-side-inner {
  padding: 48px;
  position: relative;
  z-index: 1;
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 56px;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-size: 20px;
  font-weight: 800;
  color: var(--text);
}

.brand-sub {
  font-size: 12px;
  color: var(--muted);
}

.auth-message h1 {
  font-size: 28px;
  line-height: 1.28;
  font-weight: 800;
  margin: 0 0 14px;
  letter-spacing: -0.02em;
  color: var(--text);
}

.auth-message p {
  color: var(--muted);
  font-size: 15px;
  line-height: 1.6;
  margin: 0;
  max-width: 420px;
}

.auth-features {
  list-style: none;
  padding: 0;
  margin: 40px 0 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.auth-features li {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: var(--text);
}

.f-icon {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: linear-gradient(135deg, rgba(230, 33, 42, 0.3), rgba(192, 20, 28, 0.3));
  border: 1px solid var(--border-strong);
  color: var(--primary-2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.auth-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  position: relative;
  overflow: hidden;
}

.auth-panel::before {
  content: '';
  position: absolute;
  width: 420px;
  height: 420px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(230, 33, 42, 0.14), transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  filter: blur(80px);
  pointer-events: none;
}

.auth-card {
  width: 100%;
  max-width: 430px;
  padding: 34px;
  box-shadow: var(--shadow-lg);
  border-radius: 20px;
  position: relative;
  max-height: 92vh;
  overflow-y: auto;
}

.auth-card h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.lapak-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  margin-bottom: 8px;
  cursor: pointer;
  font-weight: 500;
  color: var(--text);
  background: rgba(255, 255, 255, 0.04);
  transition: border-color 0.15s ease, background 0.15s ease;
}

.lapak-item:hover {
  border-color: var(--primary);
  background: var(--primary-soft);
}

.lapak-item input {
  accent-color: var(--primary);
}

.lapak-name {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  flex: 1;
}

@media (max-width: 860px) {
  .auth-wrap {
    flex-direction: column;
  }
  .auth-side {
    width: 100%;
    padding: 28px 0;
  }
  .auth-side-inner {
    padding: 24px;
  }
  .brand {
    margin-bottom: 24px;
  }
  .auth-message h1 {
    font-size: 22px;
  }
  .auth-features {
    margin-top: 20px;
  }
  .auth-panel {
    padding: 24px;
  }
}
</style>
