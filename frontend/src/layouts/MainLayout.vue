<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="brand">
        <BrandLogo :size="42" />
        <div class="brand-text">
          <span class="brand-name">BGM Winner</span>
          <span class="brand-sub">Sistem Penitipan Produk</span>
        </div>
      </div>

      <div class="role-chip">
        <span class="role-dot"></span>
        {{ roleLabel }}
      </div>

      <nav>
        <template v-for="item in navItems" :key="item.to">
          <div v-if="item.group" class="nav-group">{{ item.group }}</div>
          <router-link :to="item.to" class="nav-item" :class="{ active: isActive(item.to) }">
            <span class="nav-icon"><AppIcon :name="item.icon" :size="17" /></span>
            <span>{{ item.label }}</span>
          </router-link>
        </template>
      </nav>

      <div class="sidebar-footer">
        <div class="user-card">
          <div class="avatar">{{ initial }}</div>
          <div class="user-info">
            <div class="user-name">{{ auth.user?.name }}</div>
            <div class="user-phone">{{ auth.user?.phone }}</div>
          </div>
          <button class="logout-btn" title="Keluar" @click="logout">
            <AppIcon name="logout" :size="18" />
          </button>
        </div>
      </div>
    </aside>

    <div class="main">
      <header class="topbar">
        <div class="topbar-left">
          <span class="topbar-title">{{ pageTitle }}</span>
        </div>
        <div class="topbar-right">
          <ThemeToggle />
          <span class="today">
            <AppIcon name="calendar" :size="15" />
            {{ todayStr }}
          </span>
        </div>
      </header>

      <main class="content">
        <div class="glow glow-a"></div>
        <div class="glow glow-b"></div>
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import AppIcon from '../components/AppIcon.vue'
import BrandLogo from '../components/BrandLogo.vue'
import ThemeToggle from '../components/ThemeToggle.vue'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const roleLabel = computed(() => {
  const map = { ADMIN: 'Administrator', STAFF: 'Staff', MITRA: 'Mitra' }
  return map[auth.role] || auth.role
})

const initial = computed(() => (auth.user?.name || '?').charAt(0).toUpperCase())

const todayStr = computed(() =>
  new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
)

const pageTitles = {
  'dashboard': 'Dashboard',
  'admin-users': 'Kelola Pengguna',
  'admin-lapaks': 'Kelola Lapak',
  'admin-payments': 'Pembayaran Mitra',
  'admin-settings': 'Pengaturan Sistem',
  'reports-stock': 'Laporan Stok IN/OUT',
  'reports-cashflow': 'Laporan Cashflow',
  'staff-sales': 'Penjualan Lapak',
  'staff-deposits': 'Kelola Setoran',
  'mitra-deposit': 'Setor Produk',
  'mitra-stocks': 'Stok Produk Saya',
  'mitra-leave': 'Form Libur',
  'mitra-leavetoday': 'Mitra Libur Hari Ini',
  'mitra-reports': 'Laporan Saya'
}

const pageTitle = computed(() => pageTitles[route.name] || 'BGM Winner')

const navItems = computed(() => {
  const admin = [
    { group: 'Utama', icon: 'dashboard', to: '/app', label: 'Dashboard' },
    { group: 'Manajemen', icon: 'users', to: '/app/admin/users', label: 'Pengguna' },
    { icon: 'store', to: '/app/admin/lapaks', label: 'Lapak' },
    { icon: 'wallet', to: '/app/admin/payments', label: 'Pembayaran Mitra' },
    { icon: 'settings', to: '/app/admin/settings', label: 'Pengaturan' },
    { group: 'Laporan', icon: 'box', to: '/app/reports/stock', label: 'Laporan Stok' },
    { icon: 'cashflow', to: '/app/reports/cashflow', label: 'Laporan Cashflow' }
  ]
  const staff = [
    { group: 'Utama', icon: 'dashboard', to: '/app', label: 'Dashboard' },
    { group: 'Operasional', icon: 'tag', to: '/app/staff/sales', label: 'Penjualan' },
    { icon: 'box', to: '/app/staff/deposits', label: 'Setoran' },
    { group: 'Laporan', icon: 'chart', to: '/app/reports/stock', label: 'Laporan Stok' },
    { icon: 'cashflow', to: '/app/reports/cashflow', label: 'Laporan Cashflow' }
  ]
  const mitra = [
    { group: 'Utama', icon: 'dashboard', to: '/app', label: 'Dashboard' },
    { group: 'Produk Saya', icon: 'box', to: '/app/mitra/deposit', label: 'Setor Produk' },
    { icon: 'eye', to: '/app/mitra/stocks', label: 'Stok Produk' },
    { group: 'Libur', icon: 'calendar', to: '/app/mitra/leave', label: 'Form Libur' },
    { icon: 'users', to: '/app/mitra/leavetoday', label: 'Mitra Libur' },
    { group: 'Info', icon: 'chart', to: '/app/mitra/reports', label: 'Laporan Saya' }
  ]
  if (auth.isAdmin) return admin
  if (auth.isStaff) return staff
  return mitra
})

