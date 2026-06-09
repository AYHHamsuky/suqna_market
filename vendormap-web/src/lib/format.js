export const naira = (n) =>
  '₦' + Number(n || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 })

export const km = (n) => (n == null ? null : `${Number(n).toFixed(n < 10 ? 1 : 0)} km`)

export const datefmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

export const datetimefmt = (d) =>
  d
    ? new Date(d).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : ''

/** Price label honouring pricing mode (mirrors the backend accessor). */
export function priceLabel(l) {
  if (!l) return ''
  const u = l.price_unit ? ` / ${l.price_unit}` : ''
  switch (l.pricing_mode) {
    case 'fixed':
      return naira(l.price) + u
    case 'range':
      return `${naira(l.price_min)} – ${naira(l.price_max)}${u}`
    case 'per_unit':
      return `${naira(l.price)} / ${l.price_unit || 'unit'}`
    case 'ask':
      return 'Ask vendor'
    default:
      return naira(l.price)
  }
}

export const statusColor = (s) =>
  ({
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-sky-100 text-sky-700',
    preparing: 'bg-indigo-100 text-indigo-700',
    ready: 'bg-emerald-100 text-emerald-700',
    dispatched: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-stone-200 text-stone-600',
    disputed: 'bg-red-100 text-red-700',
    success: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    paid: 'bg-green-100 text-green-700',
    processing: 'bg-sky-100 text-sky-700',
  })[s] || 'bg-stone-100 text-stone-600'

/** Build storage URL (handles both absolute and relative paths). */
export const img = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return path.startsWith('/') ? path : `/storage/${path}`
}
