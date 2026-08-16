import axios from 'axios'
import router from '../router'

const client = axios.create({ baseURL: '/api' })

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (router.currentRoute.value.path !== '/login') router.push('/login')
    }
    return Promise.reject(err)
  }
)

export default client
