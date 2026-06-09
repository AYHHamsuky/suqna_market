import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { vendorIcon, meIcon, KADUNA } from '../lib/leaflet'
import { km, priceLabel, naira } from '../lib/format'
import { IconStarFilled } from '@tabler/icons-react'

function Recenter({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center?.lat && center?.lng) map.setView([center.lat, center.lng])
  }, [center?.lat, center?.lng]) // eslint-disable-line
  return null
}

export default function MapView({ vendors = [], center = KADUNA, me, onPinClick, height = '100%' }) {
  return (
    <div style={{ height }} className="overflow-hidden rounded-xl border border-stone-200">
      <MapContainer center={[center.lat, center.lng]} zoom={13} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Recenter center={center} />
        {me && <Marker position={[me.lat, me.lng]} icon={meIcon()} />}
        {vendors.map((v) => (
          <Marker
            key={v.id}
            position={[Number(v.latitude), Number(v.longitude)]}
            icon={vendorIcon()}
            eventHandlers={onPinClick ? { click: () => onPinClick(v) } : undefined}
          >
            <Popup>
              <div className="min-w-[180px]">
                <p className="font-semibold text-stone-800">{v.business_name}</p>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-stone-600">
                  {v.rating_avg > 0 && (
                    <span className="flex items-center gap-0.5">
                      <IconStarFilled size={12} className="text-amber-400" /> {Number(v.rating_avg).toFixed(1)}
                    </span>
                  )}
                  {v.distance_km != null && <span>{km(v.distance_km)} away</span>}
                </div>
                {v.top_listing && (
                  <p className="mt-1 text-xs text-stone-600">
                    {v.top_listing.name} · <span className="font-medium text-brand-700">{priceLabel(v.top_listing)}</span>
                  </p>
                )}
                <div className="mt-2 flex gap-2">
                  <Link to={`/vendors/${v.slug}`} className="text-xs font-semibold text-brand-600 hover:underline">
                    View shop
                  </Link>
                  <a
                    className="text-xs font-semibold text-sky-600 hover:underline"
                    href={`https://www.google.com/maps/dir/?api=1&destination=${v.latitude},${v.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Directions
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
