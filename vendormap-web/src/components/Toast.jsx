import { create } from 'zustand'
import { useEffect } from 'react'
import { IconCheck, IconX, IconInfoCircle } from '@tabler/icons-react'

let id = 0
export const useToast = create((set) => ({
  toasts: [],
  push: (message, type = 'info') => {
    const tid = ++id
    set((s) => ({ toasts: [...s.toasts, { id: tid, message, type }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== tid) })), 3500)
  },
  dismiss: (tid) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== tid) })),
}))

// Convenience helpers.
export const toast = {
  success: (m) => useToast.getState().push(m, 'success'),
  error: (m) => useToast.getState().push(m, 'error'),
  info: (m) => useToast.getState().push(m, 'info'),
}

export function Toaster() {
  const { toasts, dismiss } = useToast()
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => {
        const Icon = t.type === 'success' ? IconCheck : t.type === 'error' ? IconX : IconInfoCircle
        const color =
          t.type === 'success' ? 'bg-green-600' : t.type === 'error' ? 'bg-red-600' : 'bg-stone-200'
        return (
          <div
            key={t.id}
            className={`flex items-center gap-2 rounded-lg ${color} px-4 py-2.5 text-sm text-white shadow-lg`}
            onClick={() => dismiss(t.id)}
          >
            <Icon size={18} /> {t.message}
          </div>
        )
      })}
    </div>
  )
}
