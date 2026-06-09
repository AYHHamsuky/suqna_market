import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { IconPlus, IconTrash, IconLanguage } from '@tabler/icons-react'
import api, { apiError } from '../../lib/api'
import { PageLoader, Empty, Field, Spinner } from '../../components/ui'
import { toast } from '../../components/Toast'

export default function AdminSynonyms() {
  const qc = useQueryClient()
  const [q, setQ] = useState('')
  const [form, setForm] = useState({ search_term: '', canonical_tag: '' })
  const [busy, setBusy] = useState(false)
  const { data, isLoading } = useQuery({ queryKey: ['admin-synonyms', q], queryFn: async () => (await api.get('/admin/synonyms', { params: q ? { q } : {} })).data })

  const add = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      await api.post('/admin/synonyms', form)
      toast.success('Synonym added')
      setForm({ search_term: '', canonical_tag: '' })
      qc.invalidateQueries({ queryKey: ['admin-synonyms'] })
    } catch (e) { toast.error(apiError(e)) } finally { setBusy(false) }
  }

  const remove = async (id) => {
    try {
      await api.delete(`/admin/synonyms/${id}`)
      qc.invalidateQueries({ queryKey: ['admin-synonyms'] })
    } catch (e) { toast.error(apiError(e)) }
  }

  const rows = data?.data || []

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-1 text-2xl font-bold">Search synonyms</h1>
      <p className="mb-4 text-sm text-stone-600">Map what customers type to canonical tags, so “swallows”, “tuwo” and “tuwon shinkafa” reach the same vendors.</p>

      <form onSubmit={add} className="card mb-4 grid gap-3 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <Field label="Search term"><input className="input" value={form.search_term} onChange={(e) => setForm({ ...form, search_term: e.target.value })} placeholder="e.g. swallows" required /></Field>
        <Field label="Canonical tag"><input className="input" value={form.canonical_tag} onChange={(e) => setForm({ ...form, canonical_tag: e.target.value })} placeholder="e.g. tuwo" required /></Field>
        <button className="btn-primary" disabled={busy}>{busy ? <Spinner className="h-4 w-4" /> : <IconPlus size={16} />} Add</button>
      </form>

      <input className="input mb-3 max-w-xs" placeholder="Filter…" value={q} onChange={(e) => setQ(e.target.value)} />

      {isLoading ? <PageLoader /> : rows.length === 0 ? <Empty title="No synonyms" icon={IconLanguage} /> : (
        <div className="card divide-y divide-stone-200">
          {rows.map((s) => (
            <div key={s.id} className="flex items-center gap-3 p-3 text-sm">
              <span className="font-medium">{s.search_term}</span>
              <span className="text-stone-500">→</span>
              <span className="badge bg-brand-500/10 text-brand-700">{s.canonical_tag}</span>
              <button onClick={() => remove(s.id)} className="ml-auto text-stone-500 hover:text-red-500"><IconTrash size={16} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
