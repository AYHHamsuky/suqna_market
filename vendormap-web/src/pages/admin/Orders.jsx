import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { IconReceipt2 } from '@tabler/icons-react'
import api from '../../lib/api'
import { naira, datetimefmt, statusColor } from '../../lib/format'
import { PageLoader, Empty } from '../../components/ui'

export default function AdminOrders() {
  const [q, setQ] = useState('')
  const { data, isLoading } = useQuery({ queryKey: ['admin-orders', q], queryFn: async () => (await api.get('/admin/orders', { params: q ? { q } : {} })).data })
  const orders = data?.data || []

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Orders</h1>
        <input className="input max-w-xs" placeholder="Search reference…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {isLoading ? <PageLoader /> : orders.length === 0 ? <Empty title="No orders" icon={IconReceipt2} /> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-stone-200 text-left text-xs uppercase text-stone-500">
              <tr><th className="p-3">Reference</th><th className="p-3">Customer</th><th className="p-3">Vendor</th><th className="p-3">Status</th><th className="p-3 text-right">Amount</th><th className="p-3 text-right">Commission</th><th className="p-3">Date</th></tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="p-3 font-mono text-xs">{o.reference}</td>
                  <td className="p-3">{o.customer?.name}</td>
                  <td className="p-3">{o.vendor?.business_name}</td>
                  <td className="p-3"><span className={`badge capitalize ${statusColor(o.status)}`}>{o.status}</span></td>
                  <td className="p-3 text-right font-medium">{naira(o.subtotal)}</td>
                  <td className="p-3 text-right text-green-600">{naira(o.commission_amt)}</td>
                  <td className="p-3 text-xs text-stone-500">{datetimefmt(o.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
