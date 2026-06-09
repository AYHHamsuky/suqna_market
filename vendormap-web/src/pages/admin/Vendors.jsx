import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { IconCheck, IconBan, IconBuildingStore } from '@tabler/icons-react'
import api, { apiError } from '../../lib/api'
import { datefmt } from '../../lib/format'
import { PageLoader, Empty, Spinner } from '../../components/ui'
import { toast } from '../../components/Toast'

const TABS = [['', 'All'], ['pending', 'Pending'], ['approved', 'Approved']]

export default function AdminVendors() {
  const qc = useQueryClient()
  const [status, setStatus] = useState('pending')
  const [busy, setBusy] = useState(null)
  const { data, isLoading } = useQuery({
    queryKey: ['admin-vendors', status],
    queryFn: async () => (await api.get('/admin/vendors', { params: status ? { status } : {} })).data,
  })

  const act = async (v, action) => {
    setBusy(v.id)
    try {
      await api.put(`/admin/vendors/${v.id}/${action}`)
      toast.success(action === 'approve' ? 'Vendor approved' : 'Vendor suspended')
      qc.invalidateQueries({ queryKey: ['admin-vendors'] })
      qc.invalidateQueries({ queryKey: ['admin-overview'] })
    } catch (e) { toast.error(apiError(e)) } finally { setBusy(null) }
  }

  if (isLoading) return <PageLoader />
  const vendors = data?.data || []

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Vendors</h1>
      <div className="mb-4 flex gap-1.5">
        {TABS.map(([v, l]) => (
          <button key={l} onClick={() => setStatus(v)} className={`btn px-3 py-1.5 text-xs ${status === v ? 'bg-brand-600 text-white' : 'border border-stone-300 bg-white text-stone-600'}`}>{l}</button>
        ))}
      </div>

      {vendors.length === 0 ? <Empty title="No vendors" icon={IconBuildingStore} /> : (
        <div className="card divide-y divide-stone-200">
          {vendors.map((v) => (
            <div key={v.id} className="flex flex-wrap items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/20 font-bold text-brand-700">{v.business_name?.[0]}</div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-semibold">
                  {v.business_name}
                  {v.is_approved ? <span className="badge bg-green-100 text-green-700">Approved</span> : <span className="badge bg-amber-100 text-amber-700">Pending</span>}
                </p>
                <p className="text-xs text-stone-500">{v.user?.name} · {v.category?.name} · {v.listings_count} listings · {datefmt(v.created_at)}</p>
              </div>
              {v.is_approved ? (
                <button onClick={() => act(v, 'suspend')} disabled={busy === v.id} className="btn px-3 py-1.5 text-xs border border-red-300 text-red-600">
                  {busy === v.id ? <Spinner className="h-3 w-3" /> : <IconBan size={14} />} Suspend
                </button>
              ) : (
                <button onClick={() => act(v, 'approve')} disabled={busy === v.id} className="btn px-3 py-1.5 text-xs bg-green-600 text-white">
                  {busy === v.id ? <Spinner className="h-3 w-3" /> : <IconCheck size={14} />} Approve
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
