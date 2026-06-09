import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { IconReceipt2 } from '@tabler/icons-react'
import api from '../lib/api'
import { naira, datefmt, statusColor } from '../lib/format'
import { PageLoader, Empty } from '../components/ui'

export default function Orders() {
  const { data, isLoading } = useQuery({ queryKey: ['my-orders'], queryFn: async () => (await api.get('/customer/orders')).data })

  if (isLoading) return <PageLoader />
  const orders = data?.data || []

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-xl font-bold">My orders</h1>
      {orders.length === 0 ? (
        <Empty title="No orders yet" subtitle="When you order from a vendor it will show up here." icon={IconReceipt2}
          action={<Link to="/search" className="btn-primary">Find vendors</Link>} />
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link key={o.id} to={`/orders/${o.id}`} className="card flex items-center gap-4 p-4 hover:border-brand-300">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{o.vendor?.business_name}</p>
                  <span className={`badge capitalize ${statusColor(o.status)}`}>{o.status}</span>
                </div>
                <p className="text-xs text-stone-500">{o.reference} · {datefmt(o.created_at)} · {o.items?.length} item(s)</p>
              </div>
              <p className="font-bold">{naira(o.subtotal)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
