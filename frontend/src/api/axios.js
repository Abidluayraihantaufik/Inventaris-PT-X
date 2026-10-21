import axios from 'axios'

/**
 * Axios instance terpusat untuk semua API call ke Laravel backend.
 * Base URL kosong karena Vite proxy menangani /api -> http://localhost:8000
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
})

// ─── Request Interceptor ─────────────────────────────────────────────────
// Tambahkan token Sanctum ke setiap request jika tersedia
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response Interceptor ────────────────────────────────────────────────
// Handle error global: 401 → redirect ke login, 403 → tampilkan pesan
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status

    if (status === 401) {
      // Token expired atau tidak valid → bersihkan storage & redirect
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api
