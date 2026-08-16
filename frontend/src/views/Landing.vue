<template>
  <div>
    <!-- HERO -->
    <section class="hero">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="grid-lines"></div>
      <div class="hero-inner">
        <div class="hero-text">
          <span class="hero-badge"><span class="pulse-dot"></span> Platform Konsinyasi UMKM</span>
          <h1>Titipkan produk Anda, <span class="grad-text">kami yang menjualkannya.</span></h1>
          <p>
            BGM Winner membantu para Mitra menitipkan produk di lapak-lapak terpercaya. Setoran setiap pagi,
            penjualan tercatat real-time, dan pendapatan Anda transparan mulai Rp 9.000 per produk.
          </p>
          <div class="hero-actions">
            <router-link to="/register"><button class="hero-btn">Daftar sebagai Mitra</button></router-link>
            <router-link to="/stok-produk"><button class="hero-btn ghost">Lihat Stok Produk</button></router-link>
          </div>
        </div>
        <div class="hero-visual">
          <div class="hero-card">
            <div class="hero-card-head">
              <span>Penjualan Hari Ini</span>
              <span class="badge green">Live</span>
            </div>
            <div class="hero-card-rows">
              <div class="hero-row">
                <div class="hero-row-icon"><AppIcon name="box" :size="16" /></div>
                <div class="hero-row-info">
                  <div class="hero-row-name">Keripik Singkong</div>
                  <div class="hero-row-lapak">Lapak A</div>
                </div>
                <div class="hero-row-qty">12 terjual</div>
              </div>
              <div class="hero-row">
                <div class="hero-row-icon"><AppIcon name="box" :size="16" /></div>
                <div class="hero-row-info">
                  <div class="hero-row-name">Peyek Kacang</div>
                  <div class="hero-row-lapak">Lapak C</div>
                </div>
                <div class="hero-row-qty">8 terjual</div>
              </div>
              <div class="hero-row">
                <div class="hero-row-icon"><AppIcon name="box" :size="16" /></div>
                <div class="hero-row-info">
                  <div class="hero-row-name">Stik Keju</div>
                  <div class="hero-row-lapak">Lapak A</div>
                </div>
                <div class="hero-row-qty">5 terjual</div>
              </div>
            </div>
            <div class="hero-card-foot">
              <div>
                <div class="foot-label">Jasa BGM / produk</div>
                <div class="foot-value">Rp 1.000</div>
              </div>
              <div>
                <div class="foot-label">Bagian Mitra / produk</div>
                <div class="foot-value">Rp 9.000</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- STATS -->
    <section class="stats-bar">
      <div class="pub-container-inner">
        <div v-for="s in stats" :key="s.label" class="stat-item">
          <div class="stat-icon" :class="s.tone"><AppIcon :name="s.icon" :size="20" /></div>
          <div>
            <div class="stat-num">{{ s.value }}</div>
            <div class="stat-label">{{ s.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- PROFIL -->
    <section id="profil" class="section">
      <div class="pub-container-inner">
        <div class="section-grid">
          <div class="section-text">
            <span class="section-tag">Tentang Kami</span>
            <h2>Profil BGM Winner</h2>
            <p>
              BGM Winner adalah jaringan lapak dan platform konsinyasi yang memberdayakan pelaku usaha mikro
              dan kecil (UMKM). Kami menyediakan kanal penjualan yang mudah diakses bagi para Mitra untuk
              menitipkan produk mereka, sekaligus memberikan kemudahan pencatatan stok dan penjualan.
            </p>
            <p>
              Setiap pagi, Mitra menyetorkan produk ke lapak yang dipilih. Staff lapak menjual produk dari
              jam 06.00 hingga 12.00, dan setiap penjualan tercatat otomatis melalui sistem. Dengan begitu,
              Mitra dapat memantau sisa stok dan hasil penjualan produknya secara langsung.
            </p>
            <ul class="check-list">
              <li><AppIcon name="check" :size="15" /> Pencatatan stok masuk dan keluar otomatis</li>
              <li><AppIcon name="check" :size="15" /> Laporan penjualan dan cashflow harian serta bulanan</li>
              <li><AppIcon name="check" :size="15" /> Pantau stok produk secara real-time</li>
            </ul>
          </div>
          <div class="section-cards">
            <div class="info-card">
              <div class="info-card-icon"><AppIcon name="store" :size="20" /></div>
              <div class="info-card-title">Lapak BGM</div>
              <div class="info-card-desc">Pilih satu atau lebih lapak untuk menitipkan produk Anda.</div>
            </div>
            <div class="info-card">
              <div class="info-card-icon"><AppIcon name="clock" :size="20" /></div>
              <div class="info-card-title">Setoran 05:00 - 06:00</div>
              <div class="info-card-desc">Setiap pagi, setorkan produk dan lengkapi formulir jumlah stok.</div>
            </div>
            <div class="info-card">
              <div class="info-card-icon"><AppIcon name="tag" :size="20" /></div>
              <div class="info-card-title">Penjualan 06:00 - 12:00</div>
              <div class="info-card-desc">Staff menjual produk; setiap terjual tercatat dan stok berkurang.</div>
            </div>
            <div class="info-card">
              <div class="info-card-icon"><AppIcon name="wallet" :size="20" /></div>
              <div class="info-card-title">Bagian Mitra Rp 9.000</div>
              <div class="info-card-desc">Setiap produk terjual, Mitra memperoleh Rp 9.000 dan BGM Rp 1.000.</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- VISI MISI -->
    <section id="visimisi" class="section section-alt">
      <div class="pub-container-inner">
        <div class="section-head">
          <span class="section-tag">Arah Kami</span>
          <h2>Visi &amp; Misi</h2>
          <p>Komitmen kami untuk membangun ekosistem perdagangan lokal yang sehat dan transparan.</p>
        </div>

        <div class="vm-grid">
          <div class="vm-card visi">
            <div class="vm-icon"><AppIcon name="eye" :size="22" /></div>
            <h3>Visi</h3>
            <p>
              Menjadi jaringan lapak konsinyasi terdepan dan terpercaya yang memberdayakan UMKM lokal
              untuk tumbuh dan berkembang.
            </p>
          </div>
          <div class="vm-card misi">
            <div class="vm-icon"><AppIcon name="target" :size="22" /></div>
            <h3>Misi</h3>
            <ul>
              <li>Menyediakan kanal penjualan yang mudah, cepat, dan transparan bagi para Mitra.</li>
              <li>Mengelola stok dan penjualan secara tertib, akurat, dan tercatat lengkap.</li>
              <li>Membangun kepercayaan melalui laporan yang jujur dan real-time.</li>
              <li>Mendorong pertumbuhan produk lokal melalui jaringan lapak yang luas.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- CARA KERJA -->
    <section class="section">
      <div class="pub-container-inner">
        <div class="section-head">
          <span class="section-tag">Cara Kerja</span>
          <h2>Bagaimana Sistem Bekerja?</h2>
          <p>Empat langkah sederhana dari setoran hingga laporan.</p>
        </div>
        <div class="steps">
          <div v-for="(s, i) in steps" :key="i" class="step">
            <div class="step-num">{{ i + 1 }}</div>
            <h4>{{ s.title }}</h4>
            <p>{{ s.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta">
      <div class="orb orb-3"></div>
      <div class="grid-lines"></div>
      <div class="cta-inner">
        <h2>Siap menitipkan produk Anda?</h2>
        <p>Daftar sebagai Mitra sekarang dan mulai titipkan produk Anda di lapak BGM Winner.</p>
        <router-link to="/register"><button class="cta-btn">Daftar Sekarang</button></router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppIcon from '../components/AppIcon.vue'

const stats = ref([
  { icon: 'users', tone: 'tone-red', value: '50+', label: 'Mitra Terdaftar' },
  { icon: 'store', tone: 'tone-amber', value: '3', label: 'Lapak Aktif' },
  { icon: 'box', tone: 'tone-blue', value: '100+', label: 'Produk UMKM' },
  { icon: 'cashflow', tone: 'tone-green', value: 'Rp 1.000', label: 'Jasa per Produk' }
])

const steps = ref([
  { title: 'Daftar & Pilih Lapak', desc: 'Daftarkan diri dan pilih satu atau lebih lapak BGM untuk menitipkan produk.' },
  { title: 'Setoran Pagi', desc: 'Jam 05.00-06.00, setorkan produk dan isi form jumlah stok di lapak terdaftar.' },
  { title: 'Staff Menjual', desc: 'Jam 06.00-12.00, staff menjual produk. Setiap terjual, stok berkurang otomatis.' },
  { title: 'Closing & Laporan', desc: 'Jam 12.00 lapak ditutup. Stok dihitung, laporan stok & cashflow tersaji harian dan bulanan.' }
])
</script>

<style scoped>
.hero {
  background: var(--hero-bg);
  color: var(--text);
  position: relative;
  overflow: hidden;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  pointer-events: none;
}

.orb-1 {
  width: 520px;
  height: 520px;
  top: -200px;
  right: -100px;
  background: radial-gradient(circle, #e6212a, transparent 70%);
  opacity: var(--orb-opacity);
}

.orb-2 {
  width: 400px;
  height: 400px;
  bottom: -160px;
  left: -120px;
  background: radial-gradient(circle, #c0141c, transparent 70%);
  opacity: var(--orb-opacity);
}

.grid-lines {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--gridline) 1px, transparent 1px),
    linear-gradient(90deg, var(--gridline) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: radial-gradient(80% 70% at 30% 20%, #000 40%, transparent 100%);
}

.hero-inner {
  max-width: 1160px;
  margin: 0 auto;
  padding: 72px 24px 84px;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 48px;
  align-items: center;
  position: relative;
  z-index: 1;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--surface);
  border: 1px solid var(--border-strong);
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.03em;
  margin-bottom: 20px;
  backdrop-filter: blur(4px);
  color: var(--primary-2);
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--green-text);
  box-shadow: 0 0 10px rgba(52, 211, 153, 0.9);
}

.hero-text h1 {
  font-size: 42px;
  line-height: 1.16;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0 0 18px;
}

.grad-text {
  background: linear-gradient(120deg, #ff3b44, #e6212a, #c0141c);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-text p {
  color: var(--muted);
  font-size: 16px;
  line-height: 1.7;
  margin: 0 0 28px;
  max-width: 520px;
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-btn {
  background: linear-gradient(135deg, #e6212a, #c0141c);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  padding: 12px 22px;
  box-shadow: 0 8px 24px rgba(230, 33, 42, 0.4);
}

.hero-btn.ghost {
  background: transparent;
  color: var(--text);
  border: 1px solid var(--border-strong);
  box-shadow: none;
}

.hero-btn.ghost:hover {
  background: var(--nav-hover-bg);
  filter: none;
}

.hero-visual {
  display: flex;
  justify-content: center;
}

.hero-card {
  width: 100%;
  max-width: 380px;
  background: var(--glass-grad);
  border: 1px solid var(--border-strong);
  border-radius: 20px;
  padding: 20px;
  backdrop-filter: blur(16px);
  box-shadow: 0 30px 70px -20px rgba(0, 0, 0, 0.35);
  color: var(--text);
}

.hero-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 14px;
}

.hero-card-rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hero-row {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 10px 12px;
  background: var(--surface);
}

.hero-row-icon {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: linear-gradient(135deg, rgba(230, 33, 42, 0.25), rgba(192, 20, 28, 0.25));
  color: var(--primary-2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-row-info {
  flex: 1;
}

.hero-row-name {
  font-weight: 700;
  font-size: 14px;
}

.hero-row-lapak {
  font-size: 12px;
  color: var(--muted);
}

.hero-row-qty {
  font-size: 13px;
  font-weight: 700;
  color: var(--green-text);
}

.hero-card-foot {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px dashed var(--border);
}

.foot-label {
  font-size: 11.5px;
  color: var(--muted);
}

.foot-value {
  font-size: 17px;
  font-weight: 800;
  color: var(--primary-2);
}

.stats-bar {
  background: var(--bg-soft);
  border-bottom: 1px solid var(--border);
}

.pub-container-inner {
  max-width: 1160px;
  margin: 0 auto;
  padding: 0 24px;
}

.stats-bar .pub-container-inner {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  padding: 28px 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 14px;
}

.stat-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-num {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.stat-label {
  font-size: 12.5px;
  color: var(--muted);
  font-weight: 500;
}

.section {
  padding: 64px 0;
}

.section-alt {
  background: var(--surface);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.section-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: start;
}

.section-tag {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--primary-2);
  background: var(--primary-soft);
  border: 1px solid rgba(230, 33, 42, 0.25);
  padding: 5px 12px;
  border-radius: 999px;
  margin-bottom: 14px;
}

.section h2 {
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0 0 16px;
}

.section-text p {
  color: var(--muted);
  font-size: 15px;
  line-height: 1.8;
  margin: 0 0 14px;
}

.check-list {
  list-style: none;
  padding: 0;
  margin: 18px 0 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.check-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
}

.check-list svg {
  color: var(--green);
  flex-shrink: 0;
}

.section-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-card {
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 20px;
  background: var(--glass-grad);
  backdrop-filter: blur(10px);
  transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
}

.info-card:hover {
  box-shadow: var(--shadow);
  transform: translateY(-2px);
  border-color: rgba(230, 33, 42, 0.4);
}

.info-card-icon {
  width: 42px;
  height: 42px;
  border-radius: 11px;
  background: linear-gradient(135deg, rgba(230, 33, 42, 0.25), rgba(192, 20, 28, 0.25));
  color: var(--primary-2);
  border: 1px solid rgba(230, 33, 42, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.info-card-title {
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 6px;
}

.info-card-desc {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.6;
}

.section-head {
  text-align: center;
  max-width: 620px;
  margin: 0 auto 44px;
}

.section-head h2 {
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0 0 12px;
}

.section-head p {
  color: var(--muted);
  font-size: 15px;
  line-height: 1.7;
  margin: 0;
}

.vm-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.vm-card {
  border-radius: 16px;
  padding: 28px;
  border: 1px solid var(--border);
  background: var(--glass-grad);
}

.vm-card.visi {
  border-top: 3px solid var(--primary);
}

.vm-card.misi {
  border-top: 3px solid var(--amber);
}

.vm-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(230, 33, 42, 0.2), rgba(192, 20, 28, 0.2));
  color: var(--primary-2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}

.vm-card.misi .vm-icon {
  background: var(--amber-bg);
  color: var(--amber-text);
}

.vm-card h3 {
  margin: 0 0 12px;
  font-size: 19px;
  font-weight: 800;
}

.vm-card p {
  color: var(--muted);
  line-height: 1.8;
  margin: 0;
}

.vm-card ul {
  padding-left: 18px;
  margin: 0;
  color: var(--muted);
  line-height: 2;
}

.steps {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.step {
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 24px;
  background: var(--glass-grad);
  position: relative;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.step:hover {
  transform: translateY(-2px);
  border-color: rgba(230, 33, 42, 0.4);
}

.step-num {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e6212a, #c0141c);
  color: #fff;
  font-weight: 800;
  font-size: 17px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
  box-shadow: 0 6px 16px rgba(230, 33, 42, 0.4);
}

.step h4 {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 700;
}

.step p {
  margin: 0;
  font-size: 13px;
  color: var(--muted);
  line-height: 1.7;
}

.cta {
  background: var(--cta-bg);
  color: var(--cta-text);
  position: relative;
  overflow: hidden;
  text-align: center;
  padding: 72px 24px;
}

.orb-3 {
  width: 460px;
  height: 460px;
  top: -220px;
  left: 50%;
  transform: translateX(-50%);
  background: radial-gradient(circle, #c0141c, transparent 70%);
  opacity: var(--orb-opacity);
}

.cta-inner {
  position: relative;
  z-index: 1;
  max-width: 620px;
  margin: 0 auto;
}

.cta h2 {
  color: var(--cta-text);
  font-size: 32px;
  font-weight: 800;
  margin: 0 0 14px;
}

.cta p {
  color: var(--cta-sub);
  font-size: 16px;
  line-height: 1.7;
  margin: 0 0 28px;
}

.cta-btn {
  background: #fff;
  color: var(--primary);
  font-size: 16px;
  font-weight: 700;
  padding: 14px 32px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}

@media (max-width: 900px) {
  .hero-inner {
    grid-template-columns: 1fr;
    padding: 48px 20px 56px;
  }
  .hero-text h1 {
    font-size: 30px;
  }
  .stats-bar .pub-container-inner {
    grid-template-columns: 1fr 1fr;
  }
  .section-grid,
  .vm-grid {
    grid-template-columns: 1fr;
  }
  .steps {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 560px) {
  .steps {
    grid-template-columns: 1fr;
  }
  .section-cards {
    grid-template-columns: 1fr;
  }
}
</style>
