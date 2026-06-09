import axios from 'axios'
import { useAuthStore } from '../store/auth'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { Accept: 'application/json' },
})

// Attach bearer token from the auth store on every request.
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-logout on 401.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const { token, clear } = useAuthStore.getState()
      if (token) clear()
    }
    return Promise.reject(err)
  },
)

/** Extract a human-friendly error message from an axios error. */
export function apiError(err, fallback = 'Something went wrong.') {
  const data = err?.response?.data
  if (data?.errors) {
    const first = Object.values(data.errors)[0]
    return Array.isArray(first) ? first[0] : String(first)
  }
  return data?.message || err?.message || fallback
}

export default api
