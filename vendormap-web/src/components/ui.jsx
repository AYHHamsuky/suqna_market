import { IconStarFilled, IconStar, IconLoader2 } from '@tabler/icons-react'

export function Spinner({ className = '' }) {
  return <IconLoader2 className={`animate-spin ${className}`} />
}

export function PageLoader() {
  return (
    <div className="flex h-64 items-center justify-center text-stone-500">
      <Spinner className="h-8 w-8" />
    </div>
  )
}

export function Empty({ title = 'Nothing here yet', subtitle, icon: Icon, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-white py-16 text-center">
      {Icon && <Icon className="mb-3 h-10 w-10 text-stone-500" />}
      <p className="font-medium text-stone-600">{title}</p>
      {subtitle && <p className="mt-1 max-w-sm text-sm text-stone-500">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function StarRating({ value = 0, count, size = 16, onChange }) {
  const stars = [1, 2, 3, 4, 5]
  return (
    <div className="inline-flex items-center gap-0.5">
      {stars.map((s) => {
        const filled = s <= Math.round(value)
        const Star = filled ? IconStarFilled : IconStar
        return (
          <Star
            key={s}
            size={size}
            className={`${filled ? 'text-amber-400' : 'text-stone-500'} ${onChange ? 'cursor-pointer' : ''}`}
            onClick={onChange ? () => onChange(s) : undefined}
          />
        )
      })}
      {count != null && <span className="ml-1 text-xs text-stone-500">({count})</span>}
    </div>
  )
}

export function Badge({ children, className = '' }) {
  return <span className={`badge ${className}`}>{children}</span>
}

export function Field({ label, error, children, hint }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-stone-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

export function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:p-8" onClick={onClose}>
      <div
        className={`card w-full ${wide ? 'max-w-2xl' : 'max-w-md'} my-8`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-stone-200 px-5 py-3">
            <h3 className="font-semibold">{title}</h3>
            <button className="text-stone-500 hover:text-stone-600" onClick={onClose}>✕</button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
