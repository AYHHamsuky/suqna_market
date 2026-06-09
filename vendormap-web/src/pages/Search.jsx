import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { IconList, IconMap2, IconAdjustmentsHorizontal } from '@tabler/icons-react'
import api from '../lib/api'
import { useGeo } from '../lib/useGeo'
import { useCategories } from '../lib/queries'
import ListingCard from '../components/ListingCard'
import MapView from '../components/MapView'
import { PageLoader, Empty } from '../components/ui'

const SORTS = [
  { v: 'relevance', l: 'Best match' },
  { v: 'distance', l: 'Nearest first' },
  { v: 'price', l: 'Cheapest first' },
  { v: 'rating', l: 'Highest rated' },
  { v: 'newest', l: 'Newest' },
]

export default function Search() {
  const [params, setParams] = useSearchParams()
  const { coords } = useGeo()
  const { data: categories } = useCategories()

  const q = params.get('q') || ''
  const category = params.get('category') || ''
  const view = params.get('view') || 'list'
  const sort = params.get('sort') || (q ? 'relevance' : 'distance')
  const radius = params.get('radius') || '15'
  const priceMax = params.get('price_max') || ''
  const minRating = params.get('min_rating') || ''

  const setParam = (k, v) => {
    const next = new URLSearchParams(params)
    if (v === '' || v == null) next.delete(k)
    else next.set(k, v)
    setParams(next)
  }

  const queryParams = {
    q, category, sort,
    lat: coords.lat, lng: coords.lng, radius_km: radius,
    price_max: priceMax, min_rating: minRating, per_page: 40,
  }

  const { data, isLoading } = useQuery({
    queryKey: ['search-listings', queryParams],
    queryFn: async () => (await api.get('/listings', { params: queryParams })).data,
  })

  const { data: mapVendors } = useQuery({
    queryKey: ['search-map', { q, lat: coords.lat, lng: coords.lng, radius }],
    enabled: view === 'map',
    queryFn: async () =>
      (await api.get('/vendors/map', { params: { q, lat: coords.lat, lng: coords.lng, radius_km: radius } })).data.data,
  })

  const listings = data?.data || []

  // Price comparison badges across the result set.
  const badges = useMemo(() => {
    const priced = listings.filter((l) => l.effective_price != null)
    const cheapest = priced.length ? priced.reduce((a, b) => (a.effective_price <= b.effective_price ? a : b)) : null
    const withDist = listings.filter((l) => l.distance_km != null)
    const closest = withDist.length ? withDist.reduce((a, b) => (a.distance_km <= b.distance_km ? a : b)) : null
    const rated = listings.filter((l) => l.vendor?.rating_avg > 0)
    const best = rated.length ? rated.reduce((a, b) => (a.vendor.rating_avg >= b.vendor.rating_avg ? a : b)) : null
    const map = {}
    if (cheapest) map[cheapest.id] = { type: 'cheapest', label: 'Cheapest' }
    if (closest && !map[closest.id]) map[closest.id] = { type: 'closest', label: 'Closest' }
    if (best && !map[best.id]) map[best.id] = { type: 'rated', label: 'Top rated' }
    return map
  }, [listings])

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">{q ? `Results for “${q}”` : category ? categoryName(categories, category) : 'Browse vendors'}</h1>
          <p className="text-sm text-stone-600">{data ? `${data.total} listings within ${radius} km` : 'Searching…'}</p>
        </div>
        <div className="flex gap-1 rounded-lg border border-stone-300 bg-white p-0.5">
          <button onClick={() => setParam('view', 'list')} className={`btn px-3 py-1.5 ${view === 'list' ? 'bg-brand-600 text-white' : 'text-stone-600'}`}><IconList size={16} /> List</button>
          <button onClick={() => setParam('view', 'map')} className={`btn px-3 py-1.5 ${view === 'map' ? 'bg-brand-600 text-white' : 'text-stone-600'}`}><IconMap2 size={16} /> Map</button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        {/* Filters */}
        <aside className="card h-fit space-y-4 p-4">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-stone-700"><IconAdjustmentsHorizontal size={16} /> Filters</p>

          <div>
            <label className="label">Category</label>
            <select className="input" value={category} onChange={(e) => setParam('category', e.target.value)}>
              <option value="">All categories</option>
              {categories?.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Within {radius} km</label>
            <input type="range" min="1" max="50" value={radius} onChange={(e) => setParam('radius', e.target.value)} className="w-full accent-brand-600" />
          </div>

          <div>
            <label className="label">Max price (₦)</label>
            <input type="number" className="input" placeholder="Any" value={priceMax} onChange={(e) => setParam('price_max', e.target.value)} />
          </div>

          <div>
            <label className="label">Minimum rating</label>
            <select className="input" value={minRating} onChange={(e) => setParam('min_rating', e.target.value)}>
              <option value="">Any rating</option>
              <option value="4">4★ & up</option>
              <option value="3">3★ & up</option>
            </select>
          </div>

          <div>
            <label className="label">Sort by</label>
            <select className="input" value={sort} onChange={(e) => setParam('sort', e.target.value)}>
              {SORTS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
            </select>
          </div>
        </aside>

        {/* Results */}
        <div>
          {view === 'map' ? (
            <MapView vendors={mapVendors || []} center={coords} me={coords} height="70vh" />
          ) : isLoading ? (
            <PageLoader />
          ) : listings.length === 0 ? (
            <Empty title="No vendors found" subtitle="Try a different search term, widen the radius, or clear filters." icon={IconMap2} />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {listings.map((l) => <ListingCard key={l.id} listing={l} badge={badges[l.id]} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function categoryName(categories, slug) {
  return categories?.find((c) => c.slug === slug)?.name || 'Browse vendors'
}
