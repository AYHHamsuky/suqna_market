import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { IconWallet } from '@tabler/icons-react'
import api, { apiError } from '../../lib/api'
import { naira, datefmt, statusColor } from '../../lib/format'
import { PageLoader, Empty, Field, Spinner, Modal } from '../../components/ui'
import { toast } from '../../components/Toast'

export default function VendorPayouts() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const { data, isLoading } = useQuery({ queryKey: ['vendor-payouts'], queryFn: async () => (await api.get('/vendor/payouts')).data })

  if (isLoading) return <PageLoader />
  const payouts = data?.payouts?.data || []

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Payouts</h1>
        <button onClick={() => setOpen(true)} className="btn-primary"><IconWallet size={16} /> Request payout</button>
      </div>

      <div className="card mb-4 flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-stone-600">Available balance</p>
          <p className="text-3xl font-bold text-brand-700">{naira(data.wallet_balance)}</p>
        </div>
        <IconWallet className="h-10 w-10 text-brand-200" />
      </div>

      {payouts.length === 0 ? <Empty title="No payout requests yet" /> : (
        <div className="card divide-y divide-stone-200">
          {payouts.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-semibold">{naira(p.amount)}</p>
                <p className="text-xs text-stone-500">{p.bank_name} · {p.account_number} · {datefmt(p.created_at)}</p>
              </div>
              <span className={`badge capitalize ${statusColor(p.status)}`}>{p.status}</span>
            </div>
          ))}
        </div>
      )}

      {open && <RequestModal balance={data.wallet_balance} onClose={() => setOpen(false)} onDone={() => { setOpen(false); qc.invalidateQueries({ queryKey: ['vendor-payouts'] }) }} />}
    </div>
  )
}

function RequestModal({ balance, onClose, onDone }) {
  const [form, setForm] = useState({ amount: balance || '', bank_name: '', account_number: '', account_name: '' })
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      await api.post('/vendor/payouts/request', form)
      toast.success('Payout requested')
      onDone()
    } catch (err) { toast.error(apiError(err)) } finally { setBusy(false) }
  }

  return (
    <Modal open onClose={onClose} title="Request payout">
      <form onSubmit={submit} className="space-y-4">
        <Field label={`Amount (max ${naira(balance)})`}><input type="number" className="input" value={form.amount} onChange={set('amount')} max={balance} required /></Field>
        <Field label="Bank name"><input className="input" value={form.bank_name} onChange={set('bank_name')} required /></Field>
        <Field label="Account number"><input className="input" value={form.account_number} onChange={set('account_number')} required /></Field>
        <Field label="Account name"><input className="input" value={form.account_name} onChange={set('account_name')} required /></Field>
        <button className="btn-primary w-full" disabled={busy}>{busy && <Spinner className="h-4 w-4" />} Submit request</button>
      </form>
    </Modal>
  )
}
