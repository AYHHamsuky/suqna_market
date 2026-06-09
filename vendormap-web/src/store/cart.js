import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Cart holds items from a SINGLE vendor at a time (orders are single-vendor).
 * Adding an item from a different vendor prompts a reset.
 */
export const useCartStore = create(
  persist(
    (set, get) => ({
      vendor: null, // { id, business_name, slug }
      items: [], // { listing_id, name, unit_price, unit, quantity, pricing_mode, image }

      add: (vendor, listing, quantity = 1) => {
        const state = get()
        // Different vendor → replace cart.
        if (state.vendor && state.vendor.id !== vendor.id) {
          set({
            vendor,
            items: [makeItem(listing, quantity)],
          })
          return 'replaced'
        }
        const existing = state.items.find((i) => i.listing_id === listing.id)
        if (existing) {
          set({
            vendor,
            items: state.items.map((i) =>
              i.listing_id === listing.id ? { ...i, quantity: i.quantity + quantity } : i,
            ),
          })
        } else {
          set({ vendor, items: [...state.items, makeItem(listing, quantity)] })
        }
        return 'added'
      },

      setQuantity: (listing_id, quantity) =>
        set((s) => ({
          items: s.items.map((i) => (i.listing_id === listing_id ? { ...i, quantity: Math.max(0.001, quantity) } : i)),
        })),

      remove: (listing_id) =>
        set((s) => {
          const items = s.items.filter((i) => i.listing_id !== listing_id)
          return { items, vendor: items.length ? s.vendor : null }
        }),

      clear: () => set({ vendor: null, items: [] }),

      count: () => get().items.reduce((n, i) => n + 1, 0),
      subtotal: () => get().items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0),
    }),
    { name: 'vendormap-cart' },
  ),
)

function makeItem(listing, quantity) {
  return {
    listing_id: listing.id,
    name: listing.name,
    unit_price: listing.effective_price ?? listing.price ?? listing.price_min ?? 0,
    unit: listing.price_unit,
    pricing_mode: listing.pricing_mode,
    quantity,
    image: listing.images?.[0] ?? null,
  }
}
