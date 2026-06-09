import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  IconMapPin, IconStarFilled, IconMessage, IconShoppingCartPlus, IconHeart, IconHeartFilled, IconPhoto, IconMinus, IconPlus,
} from '@tabler/icons-react'
import api, { apiError } from '../lib/api'
import { naira, km, priceLabel, img } from '../lib/format'
import { useCartStore } from '../store/cart'
import { useAuthStore } from '../store/auth'
import { toast } from '../components/Toast'
import { PageLoader } from '../components/ui'
import ListingCard from '../components/ListingCard'
import { pushRecent } from '../lib/recent'

export default function ListingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token, user } = useAuthStore()
  const add = useCartStore((s) => s.add)
  const [qty, setQty] = useState(1)
  const [activeImg, setActiveImg] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['listing', id],
    queryFn: async () => (await api.get(`/listings/${id}`)).data,
  })

  useEffect(() => { if (data?.data) pushRecent(data.data) }, [data])

  if (isLoading) return <PageLoader />
  if (!data) return null
  const l = data.data
  const v = l.vendor
  const images = (l.images || []).map(img).filter(Boolean)
  const canOrder = l.pricing_mode !== 'ask' && l.is_available

  const addToCart = () => {
    if (!canOrder) return
    const res = add({ id: v.id, business_name: v.business_name, slug: v.slug }, l, qty)
    if (res === 'replaced') toast.info('Started a new cart for this vendor')
    else toast.success('Added to cart')
  }

  const startChat = async () => {
    if (!token) return navigate('/login')
    try {
      const { data } = await api.post('/conversations', { vendor_id: v.id, body: `Hi, I'm interested in "${l.name}".` })
      navigate(`/messages/${data.data.id}`)
    } catch (e) {
      toast.error(apiError(e))
    }
  }

  return (
    <div className="space-y-8">
      <nav className="text-sm text-stone-500">
        <Link to="/search" className="hover:text-brand-600">Search</Link> / <span className="text-stone-600">{l.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="aspect-[4/3] overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
            {images.length ? (
              <img src={images[activeImg]} alt={l.name} onError={(e) => { e.currentTarget.style.display = 'none' }} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-stone-500"><IconPhoto size={56} /></div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-2 flex gap-2">
              {images.map((src, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`h-16 w-16 overflow-hidden rounded-lg border-2 ${i === activeImg ? 'border-brand-500' : 'border-transparent'}`}>
                  <img src={src} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-2xl font-bold">{l.name}</h1>
            {l.category && <span className="badge bg-stone-100 text-stone-600">{l.category.name}</span>}
          </div>
          <p className="mt-2 text-2xl font-bold text-brand-700">{priceLabel(l)}</p>
          {!l.is_available && <p className="mt-1 text-sm font-medium text-red-500">Currently unavailable</p>}

          {l.description && <p className="mt-4 text-stone-600">{l.description}</p>}

          {l.tags?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {l.tags.map((t) => <span key={t} className="badge bg-stone-100 text-stone-600">#{t}</span>)}
            </div>
          )}

          {/* Order controls */}
          {canOrder ? (
            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center rounded-lg border border-stone-300">
                <button className="px-3 py-2 text-stone-600" onClick={() => setQty((q) => Math.max(1, +(q - 1).toFixed(2)))}><IconMinus size={16} /></button>
                <input className="w-14 border-x border-stone-200 py-2 text-center text-sm outline-none" value={qty} onChange={(e) => setQty(Math.max(0.01, +e.target.value || 1))} />
                <button className="px-3 py-2 text-stone-600" onClick={() => setQty((q) => +(q + 1).toFixed(2))}><IconPlus size={16} /></button>
              </div>
              <span className="text-sm text-stone-500">{l.price_unit ? `per ${l.price_unit}` : ''}</span>
              <button onClick={addToCart} className="btn-primary flex-1"><IconShoppingCartPlus size={18} /> Add to cart</button>
            </div>
          ) : l.pricing_mode === 'ask' ? (
            <div className="mt-6 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
              This item is negotiable. Chat with the vendor to agree a price.
            </div>
          ) : null}

          <button onClick={startChat} className="btn-outline mt-3 w-full"><IconMessage size={18} /> Chat with vendor</button>

          {/* Vendor card */}
          {v && (
            <Link to={`/vendors/${v.slug}`} className="card mt-6 flex items-center gap-3 p-4 hover:border-brand-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/20 text-lg font-bold text-brand-700">
                {v.business_name?.[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{v.business_name}</p>
                <div className="flex items-center gap-2 text-xs text-stone-600">
                  {v.rating_avg > 0 && <span className="flex items-center gap-0.5"><IconStarFilled size={12} className="text-amber-400" /> {Number(v.rating_avg).toFixed(1)} ({v.rating_count})</span>}
                  {l.distance_km != null && <span className="flex items-center gap-0.5"><IconMapPin size={12} /> {km(l.distance_km)}</span>}
                  <span>{v.city}</span>
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* More from vendor */}
      {data.more_from_vendor?.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">More from {v.business_name}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {data.more_from_vendor.map((m) => <ListingCard key={m.id} listing={{ ...m, vendor: v }} />)}
          </div>
        </section>
      )}
    </div>
  )
}
