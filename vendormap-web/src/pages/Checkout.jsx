import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { IconCreditCard } from '@tabler/icons-react'
import api, { apiError } from '../lib/api'
import { useCartStore } from '../store/cart'
import { naira } from '../lib/format'
import { Field, Spinner } from '../components/ui'
import { toast } from '../components/Toast'

export default function Checkout() {
  const navigate = useNavigate()
  const { vendor, items, subtotal, clear } = useCartStore()
  const [deliveryType, setDeliveryType] = useState('pickup')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  if (!items.length) return <Navigate to="/cart" replace />

  const placeOrder = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // 1. Create the order.
      const { data: orderRes } = await api.post('/customer/orders', {
        items: items.map((i) => ({ listing_id: i.listing_id, quantity: i.quantity })),
        delivery_type: deliveryType,
        delivery_address: deliveryType === 'delivery' ? address : null,
        notes,
      })
      const order = orderRes.data

      // 2. Initiate payment.
      const { data: payRes } = await api.post('/checkout/initiate', { order_id: order.id })
      clear()
      // Redirect to gateway (mock page lives in this SPA).
      const url = payRes.data.authorization_url
      if (url.startsWith('http') && !url.includes(window.location.host)) window.location.href = url
      else navigate(url.replace(window.location.origin, ''))
    } catch (err) {
      toast.error(apiError(err, 'Checkout failed'))
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-xl font-bold">Checkout</h1>
      <form onSubmit={placeOrder} className="space-y-5">
        <div className="card p-4">
          <p className="mb-3 font-semibold">Order summary {vendor && <span className="font-normal text-stone-600">· {vendor.business_name}</span>}</p>
          <ul className="space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.listing_id} className="flex justify-between">
                <span>{i.name} × {i.quantity}{i.unit ? ` ${i.unit}` : ''}</span>
                <span className="font-medium">{naira(i.unit_price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-stone-200 pt-3 text-lg font-bold">
            <span>Total</span><span>{naira(subtotal())}</span>
          </div>
        </div>

        <div className="card space-y-4 p-4">
          <Field label="Fulfilment">
            <div className="flex gap-2">
              {['pickup', 'delivery'].map((t) => (
                <button key={t} type="button" onClick={() => setDeliveryType(t)}
                  className={`btn flex-1 capitalize ${deliveryType === t ? 'bg-brand-600 text-white' : 'border border-stone-300 bg-white text-stone-600'}`}>
                  {t}
                </button>
              ))}
            </div>
          </Field>
          {deliveryType === 'delivery' && (
            <Field label="Delivery address">
              <textarea className="input" rows={2} value={address} onChange={(e) => setAddress(e.target.value)} required />
            </Field>
          )}
          <Field label="Notes for the vendor (optional)">
            <textarea className="input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
        </div>

        <button className="btn-primary w-full py-3" disabled={loading}>
          {loading ? <Spinner className="h-4 w-4" /> : <IconCreditCard size={18} />} Pay {naira(subtotal())}
        </button>
        <p className="text-center text-xs text-stone-500">Secured via Paystack (sandbox mode in this demo).</p>
      </form>
    </div>
  )
}
