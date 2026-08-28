import axios from 'axios'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'

let isRedirecting = false

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/v1`,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  const token =
    authStore.token ??
    localStorage.getItem('token') ??
    sessionStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      error.response?.status === 401 &&
      !isRedirecting
    ) {
      isRedirecting = true

      const authStore = useAuthStore()

      await authStore.logout()

      await router.replace({
        name: 'Login'
      })

      isRedirecting = false
    }

    return Promise.reject(error)
  }
)

export default api
