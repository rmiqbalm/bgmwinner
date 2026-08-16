import { defineStore } from 'pinia'
import client from '../api/client'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user') || 'null')
  }),
  getters: {
    isLoggedIn: (s) => !!s.token,
    role: (s) => s.user?.role || null,
    isAdmin: (s) => s.user?.role === 'ADMIN',
    isStaff: (s) => s.user?.role === 'STAFF',
    isMitra: (s) => s.user?.role === 'MITRA'
  },
  actions: {
    async login(phone, password) {
      const data = await client.post('/auth/login', { phone, password })
      this.token = data.token
      this.user = data.user
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      return data.user
    },
    async register(payload) {
      const data = await client.post('/auth/register', payload)
      this.token = data.token
      this.user = data.user
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      return data.user
    },
    async fetchMe() {
      const data = await client.get('/auth/me')
      this.user = data.user
      localStorage.setItem('user', JSON.stringify(data.user))
      return data.user
    },
    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
})
