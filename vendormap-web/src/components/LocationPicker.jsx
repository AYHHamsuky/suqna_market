import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import { vendorIcon, KADUNA } from '../lib/leaflet'
import { IconCurrentLocation } from '@tabler/icons-react'

function ClickCapture({ onPick }) {
  useMapEvents({ click(e) { onPick(e.latlng.lat, e.latlng.lng) } })
  return null
}

function Fly({ center }) {
  const map = useMap()
  useEffect(() => { if (center) map.setView([center.lat, center.lng], 15) }, [center?.lat, center?.lng]) // eslint-disable-line
  return null
}

export default function LocationPicker({ value, onChange, height = 260 }) {
  const point = value?.lat && value?.lng ? value : null
  const center = point || KADUNA

  const locate = () => {
    navigator.geolocation?.getCurrentPosition((pos) =>
      onChange({ lat: +pos.coords.latitude.toFixed(6), lng: +pos.coords.longitude.toFixed(6) }),
    )
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-lg border border-stone-300" style={{ height }}>
        <MapContainer center={[center.lat, center.lng]} zoom={point ? 15 : 12} className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
          <ClickCapture onPick={(lat, lng) => onChange({ lat: +lat.toFixed(6), lng: +lng.toFixed(6) })} />
          <Fly center={point} />
          {point && <Marker position={[point.lat, point.lng]} icon={vendorIcon(true)} />}
        </MapContainer>
        <button
          type="button"
          onClick={locate}
          className="absolute right-2 top-2 z-[400] flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-xs font-semibold shadow"
        >
          <IconCurrentLocation size={14} /> Use my location
        </button>
      </div>
      <p className="mt-1 text-xs text-stone-500">
        Tap the map to drop your shop pin. {point ? `Selected: ${point.lat}, ${point.lng}` : 'No location set yet.'}
      </p>
    </div>
  )
}
