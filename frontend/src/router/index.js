import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    component: () => import('../layouts/PublicLayout.vue'),
    children: [
      { path: '', name: 'landing', component: () => import('../views/Landing.vue') },
      { path: 'stok-produk', name: 'public-stock', component: () => import('../views/PublicStock.vue') },
      { path: 'mitra-libur', name: 'public-leave', component: () => import('../views/PublicLeave.vue') }
    ]
  },
  { path: '/login', name: 'login', component: () => import('../views/Login.vue') },
  { path: '/register', name: 'register', component: () => import('../views/Register.vue') },
  {
    path: '/app',
    component: () => import('../layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'dashboard', component: () => import('../views/Dashboard.vue') },
      { path: 'admin/users', name: 'admin-users', component: () => import('../views/admin/Users.vue'), meta: { role: 'ADMIN' } },
      { path: 'admin/lapaks', name: 'admin-lapaks', component: () => import('../views/admin/Lapaks.vue'), meta: { role: 'ADMIN' } },
      { path: 'admin/payments', name: 'admin-payments', component: () => import('../views/admin/Payments.vue'), meta: { role: 'ADMIN' } },
      { path: 'admin/settings', name: 'admin-settings', component: () => import('../views/admin/Settings.vue'), meta: { role: 'ADMIN' } },
      { path: 'reports/stock', name: 'reports-stock', component: () => import('../views/reports/StockReport.vue'), meta: { role: ['ADMIN', 'STAFF'] } },
      { path: 'reports/cashflow', name: 'reports-cashflow', component: () => import('../views/reports/CashflowReport.vue'), meta: { role: ['ADMIN', 'STAFF'] } },
      { path: 'staff/sales', name: 'staff-sales', component: () => import('../views/staff/Sales.vue'), meta: { role: 'STAFF' } },
      { path: 'staff/deposits', name: 'staff-deposits', component: () => import('../views/staff/Deposits.vue'), meta: { role: 'STAFF' } },
      { path: 'mitra/deposit', name: 'mitra-deposit', component: () => import('../views/mitra/Deposit.vue'), meta: { role: 'MITRA' } },
      { path: 'mitra/stocks', name: 'mitra-stocks', component: () => import('../views/mitra/MyStock.vue'), meta: { role: 'MITRA' } },
      { path: 'mitra/leave', name: 'mitra-leave', component: () => import('../views/mitra/LeaveForm.vue'), meta: { role: 'MITRA' } },
      { path: 'mitra/leavetoday', name: 'mitra-leavetoday', component: () => import('../views/mitra/LeaveToday.vue'), meta: { role: 'MITRA' } },
      { path: 'mitra/reports', name: 'mitra-reports', component: () => import('../views/mitra/MyReports.vue'), meta: { role: 'MITRA' } }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth', top: 84 }
    }
    return savedPosition || { top: 0 }
  }
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) return { name: 'login' }
  if ((to.name === 'login' || to.name === 'register') && auth.isLoggedIn) return { path: '/app' }
  if (to.meta.role && auth.isLoggedIn) {
    const allowed = Array.isArray(to.meta.role) ? to.meta.role : [to.meta.role]
    if (!allowed.includes(auth.role)) return { path: '/app' }
  }
  return true
})

export default router