function isActive(to) {
  if (to === '/app') return route.path === '/app'
  return route.path.startsWith(to)
}

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 264px;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--sidebar-border);
  color: var(--text);
  padding: 22px 16px;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  flex-shrink: 0;
  z-index: 10;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 6px;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.01em;
  background: var(--brand-grad);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.brand-sub {
  font-size: 11.5px;
  color: var(--muted);
}

.role-chip {
  margin: 20px 6px 8px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  font-weight: 600;
  background: var(--primary-soft);
  color: var(--primary-2);
  padding: 6px 12px;
  border-radius: 999px;
  align-self: flex-start;
  border: 1px solid rgba(230, 33, 42, 0.25);
}

.role-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary-2);
  box-shadow: 0 0 8px rgba(230, 33, 42, 0.9);
}

nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  overflow-y: auto;
  margin-top: 6px;
}

.nav-group {
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
  margin: 14px 10px 6px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 11px;
  color: var(--nav-color);
  text-decoration: none;
  padding: 9px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.15s ease, color 0.15s ease;
  position: relative;
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 8px;
}

.nav-item:hover {
  background: var(--nav-hover-bg);
  color: var(--nav-hover-color);
}

.nav-item.active {
  background: var(--nav-active-bg);
  color: var(--nav-active-color);
  font-weight: 700;
  border: var(--nav-active-border);
}

.nav-item.active .nav-icon {
  background: linear-gradient(135deg, #e6212a, #c0141c);
  color: #fff;
  box-shadow: 0 4px 14px rgba(230, 33, 42, 0.45);
}

.sidebar-footer {
  padding-top: 14px;
  border-top: 1px solid var(--border);
}

.user-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 6px;
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--avatar-grad);
  color: #fff;
  font-weight: 800;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 13.5px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-phone {
  font-size: 12px;
  color: var(--muted);
}

.logout-btn {
  background: var(--slate-bg);
  color: var(--muted);
  width: 34px;
  height: 34px;
  padding: 0;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: none;
}

.logout-btn:hover {
  background: var(--primary-soft);
  color: var(--primary-2);
}

.main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  position: relative;
}

.topbar {
  height: 60px;
  background: var(--topbar-bg);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  position: sticky;
  top: 0;
  z-index: 20;
}

.topbar-title {
  font-size: 15px;
  font-weight: 700;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.today {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--muted);
  font-size: 13px;
  font-weight: 500;
  background: var(--surface-2);
  border: 1px solid var(--border);
  padding: 6px 12px;
  border-radius: 999px;
}

.content {
  flex: 1;
  padding: 26px 28px 40px;
  max-width: 1160px;
  width: 100%;
  position: relative;
}

.glow {
  position: fixed;
  width: 480px;
  height: 480px;
  border-radius: 50%;
  filter: blur(130px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.16;
}

.glow-a {
  top: -160px;
  right: -120px;
  background: radial-gradient(circle, #e6212a, transparent 70%);
}

.glow-b {
  bottom: -180px;
  left: 10%;
  background: radial-gradient(circle, #c0141c, transparent 70%);
}

@media (max-width: 860px) {
  .layout {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
    height: auto;
    position: static;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
    padding: 12px 16px;
    gap: 8px;
  }
  .brand-sub,
  .role-chip,
  .nav-group,
  .sidebar-footer {
    display: none;
  }
  nav {
    flex-direction: row;
    flex-wrap: wrap;
    margin: 0;
  }
  .nav-item {
    padding: 6px 10px;
  }
  .topbar {
    padding: 0 16px;
  }
  .content {
    padding: 16px;
  }
}
</style>
