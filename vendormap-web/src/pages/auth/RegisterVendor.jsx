import { useState } from 'react'
import { Link } from 'react-router-dom'
import { IconBuildingStore } from '@tabler/icons-react'
import { useAuthActions } from '../../lib/useAuthActions'
import { apiError } from '../../lib/api'
import { useCategories } from '../../lib/queries'
import { Field, Spinner } from '../../components/ui'
import LocationPicker from '../../components/LocationPicker'

export default function RegisterVendor() {
  const { registerVendor } = useAuthActions()
  const { data: categories } = useCategories()
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '',
    business_name: '', category_id: '', description: '', address: '', city: 'Kaduna', state: 'Kaduna',
  })
  const [loc, setLoc] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!loc) return setError('Please set your shop location on the map.')
    setLoading(true)
    try {
      await registerVendor({ ...form, latitude: loc.lat, longitude: loc.lng })
    } catch (err) {
      setError(apiError(err, 'Could not register'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="mb-6 flex flex-col items-center text-center">
        <Link to="/" className="mb-2 font-display text-3xl font-semibold text-stone-800">Suq<b className="text-brand-500">na</b></Link>
        <IconBuildingStore className="h-9 w-9 text-brand-500" />
        <h1 className="mt-2 text-2xl font-bold">Register your shop</h1>
        <p className="text-sm text-stone-600">List your goods or services and reach customers nearby</p>
      </div>
      <form onSubmit={submit} className="card space-y-5 p-6">
        {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Your name"><input className="input" value={form.name} onChange={set('name')} required /></Field>
          <Field label="Business name"><input className="input" value={form.business_name} onChange={set('business_name')} required /></Field>
          <Field label="Email"><input type="email" className="input" value={form.email} onChange={set('email')} /></Field>
          <Field label="Phone"><input className="input" value={form.phone} onChange={set('phone')} placeholder="080…" /></Field>
          <Field label="Password"><input type="password" className="input" value={form.password} onChange={set('password')} required minLength={6} /></Field>
          <Field label="Category">
            <select className="input" value={form.category_id} onChange={set('category_id')} required>
              <option value="">Choose a category…</option>
              {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
        </div>

        <Field label="What do you sell? (description)">
          <textarea className="input" rows={2} value={form.description} onChange={set('description')} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Address" >
            <input className="input" value={form.address} onChange={set('address')} required placeholder="Street / market" />
          </Field>
          <Field label="City"><input className="input" value={form.city} onChange={set('city')} /></Field>
          <Field label="State"><input className="input" value={form.state} onChange={set('state')} /></Field>
        </div>

        <Field label="Shop location (GPS)">
          <LocationPicker value={loc} onChange={setLoc} />
        </Field>

        <button className="btn-primary w-full" disabled={loading}>
          {loading && <Spinner className="h-4 w-4" />} Create vendor account
        </button>
        <p className="text-center text-sm text-stone-600">
          Your shop will be reviewed by an admin before going live. Already registered?{' '}
          <Link to="/login" className="font-semibold text-brand-600">Sign in</Link>
        </p>
      </form>
    </div>
  )
}
