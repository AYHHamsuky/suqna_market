import { useQuery } from '@tanstack/react-query'
import {
  IconCoin, IconCash, IconReceipt2, IconBuildingStore, IconClock, IconUsers, IconBox, IconWallet,
} from '@tabler/icons-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import api from '../../lib/api'
import { naira } from '../../lib/format'
import { PageLoader } from '../../components/ui'
import StatCard from '../../components/StatCard'

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-overview'], queryFn: async () => (await api.get('/admin/analytics/overview')).data.data })
  if (isLoading) return <PageLoader />

  const series = (data.series || []).map((r) => ({ date: r.d?.slice(5), revenue: Number(r.revenue), gmv: Number(r.gmv) }))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Platform overview</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="GMV (gross sales)" value={naira(data.gmv)} icon={IconCoin} accent="brand" />
        <StatCard label="Platform revenue" value={naira(data.platform_revenue)} icon={IconCash} accent="green" />
        <StatCard label="Total orders" value={data.total_orders} sub={`${data.completed_orders} completed`} icon={IconReceipt2} accent="sky" />
        <StatCard label="Pending payouts" value={naira(data.pending_payouts)} icon={IconWallet} accent="amber" />
        <StatCard label="Active vendors" value={data.active_vendors} icon={IconBuildingStore} accent="violet" />
        <StatCard label="Pending vendors" value={data.pending_vendors} icon={IconClock} accent="amber" />
        <StatCard label="Customers" value={data.total_customers} icon={IconUsers} accent="sky" />
        <StatCard label="Listings" value={data.total_listings} icon={IconBox} accent="brand" />
      </div>

      <div className="card p-4">
        <p className="mb-3 font-semibold">GMV & revenue (last 30 days)</p>
        {series.length ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={series} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₦${v / 1000}k`} />
              <Tooltip formatter={(v) => naira(v)} />
              <Bar dataKey="gmv" fill="#fdba74" radius={[3, 3, 0, 0]} />
              <Bar dataKey="revenue" fill="#ea580c" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <p className="py-16 text-center text-sm text-stone-500">No data yet.</p>}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <p className="mb-2 font-semibold">Top vendors by GMV</p>
          <ul className="space-y-1.5 text-sm">
            {data.top_vendors?.length ? data.top_vendors.map((v, i) => (
              <li key={i} className="flex justify-between"><span className="truncate">{v.business_name}</span><span className="font-medium">{naira(v.gmv)}</span></li>
            )) : <li className="text-stone-500">No sales yet</li>}
          </ul>
        </div>
        <div className="card p-4">
          <p className="mb-2 font-semibold">Listings by category</p>
          <ul className="space-y-1.5 text-sm">
            {data.top_categories?.map((c, i) => (
              <li key={i} className="flex justify-between"><span className="truncate">{c.name}</span><span className="font-medium">{c.listings}</span></li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
