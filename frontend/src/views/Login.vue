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
          <h1>Kelola penitipan produk para Mitra, secara digital.</h1>
          <p>Setoran, penjualan, stok hingga laporan cashflow harian dan bulanan dalam satu sistem.</p>
        </div>

        <ul class="auth-features">
          <li><span class="f-icon"><AppIcon name="box" :size="16" /></span>Setoran harian 05:00 - 06:00</li>
          <li><span class="f-icon"><AppIcon name="tag" :size="16" /></span>Penjualan real-time dengan tombol Terjual</li>
          <li><span class="f-icon"><AppIcon name="chart" :size="16" /></span>Laporan stok &amp; cashflow harian/bulanan</li>
        </ul>
      </div>
    </div>

    <div class="auth-panel">
      <div class="auth-card card">
        <h2>Selamat datang kembali</h2>
        <p class="muted" style="margin-top: 4px">Masuk untuk melanjutkan ke akun Anda.</p>

        <div v-if="error" class="error">{{ error }}</div>

        <form @submit.prevent="submit">
          <div class="form-group">
            <label>Nomor Telp / HP</label>
            <input v-model="phone" required placeholder="0812xxxxxxx" style="width: 100%" />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input v-model="password" type="password" required placeholder="Password Anda" style="width: 100%" />
          </div>
          <button type="submit" :disabled="loading" style="width: 100%">
            {{ loading ? 'Memproses...' : 'Masuk' }}
          </button>
        </form>

        <div class="demo-box">
          <div class="demo-title">Akun demo</div>
          <table>
            <tbody>
              <tr><td>Admin</td><td>081100000001</td></tr>
              <tr><td>Staff</td><td>081100000002</td></tr>
              <tr><td>Mitra</td><td>081200000001</td></tr>
            </tbody>
          </table>
          <p class="muted" style="font-size: 12px">Password semua akun: admin123 / staff123 / mitra123</p>
        </div>

        <p class="mt muted" style="text-align: center">
          Belum punya akun Mitra?
          <router-link to="/register" class="btn-link">Daftar sebagai Mitra</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import AppIcon from '../components/AppIcon.vue'
import BrandLogo from '../components/BrandLogo.vue'
import ThemeToggle from '../components/ThemeToggle.vue'

const auth = useAuthStore()
const router = useRouter()
const phone = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    const user = await auth.login(phone.value, password.value)
    router.push(user.role === 'MITRA' ? '/app/mitra/deposit' : '/app')
  } catch (e) {
    error.value = e.response?.data?.error || 'Gagal login'
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
  font-size: 30px;
  line-height: 1.25;
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
  max-width: 410px;
  padding: 34px;
  box-shadow: var(--shadow-lg);
  border-radius: 20px;
  position: relative;
}

.auth-card h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.demo-box {
  margin-top: 22px;
  border: 1px dashed rgba(230, 33, 42, 0.4);
  background: var(--primary-soft);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
}

.demo-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--primary-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.demo-box table {
  background: transparent;
  border: none;
}

.demo-box td {
  padding: 4px 8px 4px 0;
  border: none;
  font-size: 13px;
  background: transparent;
}

.demo-box td:first-child {
  font-weight: 600;
}

.demo-box tr:hover td {
  background: transparent;
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
