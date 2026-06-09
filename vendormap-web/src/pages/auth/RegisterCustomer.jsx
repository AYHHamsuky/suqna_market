import { useState } from 'react'
import { Link } from 'react-router-dom'
import { IconUserPlus } from '@tabler/icons-react'
import { useAuthActions } from '../../lib/useAuthActions'
import { apiError } from '../../lib/api'
import { Field, Spinner } from '../../components/ui'

export default function RegisterCustomer() {
  const { registerCustomer } = useAuthActions()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await registerCustomer(form)
    } catch (err) {
      setError(apiError(err, 'Could not register'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md py-8">
      <div className="mb-6 flex flex-col items-center text-center">
        <Link to="/" className="mb-2 font-display text-3xl font-semibold text-stone-800">Suq<b className="text-brand-500">na</b></Link>
        <IconUserPlus className="h-9 w-9 text-brand-500" />
        <h1 className="mt-2 text-2xl font-bold">Create your account</h1>
        <p className="text-sm text-stone-600">Find and order from vendors near you</p>
      </div>
      <form onSubmit={submit} className="card space-y-4 p-6">
        {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
        <Field label="Full name">
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </Field>
        <Field label="Email" hint="Provide email or phone">
          <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field label="Phone">
          <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="080…" />
        </Field>
        <Field label="Password">
          <input type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
        </Field>
        <button className="btn-primary w-full" disabled={loading}>
          {loading && <Spinner className="h-4 w-4" />} Create account
        </button>
        <p className="text-center text-sm text-stone-600">
          Already have an account? <Link to="/login" className="font-semibold text-brand-600">Sign in</Link>
        </p>
      </form>
    </div>
  )
}
