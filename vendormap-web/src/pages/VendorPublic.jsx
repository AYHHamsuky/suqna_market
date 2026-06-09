import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { IconStarFilled, IconMapPin, IconClock, IconMessage, IconPhone, IconDirections } from '@tabler/icons-react'
import api, { apiError } from '../lib/api'
import { km, img, datefmt } from '../lib/format'
import { useAuthStore } from '../store/auth'
import { toast } from '../components/Toast'
import { PageLoader, StarRating, Empty } from '../components/ui'
import ListingCard from '../components/ListingCard'
import MapView from '../components/MapView'

export default function VendorPublic() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { token } = useAuthStore()

  const { data: vd, isLoading } = useQuery({ queryKey: ['vendor', slug], queryFn: async () => (await api.get(`/vendors/${slug}`)).data.data })
  const { data: listings } = useQuery({ queryKey: ['vendor-listings', slug], queryFn: async () => (await api.get(`/vendors/${slug}/listings`)).data })
  const { data: reviews } = useQuery({ queryKey: ['vendor-reviews', slug], queryFn: async () => (await api.get(`/vendors/${slug}/reviews`)).data })

  if (isLoading) return <PageLoader />
  if (!vd) return null

  const startChat = async () => {
    if (!token) return navigate('/login')
    try {
      const { data } = await api.post('/conversations', { vendor_id: vd.id })
      navigate(`/messages/${data.data.id}`)
    } catch (e) { toast.error(apiError(e)) }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="card overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-brand-500 to-brand-700">
          {vd.banner && <img src={img(vd.banner)} className="h-full w-full object-cover" />}
        </div>
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end">
          <div className="-mt-12 flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border-4 border-white bg-brand-500/20 text-2xl font-bold text-brand-700 shadow">
            {vd.logo ? <img src={img(vd.logo)} className="h-full w-full rounded-lg object-cover" /> : vd.business_name?.[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{vd.business_name}</h1>
              {vd.is_open ? <span className="badge bg-green-100 text-green-700">Open</span> : <span className="badge bg-stone-100 text-stone-600">Closed</span>}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-stone-600">
              <StarRating value={vd.rating_avg} count={vd.rating_count} />
              <span className="flex items-center gap-1"><IconMapPin size={14} /> {vd.address}, {vd.city}</span>
              {vd.category && <span className="badge bg-stone-100 text-stone-600">{vd.category.name}</span>}
            </div>
            {vd.description && <p className="mt-2 text-sm text-stone-600">{vd.description}</p>}
          </div>
          <div className="flex gap-2">
            <button onClick={startChat} className="btn-primary"><IconMessage size={16} /> Chat</button>
            <a className="btn-outline" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${vd.latitude},${vd.longitude}`}>
              <IconDirections size={16} /> Directions
            </a>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        {/* Listings */}
        <div>
          <h2 className="mb-3 text-lg font-bold">Listings ({listings?.total ?? 0})</h2>
          {listings?.data?.length ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {listings.data.map((l) => <ListingCard key={l.id} listing={{ ...l, vendor: vd }} />)}
            </div>
          ) : <Empty title="No listings yet" />}

          {/* Reviews */}
          <h2 className="mb-3 mt-8 text-lg font-bold">Reviews ({reviews?.total ?? 0})</h2>
          <div className="space-y-3">
            {reviews?.data?.length ? reviews.data.map((r) => (
              <div key={r.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-sm font-bold text-stone-600">{r.customer?.name?.[0]}</span>
                    <div>
                      <p className="text-sm font-semibold">{r.customer?.name}</p>
                      <p className="text-xs text-stone-500">{datefmt(r.created_at)}</p>
                    </div>
                  </div>
                  <StarRating value={r.rating} />
                </div>
                {r.body && <p className="mt-2 text-sm text-stone-600">{r.body}</p>}
                {r.vendor_reply && (
                  <div className="mt-2 rounded-lg bg-stone-50 p-3 text-sm">
                    <p className="font-semibold text-stone-700">Reply from {vd.business_name}</p>
                    <p className="text-stone-600">{r.vendor_reply}</p>
                  </div>
                )}
              </div>
            )) : <Empty title="No reviews yet" subtitle="Reviews appear after completed orders." />}
          </div>
        </div>

        {/* Sidebar: map + hours */}
        <aside className="space-y-4">
          <MapView vendors={[vd]} center={{ lat: +vd.latitude, lng: +vd.longitude }} height="220px" />
          {vd.phone && (
            <a href={`tel:${vd.phone}`} className="card flex items-center gap-2 p-3 text-sm font-medium text-stone-700 hover:border-brand-300">
              <IconPhone size={16} className="text-brand-600" /> {vd.phone}
            </a>
          )}
          {vd.operating_hours && (
            <div className="card p-4">
              <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold"><IconClock size={16} /> Opening hours</p>
              <ul className="space-y-1 text-sm text-stone-600">
                {Object.entries(vd.operating_hours).map(([day, h]) => (
                  <li key={day} className="flex justify-between">
                    <span className="capitalize">{day}</span>
                    <span className="text-stone-600">{h?.open ? `${h.open} – ${h.close}` : 'Closed'}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
