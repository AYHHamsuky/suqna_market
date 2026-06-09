import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import api, { apiError } from '../../lib/api'
import { useCategories } from '../../lib/queries'
import { useAuthStore } from '../../store/auth'
import { Field, Spinner, PageLoader } from '../../components/ui'
import LocationPicker from '../../components/LocationPicker'
import { toast } from '../../components/Toast'

export default function VendorProfile() {
  const qc = useQueryClient()
  const { data: categories } = useCategories()
  const { user, setUser } = useAuthStore()
  const { data, isLoading } = useQuery({ queryKey: ['vendor-profile'], queryFn: async () => (await api.get('/vendor/profile')).data.data })

  const [form, setForm] = useState(null)
  const [loc, setLoc] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (data) {
      setForm({
        business_name: data.business_name || '', description: data.description || '',
        category_id: data.category_id || '', address: data.address || '', city: data.city || '', state: data.state || '',
        phone: data.phone || '', is_open: data.is_open, bank_name: data.bank_name || '',
        account_number: data.account_number || '', account_name: data.account_name || '',
      })
      setLoc({ lat: +data.latitude, lng: +data.longitude })
    }
  }, [data])

  if (isLoading || !form) return <PageLoader />
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const { data: updated } = await api.put('/vendor/profile', { ...form, latitude: loc.lat, longitude: loc.lng })
      toast.success('Profile updated')
      // keep auth store vendor_profile fresh
      setUser({ ...user, vendor_profile: { ...user.vendor_profile, ...updated.data } })
      qc.invalidateQueries({ queryKey: ['vendor-profile'] })
    } catch (err) { toast.error(apiError(err)) } finally { setBusy(false) }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-2xl font-bold">Shop profile</h1>
      <form onSubmit={submit} className="space-y-5">
        <div className="card space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Business name"><input className="input" value={form.business_name} onChange={set('business_name')} /></Field>
            <Field label="Category">
              <select className="input" value={form.category_id} onChange={set('category_id')}>
                {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Description"><textarea className="input" rows={2} value={form.description} onChange={set('description')} /></Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Address"><input className="input" value={form.address} onChange={set('address')} /></Field>
            <Field label="City"><input className="input" value={form.city} onChange={set('city')} /></Field>
            <Field label="Phone"><input className="input" value={form.phone} onChange={set('phone')} /></Field>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!form.is_open} onChange={(e) => setForm({ ...form, is_open: e.target.checked })} /> Shop is currently open
          </label>
        </div>

        <div className="card p-5">
          <p className="mb-2 font-semibold">Location</p>
          <LocationPicker value={loc} onChange={setLoc} />
        </div>

        <div className="card space-y-4 p-5">
          <p className="font-semibold">Payout bank details</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Bank name"><input className="input" value={form.bank_name} onChange={set('bank_name')} /></Field>
            <Field label="Account number"><input className="input" value={form.account_number} onChange={set('account_number')} /></Field>
            <Field label="Account name"><input className="input" value={form.account_name} onChange={set('account_name')} /></Field>
          </div>
        </div>

        <button className="btn-primary" disabled={busy}>{busy && <Spinner className="h-4 w-4" />} Save changes</button>
      </form>
    </div>
  )
}
