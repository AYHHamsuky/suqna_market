import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { IconWallet } from '@tabler/icons-react'
import api, { apiError } from '../../lib/api'
import { naira, datefmt, statusColor } from '../../lib/format'
import { PageLoader, Empty, Spinner } from '../../components/ui'
import { toast } from '../../components/Toast'

const TABS = [['', 'All'], ['pending', 'Pending'], ['paid', 'Paid'], ['failed', 'Failed']]

export default function AdminPayouts() {
  const qc = useQueryClient()
  const [status, setStatus] = useState('pending')
  const [busy, setBusy] = useState(null)
  const { data, isLoading } = useQuery({ queryKey: ['admin-payouts', status], queryFn: async () => (await api.get('/admin/payouts', { params: status ? { status } : {} })).data })

  const process = async (p, result) => {
    setBusy(p.id)
    try {
      await api.put(`/admin/payouts/${p.id}/process`, { status: result })
      toast.success(result === 'paid' ? 'Marked as paid' : 'Marked failed (balance refunded)')
      qc.invalidateQueries({ queryKey: ['admin-payouts'] })
    } catch (e) { toast.error(apiError(e)) } finally { setBusy(null) }
  }

  if (isLoading) return <PageLoader />
  const payouts = data?.data || []

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Payouts</h1>
      <div className="mb-4 flex gap-1.5">
        {TABS.map(([v, l]) => (
          <button key={l} onClick={() => setStatus(v)} className={`btn px-3 py-1.5 text-xs ${status === v ? 'bg-brand-600 text-white' : 'border border-stone-300 bg-white text-stone-600'}`}>{l}</button>
        ))}
      </div>

      {payouts.length === 0 ? <Empty title="No payout requests" icon={IconWallet} /> : (
        <div className="card divide-y divide-stone-200">
          {payouts.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{p.vendor?.business_name} — {naira(p.amount)}</p>
                <p className="text-xs text-stone-500">{p.bank_name} · {p.account_number} · {p.account_name} · {datefmt(p.created_at)}</p>
              </div>
              <span className={`badge capitalize ${statusColor(p.status)}`}>{p.status}</span>
              {(p.status === 'pending' || p.status === 'processing') && (
                <div className="flex gap-2">
                  <button onClick={() => process(p, 'paid')} disabled={busy === p.id} className="btn bg-green-600 px-3 py-1.5 text-xs text-white">{busy === p.id ? <Spinner className="h-3 w-3" /> : null} Mark paid</button>
                  <button onClick={() => process(p, 'failed')} disabled={busy === p.id} className="btn border border-red-300 px-3 py-1.5 text-xs text-red-600">Fail</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
