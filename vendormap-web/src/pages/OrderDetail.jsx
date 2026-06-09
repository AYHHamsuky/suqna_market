import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { IconCreditCard, IconMessage, IconStar, IconRepeat } from '@tabler/icons-react'
import api, { apiError } from '../lib/api'
import { naira, datetimefmt, statusColor } from '../lib/format'
import { PageLoader, StarRating, Field, Spinner, Modal } from '../components/ui'
import { toast } from '../components/Toast'
import { useCartStore } from '../store/cart'

const STEPS = ['pending', 'confirmed', 'preparing', 'ready', 'completed']

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [reviewOpen, setReviewOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const cart = useCartStore()

  const { data, isLoading } = useQuery({ queryKey: ['order', id], queryFn: async () => (await api.get(`/customer/orders/${id}`)).data.data })
  if (isLoading) return <PageLoader />
  const o = data
  if (!o) return null

  const stepIndex = STEPS.indexOf(o.status === 'dispatched' ? 'ready' : o.status)

  const pay = async () => {
    setBusy(true)
    try {
      const { data: payRes } = await api.post('/checkout/initiate', { order_id: o.id })
      const url = payRes.data.authorization_url
      navigate(url.replace(window.location.origin, ''))
    } catch (e) { toast.error(apiError(e)); setBusy(false) }
  }

  const chat = async () => {
    try {
      const { data } = await api.post('/conversations', { vendor_id: o.vendor.id, order_id: o.id })
      navigate(`/messages/${data.data.id}`)
    } catch (e) { toast.error(apiError(e)) }
  }

  const reorder = () => {
    if (!o.items?.length) return
    cart.clear()
    o.items.forEach((it) =>
      cart.add(
        { id: o.vendor.id, business_name: o.vendor.business_name, slug: o.vendor.slug },
        { id: it.listing_id, name: it.listing_name, effective_price: Number(it.unit_price), price_unit: it.unit, pricing_mode: 'fixed', images: [] },
        Number(it.quantity),
      ),
    )
    toast.success('Items added to your cart')
    navigate('/cart')
  }

  const submitReview = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      await api.post('/customer/reviews', { order_id: o.id, rating, body })
      toast.success('Review submitted')
      setReviewOpen(false)
      qc.invalidateQueries({ queryKey: ['order', id] })
    } catch (e) { toast.error(apiError(e)) } finally { setBusy(false) }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/orders" className="text-sm text-stone-500 hover:text-brand-600">← Back to orders</Link>
      <div className="mt-2 mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{o.reference}</h1>
          <p className="text-sm text-stone-600">{o.vendor?.business_name} · {datetimefmt(o.created_at)}</p>
        </div>
        <span className={`badge capitalize ${statusColor(o.status)}`}>{o.status}</span>
      </div>

      {/* Progress */}
      {!['cancelled', 'disputed'].includes(o.status) && (
        <div className="card mb-4 flex justify-between p-4">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 flex-col items-center">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${i <= stepIndex ? 'bg-brand-600 text-white' : 'bg-stone-100 text-stone-500'}`}>{i + 1}</div>
              <span className={`mt-1 text-[10px] capitalize ${i <= stepIndex ? 'text-brand-700' : 'text-stone-500'}`}>{s}</span>
            </div>
          ))}
        </div>
      )}

      {/* Items */}
      <div className="card p-4">
        <p className="mb-2 font-semibold">Items</p>
        <ul className="space-y-2 text-sm">
          {o.items?.map((it) => (
            <li key={it.id} className="flex justify-between">
              <span>{it.listing_name} × {it.quantity}{it.unit ? ` ${it.unit}` : ''}</span>
              <span className="font-medium">{naira(it.subtotal)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-stone-200 pt-3 font-bold">
          <span>Total</span><span>{naira(o.subtotal)}</span>
        </div>
        {o.delivery_type === 'delivery' && o.delivery_address && (
          <p className="mt-2 text-xs text-stone-600">Deliver to: {o.delivery_address}</p>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        {o.status === 'pending' && (
          <button onClick={pay} disabled={busy} className="btn-primary flex-1">
            {busy ? <Spinner className="h-4 w-4" /> : <IconCreditCard size={16} />} Pay now
          </button>
        )}
        <button onClick={chat} className="btn-outline flex-1"><IconMessage size={16} /> Message vendor</button>
        {o.status === 'completed' && !o.review && (
          <button onClick={() => setReviewOpen(true)} className="btn-primary flex-1"><IconStar size={16} /> Leave a review</button>
        )}
        {o.status !== 'pending' && (
          <button onClick={reorder} className="btn-outline flex-1"><IconRepeat size={16} /> Reorder</button>
        )}
      </div>

      {o.review && (
        <div className="card mt-4 p-4">
          <p className="mb-1 font-semibold">Your review</p>
          <StarRating value={o.review.rating} />
          {o.review.body && <p className="mt-1 text-sm text-stone-600">{o.review.body}</p>}
        </div>
      )}

      <Modal open={reviewOpen} onClose={() => setReviewOpen(false)} title="Rate your order">
        <form onSubmit={submitReview} className="space-y-4">
          <div className="flex justify-center"><StarRating value={rating} size={32} onChange={setRating} /></div>
          <Field label="Your review (optional)">
            <textarea className="input" rows={3} value={body} onChange={(e) => setBody(e.target.value)} placeholder="How was it?" />
          </Field>
          <button className="btn-primary w-full" disabled={busy}>{busy && <Spinner className="h-4 w-4" />} Submit review</button>
        </form>
      </Modal>
    </div>
  )
}
