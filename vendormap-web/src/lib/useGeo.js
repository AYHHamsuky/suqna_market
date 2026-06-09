import { useEffect, useState } from 'react'
import { KADUNA } from './leaflet'

const KEY = 'vendormap-geo'

/** User geolocation with Kaduna fallback, cached in localStorage. */
export function useGeo() {
  const [coords, setCoords] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY))
      if (saved?.lat && saved?.lng) return saved
    } catch {}
    return KADUNA
  })
  const [located, setLocated] = useState(false)

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        // Only trust positions roughly within Nigeria; otherwise keep Kaduna.
        if (c.lat > 3 && c.lat < 14.5 && c.lng > 2 && c.lng < 15.5) {
          setCoords(c)
          setLocated(true)
          localStorage.setItem(KEY, JSON.stringify(c))
        }
      },
      () => {},
      { timeout: 8000 },
    )
  }, [])

  return { coords, setCoords, located }
}
