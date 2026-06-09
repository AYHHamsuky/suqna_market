import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  IconWallet, IconCoin, IconReceipt2, IconClock, IconBox, IconStarFilled,
} from '@tabler/icons-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import api from '../../lib/api'
import { useAuthStore } from '../../store/auth'
import { naira } from '../../lib/format'
import { PageLoader } from '../../components/ui'
import StatCard from '../../components/StatCard'

export default function VendorDashboard() {
  const { user } = useAuthStore()
  const vp = user?.vendor_profile
  const { data, isLoading } = useQuery({ queryKey: ['vendor-analytics'], queryFn: async () => (await api.get('/vendor/analytics')).data.data })

  if (isLoading) return <PageLoader />

  const series = (data.revenue_series || []).map((r) => ({ date: r.d?.slice(5), total: Number(r.total) }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{vp?.business_name}</h1>
        <p className="text-sm text-stone-600">
          {vp?.is_approved ? 'Your shop is live' : 'Pending admin approval — listings hidden until approved'}
        </p>
      </div>

      {!vp?.is_approved && (
        <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Your shop is awaiting approval. You can add listings now; they'll go live once an admin approves you.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Wallet balance" value={naira(data.wallet_balance)} icon={IconWallet} accent="green" />
        <StatCard label="Net revenue" value={naira(data.net_revenue)} icon={IconCoin} accent="brand" />
        <StatCard label="Total orders" value={data.total_orders} sub={`${data.completed_orders} completed`} icon={IconReceipt2} accent="sky" />
        <StatCard label="Pending orders" value={data.pending_orders} icon={IconClock} accent="amber" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-4 lg:col-span-2">
          <p className="mb-3 font-semibold">Revenue (last 14 days)</p>
          {series.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={series} margin={{ left: -10 }}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ea580c" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#ea580c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₦${v / 1000}k`} />
                <Tooltip formatter={(v) => naira(v)} />
                <Area type="monotone" dataKey="total" stroke="#ea580c" fill="url(#g)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <p className="py-16 text-center text-sm text-stone-500">No revenue data yet.</p>}
        </div>

        <div className="space-y-4">
          <StatCard label="Active listings" value={data.active_listings} icon={IconBox} accent="violet" />
          <div className="card p-4">
            <p className="mb-1 flex items-center gap-1 font-semibold"><IconStarFilled size={16} className="text-amber-400" /> {Number(data.rating_avg).toFixed(1)}</p>
            <p className="text-xs text-stone-600">{data.rating_count} reviews</p>
          </div>
          <div className="card p-4">
            <p className="mb-2 font-semibold">Top items</p>
            <ul className="space-y-1 text-sm">
              {data.top_listings?.length ? data.top_listings.map((t, i) => (
                <li key={i} className="flex justify-between"><span className="truncate">{t.listing_name}</span><span className="font-medium">{naira(t.total)}</span></li>
              )) : <li className="text-stone-500">No sales yet</li>}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Link to="/vendor/listings" className="btn-primary">Manage listings</Link>
        <Link to="/vendor/orders" className="btn-outline">View orders</Link>
      </div>
    </div>
  )
}
