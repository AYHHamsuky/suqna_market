// Lightweight client-side "recently viewed" list (no backend needed).
const KEY = 'suqna-recent'
const MAX = 8

export function getRecent() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || []
  } catch {
    return []
  }
}

export function pushRecent(listing) {
  if (!listing?.id) return
  const item = {
    id: listing.id,
    name: listing.name,
    images: (listing.images || []).slice(0, 1),
    pricing_mode: listing.pricing_mode,
    price: listing.price,
    price_min: listing.price_min,
    price_max: listing.price_max,
    price_unit: listing.price_unit,
    vendor: listing.vendor
      ? { business_name: listing.vendor.business_name, slug: listing.vendor.slug, rating_avg: listing.vendor.rating_avg }
      : null,
  }
  try {
    const list = getRecent().filter((x) => x.id !== item.id)
    list.unshift(item)
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)))
  } catch {
    /* ignore quota / private-mode errors */
  }
}
