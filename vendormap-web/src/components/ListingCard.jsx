import { useState } from 'react'
import { Link } from 'react-router-dom'
import { IconMapPin, IconStarFilled, IconPhoto } from '@tabler/icons-react'
import { naira, km, priceLabel, img } from '../lib/format'

const badgeStyles = {
  cheapest: 'bg-green-100 text-green-700',
  closest: 'bg-sky-100 text-sky-700',
  rated: 'bg-amber-100 text-amber-700',
}

export default function ListingCard({ listing, badge }) {
  const v = listing.vendor
  const image = img(listing.images?.[0])
  const [broken, setBroken] = useState(false)
  return (
    <Link to={`/listings/${listing.id}`} className="card group overflow-hidden transition hover:shadow-md">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-brand-500/10 to-stone-100">
        {image && !broken ? (
          <img src={image} alt={listing.name} loading="lazy" onError={() => setBroken(true)} className="h-full w-full object-cover transition group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-brand-200">
            <IconPhoto size={40} />
          </div>
        )}
        {badge && (
          <span className={`badge absolute left-2 top-2 ${badgeStyles[badge.type] || 'bg-stone-100'}`}>
            {badge.label}
          </span>
        )}
        {listing.is_featured && (
          <span className="badge absolute right-2 top-2 bg-brand-600 text-white">Featured</span>
        )}
      </div>
      <div className="p-3">
        <h3 className="truncate font-semibold text-stone-800">{listing.name}</h3>
        <p className="mt-0.5 text-sm font-bold text-brand-700">{priceLabel(listing)}</p>
        {v && (
          <div className="mt-2 flex items-center justify-between text-xs text-stone-600">
            <span className="truncate">{v.business_name}</span>
            <span className="flex shrink-0 items-center gap-2">
              {v.rating_avg > 0 && (
                <span className="flex items-center gap-0.5">
                  <IconStarFilled size={12} className="text-amber-400" />
                  {Number(v.rating_avg).toFixed(1)}
                </span>
              )}
              {listing.distance_km != null && (
                <span className="flex items-center gap-0.5">
                  <IconMapPin size={12} /> {km(listing.distance_km)}
                </span>
              )}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
