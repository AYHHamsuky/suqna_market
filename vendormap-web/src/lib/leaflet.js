import L from 'leaflet'

// Kaduna city centre — default map focus.
export const KADUNA = { lat: 10.5105, lng: 7.4165 }

/** Brand-coloured teardrop pin as a div icon (avoids bundler image issues). */
export function vendorIcon(active = false) {
  const color = active ? '#c2410c' : '#ea580c'
  return L.divIcon({
    className: 'vendor-pin',
    html: `<div style="
      width:28px;height:28px;border-radius:50% 50% 50% 0;
      background:${color};transform:rotate(-45deg);
      border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.35);
      display:flex;align-items:center;justify-content:center;">
      <div style="width:8px;height:8px;border-radius:50%;background:white;transform:rotate(45deg)"></div>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  })
}

/** Blue dot for the user's own location. */
export function meIcon() {
  return L.divIcon({
    className: 'me-pin',
    html: `<div style="width:16px;height:16px;border-radius:50%;background:#2563eb;border:3px solid white;box-shadow:0 0 0 4px rgba(37,99,235,.25)"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}
