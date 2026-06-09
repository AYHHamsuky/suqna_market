import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { IconSend, IconMessage2 } from '@tabler/icons-react'
import api, { apiError } from '../lib/api'
import { useAuthStore } from '../store/auth'
import { datetimefmt, img } from '../lib/format'
import { PageLoader, Empty } from '../components/ui'
import { toast } from '../components/Toast'

export default function Messages({ embedded }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const [text, setText] = useState('')
  const endRef = useRef(null)
  // In embedded (vendor) mode we select by state instead of URL; otherwise use the URL :id.
  const [embeddedId, setEmbeddedId] = useState(null)
  const activeId = embedded ? embeddedId : id

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => (await api.get('/conversations')).data.data,
    refetchInterval: 8000,
  })

  const { data: thread } = useQuery({
    queryKey: ['conversation', id],
    enabled: !!id,
    refetchInterval: 4000,
    queryFn: async () => (await api.get(`/conversations/${id}/messages`)).data,
  })

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [thread?.messages?.length])

  const send = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    const body = text
    setText('')
    if (!activeId) return
    try {
      await api.post(`/conversations/${activeId}/messages`, { body })
      qc.invalidateQueries({ queryKey: ['conversation', activeId] })
      qc.invalidateQueries({ queryKey: ['conversations'] })
    } catch (e) { toast.error(apiError(e)); setText(body) }
  }

  const { data: embeddedThread } = useQuery({
    queryKey: ['conversation', embeddedId],
    enabled: embedded && !!embeddedId,
    refetchInterval: 4000,
    queryFn: async () => (await api.get(`/conversations/${embeddedId}/messages`)).data,
  })
  const activeThread = embedded ? embeddedThread : thread

  if (isLoading) return <PageLoader />

  const wrapClass = embedded ? 'h-[calc(100vh-160px)]' : 'h-[calc(100vh-180px)]'

  return (
    <div className={`grid gap-4 md:grid-cols-[300px_1fr] ${wrapClass}`}>
      {/* Conversation list */}
      <aside className="card overflow-y-auto">
        <p className="border-b border-stone-200 px-4 py-3 font-semibold">Messages</p>
        {conversations?.length ? conversations.map((c) => {
          const isActive = String(activeId) === String(c.id)
          const name = embedded ? c.customer?.name : c.vendor?.business_name
          return (
            <button
              key={c.id}
              onClick={() => (embedded ? setEmbeddedId(c.id) : navigate(`/messages/${c.id}`))}
              className={`flex w-full items-center gap-3 border-b border-stone-200 px-4 py-3 text-left hover:bg-stone-50 ${isActive ? 'bg-brand-500/10' : ''}`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-sm font-bold text-brand-700">{name?.[0]}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{name}</p>
                <p className="truncate text-xs text-stone-500">{c.last_message?.body || 'No messages yet'}</p>
              </div>
              {c.unread_count > 0 && <span className="badge bg-brand-600 text-white">{c.unread_count}</span>}
            </button>
          )
        }) : <Empty title="No conversations" subtitle="Start a chat from a vendor or listing page." icon={IconMessage2} />}
      </aside>

      {/* Thread */}
      <section className="card flex flex-col overflow-hidden">
        {!activeId ? (
          <div className="flex flex-1 items-center justify-center text-stone-500">Select a conversation</div>
        ) : (
          <>
            <div className="border-b border-stone-200 px-4 py-3 font-semibold">
              {embedded ? activeThread?.conversation?.customer?.name : activeThread?.conversation?.vendor?.business_name}
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto bg-stone-50 p-4">
              {activeThread?.messages?.map((m) => {
                const mine = m.sender_id === user?.id
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${mine ? 'bg-brand-600 text-white' : 'bg-white text-stone-700 shadow-sm'}`}>
                      {m.attachment && <img src={img(m.attachment)} className="mb-1 max-h-40 rounded-lg" />}
                      {m.body}
                      <div className={`mt-0.5 text-[10px] ${mine ? 'text-brand-100' : 'text-stone-500'}`}>{datetimefmt(m.created_at)}</div>
                    </div>
                  </div>
                )
              })}
              <div ref={endRef} />
            </div>
            <form onSubmit={send} className="flex gap-2 border-t border-stone-200 p-3">
              <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" />
              <button className="btn-primary"><IconSend size={18} /></button>
            </form>
          </>
        )}
      </section>
    </div>
  )
}
