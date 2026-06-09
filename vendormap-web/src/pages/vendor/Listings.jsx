import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { IconPlus, IconEdit, IconTrash, IconPhoto, IconEyeOff } from '@tabler/icons-react'
import api, { apiError } from '../../lib/api'
import { useCategories } from '../../lib/queries'
import { priceLabel, img } from '../../lib/format'
import { PageLoader, Empty, Modal, Field, Spinner } from '../../components/ui'
import { toast } from '../../components/Toast'

const EMPTY = {
  name: '', category_id: '', description: '', pricing_mode: 'fixed',
  price: '', price_min: '', price_max: '', price_unit: '', tags: '', is_available: true, is_featured: false,
}

export default function VendorListings() {
  const qc = useQueryClient()
  const { data: categories } = useCategories()
  const [editing, setEditing] = useState(null) // listing or {} for new
  const { data, isLoading } = useQuery({ queryKey: ['vendor-listings'], queryFn: async () => (await api.get('/vendor/listings')).data })

  const remove = async (l) => {
    if (!confirm(`Delete "${l.name}"?`)) return
    try {
      await api.delete(`/vendor/listings/${l.id}`)
      toast.success('Listing deleted')
      qc.invalidateQueries({ queryKey: ['vendor-listings'] })
    } catch (e) { toast.error(apiError(e)) }
  }

  if (isLoading) return <PageLoader />
  const listings = data?.data || []

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Listings</h1>
        <button onClick={() => setEditing(EMPTY)} className="btn-primary"><IconPlus size={16} /> Add listing</button>
      </div>

      {listings.length === 0 ? (
        <Empty title="No listings yet" subtitle="Add your first product or service." icon={IconPhoto}
          action={<button onClick={() => setEditing(EMPTY)} className="btn-primary">Add listing</button>} />
      ) : (
        <div className="card divide-y divide-stone-200">
          {listings.map((l) => (
            <div key={l.id} className="flex items-center gap-3 p-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                {l.images?.[0] ? <img src={img(l.images[0])} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-stone-500"><IconPhoto size={20} /></div>}
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-semibold">
                  {l.name}
                  {!l.is_available && <span className="badge bg-stone-100 text-stone-600"><IconEyeOff size={11} /> Hidden</span>}
                  {l.is_featured && <span className="badge bg-brand-500/20 text-brand-700">Featured</span>}
                </p>
                <p className="text-sm text-stone-600">{priceLabel(l)} · {l.category?.name}</p>
              </div>
              <button onClick={() => setEditing(l)} className="btn-ghost p-2"><IconEdit size={18} /></button>
              <button onClick={() => remove(l)} className="btn-ghost p-2 text-red-500"><IconTrash size={18} /></button>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <ListingForm
          listing={editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); qc.invalidateQueries({ queryKey: ['vendor-listings'] }) }}
        />
      )}
    </div>
  )
}

function ListingForm({ listing, categories, onClose, onSaved }) {
  const isNew = !listing.id
  const [form, setForm] = useState({
    ...EMPTY, ...listing,
    category_id: listing.category_id || listing.category?.id || '',
    tags: Array.isArray(listing.tags) ? listing.tags.join(', ') : listing.tags || '',
  })
  const [files, setFiles] = useState([])
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const mode = form.pricing_mode

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    const fd = new FormData()
    const fields = ['name', 'category_id', 'description', 'pricing_mode', 'price_unit']
    fields.forEach((f) => fd.append(f, form[f] ?? ''))
    if (mode === 'fixed' || mode === 'per_unit') fd.append('price', form.price || 0)
    if (mode === 'range') { fd.append('price_min', form.price_min || 0); fd.append('price_max', form.price_max || 0) }
    fd.append('is_available', form.is_available ? 1 : 0)
    fd.append('is_featured', form.is_featured ? 1 : 0)
    form.tags.split(',').map((t) => t.trim()).filter(Boolean).forEach((t) => fd.append('tags[]', t))
    files.forEach((f) => fd.append('images[]', f))
    if (!isNew && Array.isArray(listing.images)) listing.images.forEach((u) => fd.append('existing_images[]', u))

    try {
      if (isNew) await api.post('/vendor/listings', fd)
      else { fd.append('_method', 'PUT'); await api.post(`/vendor/listings/${listing.id}`, fd) }
      toast.success(isNew ? 'Listing created' : 'Listing updated')
      onSaved()
    } catch (err) { toast.error(apiError(err)) } finally { setBusy(false) }
  }

  return (
    <Modal open onClose={onClose} title={isNew ? 'Add listing' : 'Edit listing'} wide>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Item name"><input className="input" value={form.name} onChange={set('name')} required /></Field>
          <Field label="Category">
            <select className="input" value={form.category_id} onChange={set('category_id')} required>
              <option value="">Choose…</option>
              {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Description"><textarea className="input" rows={2} value={form.description || ''} onChange={set('description')} /></Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Pricing mode">
            <select className="input" value={mode} onChange={set('pricing_mode')}>
              <option value="fixed">Fixed price</option>
              <option value="range">Price range</option>
              <option value="per_unit">Price per unit</option>
              <option value="ask">Ask vendor (negotiable)</option>
            </select>
          </Field>
          <Field label="Unit (plate, kg, wrap…)"><input className="input" value={form.price_unit || ''} onChange={set('price_unit')} /></Field>
        </div>

        {(mode === 'fixed' || mode === 'per_unit') && (
          <Field label="Price (₦)"><input type="number" className="input" value={form.price || ''} onChange={set('price')} required /></Field>
        )}
        {mode === 'range' && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Min price (₦)"><input type="number" className="input" value={form.price_min || ''} onChange={set('price_min')} required /></Field>
            <Field label="Max price (₦)"><input type="number" className="input" value={form.price_max || ''} onChange={set('price_max')} required /></Field>
          </div>
        )}

        <Field label="Tags (comma separated)" hint="Helps customers find you — e.g. tuwo, swallow, breakfast">
          <input className="input" value={form.tags} onChange={set('tags')} />
        </Field>

        <Field label="Images">
          <input type="file" accept="image/*" multiple onChange={(e) => setFiles([...e.target.files])} className="text-sm" />
          {!isNew && listing.images?.length > 0 && (
            <div className="mt-2 flex gap-2">{listing.images.map((u, i) => <img key={i} src={img(u)} className="h-12 w-12 rounded object-cover" />)}</div>
          )}
        </Field>

        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.is_available} onChange={(e) => setForm({ ...form, is_available: e.target.checked })} /> Available</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} /> Featured</label>
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
          <button className="btn-primary" disabled={busy}>{busy && <Spinner className="h-4 w-4" />} {isNew ? 'Create' : 'Save'}</button>
        </div>
      </form>
    </Modal>
  )
}
