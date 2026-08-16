<template>
  <div class="public">
    <header class="pub-header">
      <div class="pub-container">
        <router-link to="/" class="pub-brand">
          <BrandLogo :size="38" />
          <div class="pub-brand-text">
            <span class="pub-name">BGM Winner</span>
            <span class="pub-sub">Sistem Penitipan Produk</span>
          </div>
        </router-link>

        <nav class="pub-nav">
          <router-link to="/" :class="{ active: route.name === 'landing' }">Beranda</router-link>
          <a href="#profil" @click.prevent="go('profil')">Profil</a>
          <a href="#visimisi" @click.prevent="go('visimisi')">Visi &amp; Misi</a>
          <router-link to="/stok-produk" :class="{ active: route.name === 'public-stock' }">Stok Produk</router-link>
          <router-link to="/mitra-libur" :class="{ active: route.name === 'public-leave' }">Mitra Libur</router-link>
        </nav>

        <div class="pub-actions">
          <ThemeToggle />
          <router-link to="/login"><button class="ghost">Masuk</button></router-link>
          <router-link to="/register"><button>Daftar Mitra</button></router-link>
        </div>
      </div>
    </header>

    <main class="pub-main">
      <router-view />
    </main>

    <footer class="pub-footer">
      <div class="pub-container footer-grid">
        <div>
          <div class="footer-brand">
            <BrandLogo :size="32" />
            <span class="footer-name">BGM Winner</span>
          </div>
          <p class="footer-desc">
            Sistem pengelolaan penitipan produk UMKM dengan lapak-lapak terpercaya. Transparan, tercatat, dan menguntungkan bagi Mitra.
          </p>
        </div>
        <div>
          <h4>Navigasi</h4>
          <router-link to="/">Beranda</router-link>
          <router-link to="/stok-produk">Stok Produk</router-link>
          <router-link to="/mitra-libur">Mitra Libur</router-link>
        </div>
        <div>
          <h4>Akun</h4>
          <router-link to="/login">Masuk</router-link>
          <router-link to="/register">Daftar sebagai Mitra</router-link>
        </div>
        <div>
          <h4>Kontak</h4>
          <p>BGM Winner<br />0811-0000-0001<br />Jln. Pasar Sentral, Indonesia</p>
        </div>
      </div>
      <div class="pub-container footer-bottom">
        &copy; {{ year }} BGM Winner. Seluruh hak cipta dilindungi.
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BrandLogo from '../components/BrandLogo.vue'
import ThemeToggle from '../components/ThemeToggle.vue'

const route = useRoute()
const router = useRouter()
const year = new Date().getFullYear()

function go(anchor) {
  if (route.name === 'landing') {
    document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' })
  } else {
    router.push({ path: '/', hash: `#${anchor}` })
  }
}
</script>

<style scoped>
.public {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
}

.pub-header {
  background: var(--topbar-bg);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 40;
}

.pub-container {
  max-width: 1160px;
  margin: 0 auto;
  padding: 0 24px;
}

.pub-header .pub-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: 68px;
}

.pub-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--text);
}

.pub-brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.pub-name {
  font-size: 16px;
  font-weight: 800;
}

.pub-sub {
  font-size: 11px;
  color: var(--muted);
}

.pub-nav {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pub-nav a {
  padding: 8px 13px;
  border-radius: 9px;
  text-decoration: none;
  color: var(--muted);
  font-size: 14px;
  font-weight: 500;
  transition: background 0.15s ease, color 0.15s ease;
}

.pub-nav a:hover {
  background: var(--nav-hover-bg);
  color: var(--nav-hover-color);
}

.pub-nav a.active {
  background: var(--primary-soft);
  color: var(--primary-2);
  font-weight: 700;
}

.pub-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.pub-main {
  flex: 1;
}

.pub-footer {
  background: var(--footer-bg);
  color: var(--footer-text);
  border-top: 1px solid var(--border);
  margin-top: auto;
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.2fr;
  gap: 32px;
  padding: 44px 24px 28px;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.footer-name {
  font-size: 17px;
  font-weight: 800;
  color: var(--footer-head);
}

.footer-desc {
  font-size: 13.5px;
  line-height: 1.7;
  margin-top: 14px;
  max-width: 320px;
}

.pub-footer h4 {
  color: var(--footer-head);
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 14px;
}

.pub-footer a {
  display: block;
  color: var(--footer-text);
  text-decoration: none;
  font-size: 14px;
  margin-bottom: 10px;
}

.pub-footer a:hover {
  color: var(--footer-head);
}

.pub-footer p {
  font-size: 13.5px;
  line-height: 1.7;
  margin: 0;
}

.footer-bottom {
  border-top: 1px solid var(--footer-border);
  padding: 18px 24px;
  font-size: 13px;
  text-align: center;
  color: var(--muted);
}

@media (max-width: 860px) {
  .pub-header .pub-container {
    flex-wrap: wrap;
    height: auto;
    padding: 12px 16px;
    gap: 10px;
  }
  .pub-nav {
    order: 3;
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }
  .footer-grid {
    grid-template-columns: 1fr;
    padding: 32px 24px 20px;
  }
}
</style>
