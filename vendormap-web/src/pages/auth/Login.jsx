import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { IconMapPin2 } from '@tabler/icons-react'
import { useAuthActions } from '../../lib/useAuthActions'
import { apiError } from '../../lib/api'
import { Field, Spinner } from '../../components/ui'

export default function Login() {
  const { login } = useAuthActions()
  const [form, setForm] = useState({ login: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.login, form.password)
    } catch (err) {
      setError(apiError(err, 'Could not sign in'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md py-8">
      <div className="mb-6 flex flex-col items-center text-center">
        <Link to="/" className="font-display text-4xl font-semibold text-stone-800">Suq<b className="text-brand-500">na</b></Link>
        <h1 className="mt-3 text-2xl font-bold">Welcome back</h1>
        <p className="text-sm text-stone-600">Sign in to your Suqna account</p>
      </div>
      <form onSubmit={submit} className="card space-y-4 p-6">
        {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
        <Field label="Email or phone">
          <input className="input" value={form.login} onChange={(e) => setForm({ ...form, login: e.target.value })} required />
        </Field>
        <Field label="Password">
          <input type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </Field>
        <button className="btn-primary w-full" disabled={loading}>
          {loading && <Spinner className="h-4 w-4" />} Sign in
        </button>
        <div className="space-y-1 text-center text-sm text-stone-600">
          <p>New customer? <Link to="/register" className="font-semibold text-brand-600">Create account</Link></p>
          <p>Want to sell? <Link to="/register/vendor" className="font-semibold text-brand-600">Register your shop</Link></p>
        </div>
      </form>
      <div className="mt-4 rounded-lg bg-stone-100 p-3 text-center text-xs text-stone-600">
        <p className="font-semibold">Demo logins (password: <code>password</code>)</p>
        <p>admin@suqna.ng · vendor@suqna.ng · customer@suqna.ng</p>
      </div>
    </div>
  )
}
