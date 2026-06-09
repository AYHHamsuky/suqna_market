import { Link, useNavigate } from 'react-router-dom'
import { IconTrash, IconShoppingCart, IconMinus, IconPlus } from '@tabler/icons-react'
import { useCartStore } from '../store/cart'
import { useAuthStore } from '../store/auth'
import { naira } from '../lib/format'
import { Empty } from '../components/ui'

export default function Cart() {
  const navigate = useNavigate()
  const { token } = useAuthStore()
  const { vendor, items, setQuantity, remove, subtotal } = useCartStore()

  if (!items.length) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <Empty title="Your cart is empty" subtitle="Find vendors near you and add items to get started." icon={IconShoppingCart}
          action={<Link to="/search" className="btn-primary">Browse vendors</Link>} />
      </div>
    )
  }

  const checkout = () => navigate(token ? '/checkout' : '/login')

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 text-xl font-bold">Your cart</h1>
      {vendor && <p className="mb-4 text-sm text-stone-600">From <Link to={`/vendors/${vendor.slug}`} className="font-semibold text-brand-600">{vendor.business_name}</Link></p>}

      <div className="space-y-3">
        {items.map((i) => (
          <div key={i.listing_id} className="card flex items-center gap-3 p-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{i.name}</p>
              <p className="text-sm text-brand-700">{naira(i.unit_price)}{i.unit ? ` / ${i.unit}` : ''}</p>
            </div>
            <div className="flex items-center rounded-lg border border-stone-300">
              <button className="px-2 py-1.5 text-stone-600" onClick={() => setQuantity(i.listing_id, +(i.quantity - 1).toFixed(2))}><IconMinus size={14} /></button>
              <input className="w-12 border-x border-stone-200 py-1.5 text-center text-sm outline-none" value={i.quantity}
                onChange={(e) => setQuantity(i.listing_id, Math.max(0.01, +e.target.value || 1))} />
              <button className="px-2 py-1.5 text-stone-600" onClick={() => setQuantity(i.listing_id, +(i.quantity + 1).toFixed(2))}><IconPlus size={14} /></button>
            </div>
            <p className="w-20 text-right font-semibold">{naira(i.unit_price * i.quantity)}</p>
            <button onClick={() => remove(i.listing_id)} className="p-1 text-stone-500 hover:text-red-500"><IconTrash size={18} /></button>
          </div>
        ))}
      </div>

      <div className="card mt-4 p-4">
        <div className="flex items-center justify-between text-lg font-bold">
          <span>Subtotal</span>
          <span>{naira(subtotal())}</span>
        </div>
        <p className="mt-1 text-xs text-stone-500">Commission is deducted from the vendor's payout, not added to your total.</p>
        <button onClick={checkout} className="btn-primary mt-3 w-full">Proceed to checkout</button>
      </div>
    </div>
  )
}
