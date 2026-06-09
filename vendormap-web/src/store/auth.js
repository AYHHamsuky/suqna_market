import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: ({ token, user }) => set({ token, user }),
      setUser: (user) => set({ user }),
      clear: () => set({ token: null, user: null }),
    }),
    { name: 'vendormap-auth' },
  ),
)

export const isVendor = (u) => u?.role === 'vendor'
export const isAdmin = (u) => u?.role === 'admin'
export const isCustomer = (u) => u?.role === 'customer'
