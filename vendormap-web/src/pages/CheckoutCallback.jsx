import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { IconCircleCheck, IconCircleX } from '@tabler/icons-react'
import api from '../lib/api'
import { PageLoader } from '../components/ui'

export default function CheckoutCallback() {
  const [params] = useSearchParams()
  const reference = params.get('reference')
  const [state, setState] = useState({ loading: true, status: null, order: null })

  useEffect(() => {
    let active = true
    api.post('/payments/verify', { reference })
      .then(({ data }) => active && setState({ loading: false, status: data.data.status, order: data.data.order }))
      .catch(() => active && setState({ loading: false, status: 'failed', order: null }))
    return () => { active = false }
  }, [reference])

  if (state.loading) return <PageLoader />

  const ok = state.status === 'success'
  return (
    <div className="mx-auto max-w-md py-12 text-center">
      {ok ? <IconCircleCheck className="mx-auto h-16 w-16 text-green-500" /> : <IconCircleX className="mx-auto h-16 w-16 text-red-500" />}
      <h1 className="mt-4 text-2xl font-bold">{ok ? 'Payment successful' : 'Payment not completed'}</h1>
      <p className="mt-1 text-stone-600">
        {ok ? `Your order ${state.order?.reference || ''} is confirmed and the vendor has been notified.` : 'Your payment was cancelled or failed. You can try again from your cart.'}
      </p>
      <div className="mt-6 flex justify-center gap-2">
        {ok && state.order && <Link to={`/orders/${state.order.id}`} className="btn-primary">View order</Link>}
        <Link to="/orders" className="btn-outline">My orders</Link>
        <Link to="/search" className="btn-ghost">Keep shopping</Link>
      </div>
    </div>
  )
}
