import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import api from './api'
import { useAuthStore } from '../store/auth'
import { toast } from '../components/Toast'

export function useAuthActions() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { setAuth, clear } = useAuthStore()

  const afterAuth = (data, redirectByRole = true) => {
    setAuth({ token: data.token, user: data.user })
    if (redirectByRole) {
      if (data.user.role === 'vendor') navigate('/vendor')
      else if (data.user.role === 'admin') navigate('/admin')
      else navigate('/')
    }
  }

  return {
    login: async (login, password) => {
      const { data } = await api.post('/auth/login', { login, password })
      afterAuth(data)
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}`)
    },
    registerCustomer: async (payload) => {
      const { data } = await api.post('/auth/register/customer', payload)
      afterAuth(data)
      toast.success('Account created')
    },
    registerVendor: async (payload) => {
      const { data } = await api.post('/auth/register/vendor', payload)
      afterAuth(data)
      toast.success('Vendor account created — pending approval')
    },
    logout: async () => {
      try {
        await api.post('/auth/logout')
      } catch {}
      clear()
      qc.clear()
      navigate('/')
      toast.info('Signed out')
    },
  }
}
