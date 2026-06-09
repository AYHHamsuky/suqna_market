import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { IconReceipt2 } from '@tabler/icons-react'
import api, { apiError } from '../../lib/api'
import { naira, datetimefmt, statusColor } from '../../lib/format'
import { PageLoader, Empty, Spinner } from '../../components/ui'
import { toast } from '../../components/Toast'

const NEXT = {
  pending: [],
  confirmed: [['preparing', 'Start preparing'], ['cancelled', 'Cancel']],
  preparing: [['ready', 'Mark ready'], ['dispatched', 'Dispatch']],
  ready: [['completed', 'Complete']],
  dispatched: [['completed', 'Complete']],
}

const FILTERS = ['', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']

export default function VendorOrders() {
  const qc = useQueryClient()
  const [status, setStatus] = useState('')
  const [busyId, setBusyId] = useState(null)
  const { data, isLoading } = useQuery({
    queryKey: ['vendor-orders', status],
    queryFn: async () => (await api.get('/vendor/orders', { params: status ? { status } : {} })).data,
  })

  const update = async (order, next) => {
    setBusyId(order.id)
    try {
      await api.put(`/vendor/orders/${order.id}/status`, { status: next })
      toast.success(`Order ${next}`)
      qc.invalidateQueries({ queryKey: ['vendor-orders'] })
    } catch (e) { toast.error(apiError(e)) } finally { setBusyId(null) }
  }

  if (isLoading) return <PageLoader />
  const orders = data?.data || []

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Orders</h1>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button key={f || 'all'} onClick={() => setStatus(f)} className={`btn px-3 py-1.5 text-xs capitalize ${status === f ? 'bg-brand-600 text-white' : 'border border-stone-300 bg-white text-stone-600'}`}>
            {f || 'All'}
          </button>
        ))}
      </div>

      {orders.length === 0 ? <Empty title="No orders" icon={IconReceipt2} /> : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="card p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{o.reference}</p>
                    <span className={`badge capitalize ${statusColor(o.status)}`}>{o.status}</span>
                    {o.payment?.status === 'success' && <span className="badge bg-green-100 text-green-700">Paid</span>}
                  </div>
                  <p className="text-xs text-stone-500">{o.customer?.name} · {datetimefmt(o.created_at)} · {o.delivery_type}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{naira(o.subtotal)}</p>
                  <p className="text-xs text-stone-500">payout {naira(o.vendor_payout)}</p>
                </div>
              </div>

              <ul className="mt-2 space-y-0.5 text-sm text-stone-600">
                {o.items?.map((it) => <li key={it.id}>{it.listing_name} × {it.quantity}{it.unit ? ` ${it.unit}` : ''}</li>)}
              </ul>
              {o.notes && <p className="mt-1 text-xs italic text-stone-500">“{o.notes}”</p>}

              {NEXT[o.status]?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {NEXT[o.status].map(([s, label]) => (
                    <button key={s} onClick={() => update(o, s)} disabled={busyId === o.id}
                      className={`btn px-3 py-1.5 text-xs ${s === 'cancelled' ? 'border border-red-300 text-red-600' : 'bg-brand-600 text-white'}`}>
                      {busyId === o.id ? <Spinner className="h-3 w-3" /> : null} {label}
                    </button>
                  ))}
                </div>
              )}
              {o.status === 'pending' && <p className="mt-2 text-xs text-amber-600">Awaiting customer payment.</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
