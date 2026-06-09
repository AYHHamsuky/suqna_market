import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { IconLock, IconCreditCard } from '@tabler/icons-react'
import api, { apiError } from '../lib/api'
import { Spinner } from '../components/ui'
import { toast } from '../components/Toast'

/** Simulates the Paystack hosted checkout page for local development. */
export default function MockCheckout() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const reference = params.get('reference')
  const orderRef = params.get('order')
  const [loading, setLoading] = useState(false)

  const pay = async (success) => {
    setLoading(true)
    try {
      if (success) {
        await api.post('/payments/verify', { reference })
        navigate(`/checkout/callback?reference=${reference}&status=success`)
      } else {
        navigate(`/checkout/callback?reference=${reference}&status=cancelled`)
      }
    } catch (e) {
      toast.error(apiError(e))
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md py-10">
      <div className="card overflow-hidden">
        <div className="flex items-center gap-2 bg-stone-100 px-5 py-3 text-white">
          <IconLock size={16} /> <span className="font-semibold">Paystack</span>
          <span className="ml-auto text-xs text-stone-500">Sandbox</span>
        </div>
        <div className="p-6 text-center">
          <IconCreditCard className="mx-auto h-10 w-10 text-brand-600" />
          <p className="mt-3 text-sm text-stone-600">Simulated payment for order</p>
          <p className="font-mono font-semibold">{orderRef}</p>
          <p className="mt-1 text-xs text-stone-500">Ref: {reference}</p>

          <div className="mt-6 space-y-2">
            <button onClick={() => pay(true)} disabled={loading} className="btn-primary w-full py-3">
              {loading ? <Spinner className="h-4 w-4" /> : null} Pay successfully
            </button>
            <button onClick={() => pay(false)} disabled={loading} className="btn-outline w-full">Cancel payment</button>
          </div>
          <p className="mt-4 text-xs text-stone-500">In production this is Paystack's real hosted page.</p>
        </div>
      </div>
    </div>
  )
}
