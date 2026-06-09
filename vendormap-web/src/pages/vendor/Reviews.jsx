import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { IconStar } from '@tabler/icons-react'
import api, { apiError } from '../../lib/api'
import { datefmt } from '../../lib/format'
import { PageLoader, Empty, StarRating, Spinner } from '../../components/ui'
import { toast } from '../../components/Toast'

export default function VendorReviews() {
  const qc = useQueryClient()
  const [replyId, setReplyId] = useState(null)
  const [reply, setReply] = useState('')
  const [busy, setBusy] = useState(false)
  const { data, isLoading } = useQuery({ queryKey: ['vendor-reviews'], queryFn: async () => (await api.get('/vendor/reviews')).data })

  const submitReply = async (id) => {
    setBusy(true)
    try {
      await api.post(`/vendor/reviews/${id}/reply`, { vendor_reply: reply })
      toast.success('Reply posted')
      setReplyId(null); setReply('')
      qc.invalidateQueries({ queryKey: ['vendor-reviews'] })
    } catch (e) { toast.error(apiError(e)) } finally { setBusy(false) }
  }

  if (isLoading) return <PageLoader />
  const reviews = data?.data || []

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-2xl font-bold">Reviews</h1>
      {reviews.length === 0 ? <Empty title="No reviews yet" icon={IconStar} /> : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-sm font-bold text-stone-600">{r.customer?.name?.[0]}</span>
                  <div><p className="text-sm font-semibold">{r.customer?.name}</p><p className="text-xs text-stone-500">{datefmt(r.created_at)}</p></div>
                </div>
                <StarRating value={r.rating} />
              </div>
              {r.body && <p className="mt-2 text-sm text-stone-600">{r.body}</p>}

              {r.vendor_reply ? (
                <div className="mt-2 rounded-lg bg-stone-50 p-3 text-sm">
                  <p className="font-semibold text-stone-700">Your reply</p>
                  <p className="text-stone-600">{r.vendor_reply}</p>
                </div>
              ) : replyId === r.id ? (
                <div className="mt-2 space-y-2">
                  <textarea className="input" rows={2} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a public reply…" />
                  <div className="flex gap-2">
                    <button onClick={() => submitReply(r.id)} disabled={busy} className="btn-primary">{busy && <Spinner className="h-4 w-4" />} Post reply</button>
                    <button onClick={() => setReplyId(null)} className="btn-outline">Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => { setReplyId(r.id); setReply('') }} className="btn-ghost mt-2 text-sm">Reply</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
