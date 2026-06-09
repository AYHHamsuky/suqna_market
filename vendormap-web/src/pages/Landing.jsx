import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconReceipt, IconHeart, IconMessage } from '@tabler/icons-react'
import { useAuthStore } from '../store/auth'
import { getRecent } from '../lib/recent'
import { priceLabel, img } from '../lib/format'

/* ── Small building blocks ─────────────────────────────── */

function Stars({ n = 5 }) {
  return (
    <div className="flex gap-[3px]">
      {Array.from({ length: n }).map((_, i) => (
        <span
          key={i}
          className="h-3 w-3 bg-gold"
          style={{ clipPath: 'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)' }}
        />
      ))}
    </div>
  )
}

const CATEGORIES = [
  { e: '🍖', name: 'Street food & drinks', items: 'Gullisuwa · Suya · Tuwo · Kunu · Kosai · Masa · Fura da Nono' },
  { e: '🥬', name: 'Fresh produce & farm', items: 'Tomatoes · Yam · Vegetables · Groundnuts · Dabino · Maize' },
  { e: '🥛', name: 'Dairy & animal products', items: 'Wara · Nono · Madara · Eggs · Smoked fish · Beef cuts' },
  { e: '🧵', name: 'Clothing & fabric', items: 'Ankara · Kaftan · Lace · Babbar riga · Hijab · Bend-down' },
  { e: '🔧', name: 'Repairs & trades', items: 'Phone fix · Welding · Cobbler · Keke repairs · Generator' },
  { e: '✂️', name: 'Personal services', items: 'Tailoring · Barbing · Henna & Lalle · Laundry · Photography' },
  { e: '🏠', name: 'Household & supplies', items: 'Firewood · Kerosene · Gas cylinders · Clay pots · Sachet water' },
  { e: '📚', name: 'Education & skills', items: 'Lesson teachers · Qur’an · Computer training · Arabic · Driving' },
]

const FEATURES = [
  { e: '🗺️', bg: 'rgba(232,98,26,.15)', title: 'Live vendor map', text: 'Every vendor is a pin on an interactive map. Distance, direction, and navigation — all without leaving the app.', to: '/search?view=map', link: 'Explore map' },
  { e: '⚖️', bg: 'rgba(212,168,67,.12)', title: 'Price comparison', text: 'Every vendor selling the same item, side by side. Sort by cheapest, nearest, or highest rated.', to: '/search', link: 'Compare prices' },
  { e: '💬', bg: 'rgba(82,183,136,.12)', title: 'Direct chat', text: 'Message any vendor instantly. Ask about availability, negotiate pricing, or request custom orders.', to: '/login', link: 'Start chatting' },
  { e: '🔍', bg: 'rgba(200,96,58,.12)', title: 'Hausa & English search', text: '“Tuwo”, “swallows”, and “tuwon shinkafa” all find the same vendors. Built around how Nigerians speak.', to: '/search', link: 'Try searching' },
  { e: '⭐', bg: 'rgba(212,168,67,.1)', title: 'Verified ratings', text: 'Only real buyers can leave reviews. Every star was earned through a real, completed transaction.', to: '/search', link: 'See reviews' },
  { e: '🔒', bg: 'rgba(82,150,200,.1)', title: 'Secure payments', text: 'Pay via Paystack with full buyer protection. Your money is held safely until you confirm delivery.', to: '/register', link: 'Payment details' },
]

const TESTIMONIALS = [
  { av: 'FA', grad: 'linear-gradient(135deg,#C8603A,#D4952A)', quote: 'I never knew there was someone selling fresh wara this close to my house. I order every Tuesday now. My whole cooking routine changed.', name: 'Fatima Abdullahi', role: 'Customer · Kaduna North' },
  { av: 'HZ', grad: 'linear-gradient(135deg,#2E7D52,#52B788)', quote: 'Before Suqna, only people on my street knew my tuwo business. Now I get orders from across Tudun Wada. My daily sales doubled in two months.', name: 'Hajiya Zainab Musa', role: 'Vendor · Tuwo & local food · Kaduna' },
  { av: 'YM', grad: 'linear-gradient(135deg,#C85A8A,#D4672A)', quote: 'The price comparison saved me ₦4,000 on a phone screen repair. I found three shops within 1km I didn’t even know existed. Incredible.', name: 'Yusuf Musa', role: 'Customer · Kawo, Kaduna' },
]

const MARQUEE = ['Gullisuwa', 'Tuwan Madara', 'Fresh Wara', 'Suya & Tsire', 'Kunu & Zobo', 'Fura da Nono', 'Ankara Fabric', 'Phone Repairs', 'Henna & Lalle', 'Danwake & Kosai', 'Fresh Dabino', 'Tailoring']

const HOW = [
  { n: '01', title: 'Search in your language', text: 'Type in Hausa or English. “Tuwan madara”, “swallows”, “tuwo” — they all lead to the same vendors. Our engine understands the way Nigerians actually speak.' },
  { n: '02', title: 'See every vendor on the map', text: 'All matching vendors appear as pins. Distance, price, and rating at a glance. Compare and navigate — or just get directions and walk in.' },
  { n: '03', title: 'Order, chat, or pick up', text: 'Place an order, message the vendor, track status — or simply use the directions. Pay securely in-app with Paystack. Your money is protected until delivery.' },
]

const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/* ── Landing page ─────────────────────────────────────── */

export default function Landing() {
  const navigate = useNavigate()
  const { token, user } = useAuthStore()
  const [stuck, setStuck] = useState(false)
  const [q, setQ] = useState('')
  const rootRef = useRef(null)

  const search = (e) => {
    e?.preventDefault()
    navigate(q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : '/search')
  }

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('up'); io.unobserve(en.target) } }),
      { threshold: 0.12 },
    )
    rootRef.current?.querySelectorAll('.reveal').forEach((el) => io.observe(el))
    return () => { window.removeEventListener('scroll', onScroll); io.disconnect() }
  }, [])

  const dash = user?.role === 'vendor' ? '/vendor' : user?.role === 'admin' ? '/admin' : '/orders'
  const isCustomer = user?.role === 'customer'
  const recent = useState(() => getRecent())[0]

  return (
    <div ref={rootRef} className="min-h-screen overflow-x-hidden bg-night text-cream">
      {/* NAV */}
      <nav className={`fixed inset-x-0 top-0 z-[500] flex items-center justify-between px-6 transition-all duration-500 lg:px-20 ${stuck ? 'border-b border-brand-500/10 bg-night/90 py-3 backdrop-blur-xl' : 'py-6'}`}>
        <Link to="/" className="font-display text-3xl font-semibold tracking-tight text-cream">
          Suq<b className="font-bold text-brand-500">na</b>
        </Link>
        <ul className="hidden items-center gap-10 md:flex">
          <li><a href="#how" className="text-sm text-cream/55 transition hover:text-cream">How it works</a></li>
          <li><a href="#categories" className="text-sm text-cream/55 transition hover:text-cream">Categories</a></li>
          <li><a href="#features" className="text-sm text-cream/55 transition hover:text-cream">Features</a></li>
          {!isCustomer && <li><a href="#pricing" className="text-sm text-cream/55 transition hover:text-cream">Pricing</a></li>}
          <li>
            {token
              ? <Link to={dash} className="rounded-full bg-brand-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-brand-500">Dashboard</Link>
              : <Link to="/register" className="rounded-full bg-brand-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-brand-500">Start for free</Link>}
          </li>
        </ul>
        <Link to={token ? dash : '/login'} className="rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white md:hidden">
          {token ? 'Dashboard' : 'Sign in'}
        </Link>
      </nav>

      {/* HERO */}
      <section className="relative flex min-h-screen flex-col justify-center overflow-hidden px-6 pb-24 pt-40 lg:px-20">
        <div className="pointer-events-none absolute -right-[5%] -top-[10%] h-[800px] w-[800px] animate-glow" style={{ background: 'radial-gradient(ellipse,rgba(232,98,26,.12) 0%,transparent 65%)' }} />
        <div className="pointer-events-none absolute -bottom-[20%] -left-[10%] h-[600px] w-[600px] animate-glow-slow" style={{ background: 'radial-gradient(ellipse,rgba(212,168,67,.07) 0%,transparent 60%)' }} />
        <svg className="pointer-events-none absolute right-[8%] top-[18%] h-80 w-80 animate-spin-slow opacity-[0.04]" viewBox="0 0 320 320" fill="none">
          <circle cx="160" cy="160" r="158" stroke="white" strokeWidth="1" />
          <circle cx="160" cy="160" r="120" stroke="white" strokeWidth="1" />
          <circle cx="160" cy="160" r="80" stroke="white" strokeWidth="1" />
          <polygon points="160,2 318,240 2,240" stroke="white" strokeWidth="1" fill="none" />
          <polygon points="160,318 2,80 318,80" stroke="white" strokeWidth="1" fill="none" />
        </svg>

        <div className="relative z-10 max-w-3xl">
          <div className="anim-rise mb-8 inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-ember-l" style={{ animationDelay: '.2s' }}>
            <span className="h-1.5 w-1.5 animate-blink rounded-full bg-brand-500" />
            Now live in Kaduna — expanding soon
          </div>
          <h1 className="anim-rise mb-7 font-display text-6xl font-light leading-[1.0] tracking-tight sm:text-7xl lg:text-[7rem]" style={{ animationDelay: '.35s' }}>
            Your market<br />
            is <em className="text-gradient not-italic font-light italic">right here,</em><br />
            <strong className="font-bold text-white">right now.</strong>
          </h1>
          <p className="anim-rise mb-12 max-w-lg text-lg font-light leading-relaxed text-cream/60" style={{ animationDelay: '.5s' }}>
            Search for <span className="font-normal text-gold-l">gullisuwa, tuwan madara, suya, wara</span> — or anything your family needs. Every nearby vendor appears on your map, with prices, ratings, and directions.
          </p>
          <div className="anim-rise flex flex-wrap items-center gap-5" style={{ animationDelay: '.65s' }}>
            <Link to="/search?view=map" className="group inline-flex items-center gap-3 rounded-full bg-brand-600 px-8 py-4 font-medium text-white shadow-[0_8px_32px_rgba(232,98,26,.4)] transition hover:-translate-y-0.5 hover:bg-brand-500 hover:shadow-[0_16px_48px_rgba(232,98,26,.5)]">
              Find vendors near me <Arrow />
            </Link>
            <Link to="/search" className="group inline-flex items-center gap-3 text-cream/60 transition hover:text-cream">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-cream/15 transition group-hover:border-brand-500/50 group-hover:bg-brand-500/10">
                <svg width="12" height="14" viewBox="0 0 12 14" fill="none"><path d="M1 1.5l10 5.5L1 12.5V1.5z" fill="currentColor" /></svg>
              </span>
              Browse everything
            </Link>
          </div>
        </div>

        {/* Floating search card */}
        <form onSubmit={search} className="anim-rise absolute bottom-[10%] right-[5%] z-20 hidden w-[360px] rounded-3xl border border-brand-500/20 bg-night-3/85 p-6 shadow-[0_32px_80px_rgba(0,0,0,.5)] backdrop-blur-2xl xl:block" style={{ animationDelay: '.85s' }}>
          <div className="mb-3 text-xs font-medium uppercase tracking-wider text-dust-l">🔍 Search anything nearby</div>
          <div className="mb-4 flex gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="tuwo, suya, repairs…" className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream outline-none transition placeholder:text-cream/30 focus:border-brand-500/50" />
            <button className="rounded-lg bg-brand-600 px-4 text-white transition hover:scale-105 hover:bg-brand-500">→</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {['🍖 Suya', '🥣 Tuwo', '🥛 Nono', '✂️ Tailor', '🔧 Repair', '📚 Lessons'].map((t) => (
              <button key={t} type="button" onClick={() => navigate(`/search?q=${encodeURIComponent(t.split(' ')[1])}`)} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-cream/50 transition hover:border-brand-500/35 hover:bg-brand-500/15 hover:text-ember-l">
                {t}
              </button>
            ))}
          </div>
        </form>

        {/* Stats bar */}
        <div className="anim-rise absolute inset-x-0 bottom-0 z-20 flex flex-wrap items-center gap-x-16 gap-y-4 border-t border-white/5 bg-night-2/75 px-6 py-6 backdrop-blur-md lg:px-20" style={{ animationDelay: '1s' }}>
          {[['2,400', '+', 'Vendors listed'], ['18', 'k+', 'Items & services'], ['4.8', '★', 'Average rating'], ['52', 'k+', 'Happy customers']].map(([n, s, l], i) => (
            <div key={i} className="flex items-baseline gap-2">
              <span className="font-display text-3xl font-semibold tracking-tight">{n}<b className="text-brand-500">{s}</b></span>
              <span className="text-sm text-cream/40">{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* MARQUEE */}
      <div className="overflow-hidden whitespace-nowrap bg-brand-600 py-3">
        <div className="inline-flex animate-marquee">
          {[...MARQUEE, ...MARQUEE].map((m, i) => (
            <span key={i} className="inline-flex items-center gap-3 px-10 font-display text-base italic text-white/90">
              <span className="h-[5px] w-[5px] rounded-full bg-white/50" />{m}
            </span>
          ))}
        </div>
      </div>

      {/* CUSTOMER WELCOME BAND (logged-in customers only) */}
      {isCustomer && (
        <section className="border-b border-white/5 bg-night px-6 py-14 lg:px-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-ember-l">Welcome back</p>
              <h2 className="mt-1 font-display text-4xl font-normal tracking-tight">Hello, {user?.name?.split(' ')[0]} 👋</h2>
              <p className="mt-1 text-cream/50">Pick up where you left off, or discover something new nearby.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <QuickLink to="/orders" icon={IconReceipt}>My orders</QuickLink>
              <QuickLink to="/wishlist" icon={IconHeart}>Wishlist</QuickLink>
              <QuickLink to="/messages" icon={IconMessage}>Messages</QuickLink>
            </div>
          </div>

          {recent.length > 0 && (
            <div className="mt-10">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-2xl">Recently viewed</h3>
                <Link to="/search" className="text-sm text-ember-l hover:text-gold-l">Browse all →</Link>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {recent.map((r) => (
                  <Link key={r.id} to={`/listings/${r.id}`} className="group overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] transition hover:-translate-y-0.5 hover:border-brand-500/25">
                    <div className="aspect-[4/3] w-full overflow-hidden bg-night-3">
                      {img(r.images?.[0]) && <img src={img(r.images[0])} alt={r.name} loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none' }} className="h-full w-full object-cover transition group-hover:scale-105" />}
                    </div>
                    <div className="p-3">
                      <p className="truncate font-medium text-cream">{r.name}</p>
                      <p className="mt-0.5 text-sm font-semibold text-ember-l">{priceLabel(r)}</p>
                      {r.vendor && <p className="mt-0.5 truncate text-xs text-cream/40">{r.vendor.business_name}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* HOW IT WORKS */}
      <section id="how" className="relative overflow-hidden bg-night-2 px-6 py-28 lg:px-20">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <SecTag>How it works</SecTag>
            <SecH className="reveal reveal-d1">Simple as walking<br /><em className="font-light italic text-gold-l">to the market</em></SecH>
            <p className="reveal reveal-d2 mb-12 max-w-md leading-relaxed text-cream/50">From search to vendor in three steps. No learning curve. No complicated setup. Just open, search, find.</p>
            <div className="flex flex-col">
              {HOW.map((s, i) => (
                <div key={s.n} className={`group reveal reveal-d${i + 2} flex gap-6 border-b border-white/5 py-8 transition last:border-0 hover:pl-4`}>
                  <div className="w-14 shrink-0 font-display text-5xl font-bold leading-none text-white/[0.06] transition group-hover:text-brand-500/20">{s.n}</div>
                  <div>
                    <div className="mb-2 font-medium text-cream">{s.title}</div>
                    <div className="text-sm leading-relaxed text-cream/45">{s.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <PhoneMockup />
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categories" className="relative overflow-hidden bg-night-3 px-6 py-28 lg:px-20">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div>
            <SecTag>Browse categories</SecTag>
            <SecH className="reveal reveal-d1">Every item,<br /><em className="font-light italic text-gold-l">every vendor</em></SecH>
          </div>
          <p className="reveal reveal-d2 max-w-xs text-cream/50 sm:text-right">If someone sells it in your city — firewood, phone repair, or Hajiya’s kosai — you’ll find them here.</p>
        </div>
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-white/5 bg-white/5 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c, i) => (
            <Link key={c.name} to="/search" className={`group reveal reveal-d${(i % 4) + 1} relative overflow-hidden bg-night-3 p-8 transition hover:z-10 hover:scale-[1.02]`}>
              <div className="absolute inset-0 opacity-0 transition group-hover:opacity-10" style={{ background: 'linear-gradient(135deg,var(--color-ember),var(--color-gold))' }} />
              <span className="relative mb-4 block text-3xl">{c.e}</span>
              <div className="relative mb-1.5 font-medium text-cream">{c.name}</div>
              <div className="relative text-sm leading-relaxed text-cream/40">{c.items}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="bg-night-2 px-6 py-28 lg:px-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <SecTag>Platform features</SecTag>
            <SecH className="reveal reveal-d1">Built for how<br /><em className="font-light italic text-gold-l">Nigeria really shops</em></SecH>
          </div>
          <p className="reveal reveal-d2 max-w-xs text-cream/50 sm:text-right">Not adapted for Nigeria. Designed from scratch for how commerce actually works in our cities.</p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Link key={f.title} to={f.to} className={`group reveal reveal-d${(i % 3) + 1} relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.03] p-8 transition hover:-translate-y-1 hover:border-brand-500/20 hover:bg-white/[0.05] hover:shadow-[0_20px_60px_rgba(0,0,0,.4)]`}>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl text-2xl" style={{ background: f.bg }}>{f.e}</div>
              <div className="mb-2 font-medium text-cream">{f.title}</div>
              <div className="text-sm leading-relaxed text-cream/45">{f.text}</div>
              <span className="mt-5 inline-flex items-center gap-1 text-sm text-ember-l opacity-0 transition group-hover:opacity-100">{f.link} →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="relative overflow-hidden bg-night px-6 py-28 lg:px-20">
        <div className="mb-16 grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SecTag>Real stories</SecTag>
            <SecH className="reveal reveal-d1">What our community<br /><em className="font-light italic text-gold-l">is saying</em></SecH>
          </div>
          <p className="reveal reveal-d2 text-cream/50">These are real vendors and customers from Kaduna who changed how they buy and sell because of Suqna.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <div key={t.name} className={`reveal reveal-d${i + 1} rounded-3xl border border-white/[0.06] bg-white/[0.03] p-9 transition hover:-translate-y-1 hover:border-brand-500/20`}>
              <div className="mb-5"><Stars /></div>
              <p className="mb-7 font-display text-lg italic leading-relaxed text-cream/75">“{t.quote}”</p>
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-white" style={{ background: t.grad }}>{t.av}</div>
                <div>
                  <div className="text-sm font-medium text-cream">{t.name}</div>
                  <div className="text-xs text-cream/40">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING — vendor-oriented, hidden from logged-in customers */}
      {!isCustomer && (
      <section id="pricing" className="relative overflow-hidden bg-night-3 px-6 py-28 lg:px-20">
        <div className="text-center">
          <SecTag center>Vendor pricing</SecTag>
          <SecH className="reveal reveal-d1 mx-auto max-w-xl text-center">Simple pricing for<br /><em className="font-light italic text-gold-l">every kind of vendor</em></SecH>
          <p className="reveal reveal-d2 mx-auto max-w-lg text-cream/50">From a roadside food stall to a multi-branch shop. Start free. Scale when you’re ready.</p>
        </div>
        <div className="mx-auto mt-16 grid max-w-5xl items-start gap-6 lg:grid-cols-3">
          <PriceCard tier="Starter" amount="Free" period="Always free · No credit card"
            feats={[['List up to 5 items', 1], ['Basic map pin', 1], ['Customer messaging', 1], ['Ratings & reviews', 1], ['Analytics dashboard', 0], ['Featured placement', 0]]}
            cta="Get started free" onClick={() => navigate('/register/vendor')} />
          <PriceCard hot tier="Pro Vendor" amount="₦4,999" period="per month · cancel anytime"
            feats={[['Unlimited listings', 1], ['Featured map pin', 1], ['Priority search placement', 1], ['Full analytics dashboard', 1], ['Verified vendor badge', 1], ['Promotional tools', 1]]}
            cta="Start Pro — ₦4,999/mo" onClick={() => navigate('/register/vendor')} />
          <PriceCard tier="Business" amount="₦12,999" period="per month · multi-branch support"
            feats={[['Everything in Pro', 1], ['Up to 5 branches', 1], ['Custom storefront branding', 1], ['Bulk order management', 1], ['Dedicated account manager', 1], ['API access', 1]]}
            cta="Contact sales" onClick={() => navigate('/register/vendor')} />
        </div>
      </section>
      )}

      {/* CTA */}
      <section className="relative overflow-hidden bg-night-2 px-6 py-24 text-center lg:px-20">
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-display font-bold tracking-tight text-white/[0.02]" style={{ fontSize: 'clamp(6rem,15vw,14rem)' }}>Suqna</div>
        <div className="relative z-10">
          <div className="reveal mb-8 inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-ember-l">🔥 Your community is waiting</div>
          <h2 className="reveal reveal-d1 mx-auto mb-6 max-w-2xl font-display text-5xl font-normal leading-tight tracking-tight lg:text-[5rem]">The market you know,<br /><em className="font-light italic text-gold-l">finally in your pocket.</em></h2>
          <p className="reveal reveal-d2 mx-auto mb-12 max-w-md leading-relaxed text-cream/50">Whether you’re a mother looking for the best price on fresh wara, or a vendor ready to reach thousands of new customers across your city — Suqna is for you.</p>
          <div className="reveal reveal-d3 flex flex-wrap justify-center gap-4">
            <Link to="/search" className="inline-flex items-center gap-3 rounded-full bg-brand-600 px-9 py-4 font-medium text-white shadow-[0_8px_32px_rgba(232,98,26,.4)] transition hover:-translate-y-0.5 hover:bg-brand-500">🛒 Start shopping now <Arrow /></Link>
            {isCustomer ? (
              <Link to="/orders" className="inline-flex items-center gap-2 rounded-full border border-cream/20 px-8 py-4 font-light text-cream transition hover:border-cream/45 hover:bg-white/5">📦 View my orders</Link>
            ) : (
              <Link to="/register/vendor" className="inline-flex items-center gap-2 rounded-full border border-cream/20 px-8 py-4 font-light text-cream transition hover:border-cream/45 hover:bg-white/5">🏪 List your business free</Link>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="grid gap-12 border-t border-white/5 bg-night px-6 py-16 lg:grid-cols-4 lg:px-20">
        <div>
          <Link to="/" className="mb-4 block font-display text-2xl font-semibold text-cream">Suq<b className="text-brand-500">na</b></Link>
          <p className="max-w-xs text-sm leading-relaxed text-cream/35">The local vendor marketplace built for Nigerian communities. Find, compare, and buy from sellers near you — in any language, for any item.</p>
        </div>
        <FootCol head="Platform" links={[['How it works', '#how'], ['Vendor map', '/search?view=map'], ['Categories', '#categories'], ['Price comparison', '/search']]} />
        {isCustomer
          ? <FootCol head="Your account" links={[['My orders', '/orders'], ['Wishlist', '/wishlist'], ['Messages', '/messages'], ['Search vendors', '/search']]} />
          : <FootCol head="Vendors" links={[['List your business', '/register/vendor'], ['Pricing plans', '#pricing'], ['Vendor dashboard', '/vendor'], ['Payout schedule', '/vendor/payouts']]} />}
        <FootCol head="Company" links={[['About us', '#'], ['Contact', '#'], ['Privacy policy', '#'], ['Terms of service', '#']]} />
      </footer>
      <div className="flex flex-col items-center justify-between gap-4 border-t border-white/5 px-6 py-7 text-sm text-cream/20 sm:flex-row lg:px-20">
        <span>© 2025 Suqna · AYH Hamsuky Enterprises · Kaduna, Nigeria</span>
        <div className="flex gap-3">
          {['𝕏', '📸', '𝔽', '💬'].map((s, i) => (
            <a key={i} href="#" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/7 bg-white/5 text-cream/40 transition hover:border-brand-600 hover:bg-brand-600 hover:text-white">{s}</a>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Section helpers ─────────────────────────────────── */

function SecTag({ children, center }) {
  return (
    <div className={`reveal mb-5 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-ember-l ${center ? 'justify-center' : ''}`}>
      <span className="h-px w-7 bg-brand-500" />{children}
    </div>
  )
}
function SecH({ children, className = '' }) {
  return <h2 className={`mb-4 font-display text-4xl font-normal leading-[1.08] tracking-tight text-cream lg:text-6xl ${className}`}>{children}</h2>
}
function QuickLink({ to, icon: Icon, children }) {
  return (
    <Link to={to} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-cream/80 transition hover:border-brand-500/35 hover:bg-brand-500/10 hover:text-cream">
      <Icon size={16} /> {children}
    </Link>
  )
}
function FootCol({ head, links }) {
  return (
    <div>
      <div className="mb-5 text-xs font-medium uppercase tracking-widest text-cream/25">{head}</div>
      <ul className="flex flex-col gap-2.5">
        {links.map(([label, to]) => (
          <li key={label}>
            {to.startsWith('#')
              ? <a href={to} className="text-sm text-cream/40 transition hover:text-ember-l">{label}</a>
              : <Link to={to} className="text-sm text-cream/40 transition hover:text-ember-l">{label}</Link>}
          </li>
        ))}
      </ul>
    </div>
  )
}

function PriceCard({ tier, amount, period, feats, cta, onClick, hot }) {
  return (
    <div className={`reveal relative rounded-3xl p-9 transition hover:-translate-y-1 ${hot ? 'bg-brand-600 shadow-[0_32px_80px_rgba(232,98,26,.35)]' : 'border border-white/[0.07] bg-white/[0.03] hover:border-white/15'}`}>
      {hot && <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gold px-4 py-1 text-xs font-bold text-night">⭐ Most popular</div>}
      <div className={`mb-2 text-xs font-medium uppercase tracking-widest ${hot ? 'text-white/60' : 'text-cream/40'}`}>{tier}</div>
      <div className={`mb-1 font-display text-5xl font-bold tracking-tight ${hot ? 'text-white' : 'text-cream'}`}>{amount}</div>
      <div className={`mb-8 text-sm ${hot ? 'text-white/60' : 'text-cream/40'}`}>{period}</div>
      <div className={`mb-7 h-px ${hot ? 'bg-white/20' : 'bg-white/7'}`} />
      <ul className="mb-8 flex flex-col gap-3.5">
        {feats.map(([label, ok]) => (
          <li key={label} className={`flex items-center gap-3 text-sm ${ok ? (hot ? 'text-white/85' : 'text-cream/60') : 'opacity-30'}`}>
            <span className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full text-[10px] ${hot ? 'bg-white/20 text-white' : 'bg-white/6 text-ember-l'}`}>{ok ? '✓' : '×'}</span>
            {label}
          </li>
        ))}
      </ul>
      <button onClick={onClick} className={`w-full rounded-full py-3 text-sm font-medium transition ${hot ? 'bg-white text-ember-d hover:bg-gold-pale' : 'border border-white/12 text-cream hover:border-white/25 hover:bg-white/6'}`}>{cta}</button>
    </div>
  )
}

/* ── Phone mockup ────────────────────────────────────── */

function PhoneMockup() {
  return (
    <div className="relative hidden justify-center lg:flex">
      <FloatCard className="left-[-60px] top-[6%]" icon="📍" title="0.4 km away" sub="Malam Bello Suya" badge="Open now" />
      <FloatCard className="bottom-[22%] right-[-70px] [animation-delay:1.5s]" icon="⭐" title="Verified Review" sub="“Best tuwo in Kaduna”" stars />
      <FloatCard className="right-[-65px] top-[45%] [animation-delay:.8s]" icon="💰" title="Best price nearby" sub="₦350 · save ₦150" />

      <div className="relative z-[2] w-[260px] rounded-[38px] bg-bark p-3 shadow-[0_60px_120px_rgba(0,0,0,.6),0_0_0_1px_rgba(255,255,255,.06)]">
        <div className="h-[500px] overflow-hidden rounded-[28px] bg-night">
          <div className="mx-auto h-6 w-20 rounded-b-2xl bg-bark" />
          <div className="flex justify-between px-4 pt-1.5 text-[10px] text-cream/40"><span>9:41</span><span>●●● 100%</span></div>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="font-display text-lg font-semibold text-cream">Suq<b className="text-brand-500">na</b></div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold text-white" style={{ background: 'linear-gradient(135deg,var(--color-ember),var(--color-gold))' }}>AY</div>
          </div>
          <div className="mx-3.5 mb-3 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3.5 py-2 text-[11px] text-cream/35">
            <span className="text-brand-500">🔍</span> Search vendors near you…
          </div>
          {/* Mini map */}
          <div className="relative mx-3.5 mb-3 h-[140px] overflow-hidden rounded-2xl bg-[#1a1408]">
            <div className="absolute inset-x-0 h-0.5 bg-white/10" style={{ top: '42%' }} />
            <div className="absolute inset-x-0 h-0.5 bg-white/10" style={{ top: '68%' }} />
            <div className="absolute inset-y-0 w-0.5 bg-white/10" style={{ left: '38%' }} />
            <div className="absolute inset-y-0 w-0.5 bg-white/10" style={{ left: '64%' }} />
            <div className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500 shadow-[0_0_0_4px_rgba(232,98,26,.25)] animate-ping2" style={{ top: '40%', left: '50%' }} />
            <MapPin top="14%" left="28%" color="var(--color-ember)" label="🍖 Suya" />
            <MapPin top="22%" left="58%" color="var(--color-gold)" label="🥣 Tuwo" delay=".7s" />
            <MapPin top="12%" left="72%" color="#52B788" label="🥛 Nono" delay="1.4s" />
            <div className="absolute right-2 top-2 rounded-lg border border-white/10 bg-night/80 px-2 py-1 text-[10px] font-medium text-cream backdrop-blur">📍 Kaduna · 8 vendors</div>
          </div>
          <div className="px-3.5 pb-2 text-[11px] font-semibold text-cream">Nearby matches</div>
          <div className="flex gap-2 px-3.5">
            {[['🍖', 'rgba(232,98,26,.15)', 'Malam Bello Suya', '₦500/stick', '0.4km · ⭐4.9'], ['🥣', 'rgba(212,168,67,.15)', 'Hajiya Zainab Tuwo', '₦400/plate', '0.7km · ⭐4.8'], ['🥛', 'rgba(82,183,136,.15)', 'Fresh Nono Corner', '₦200/cup', '1.1km · ⭐4.7']].map(([e, bg, name, price, dist]) => (
              <div key={name} className="w-[100px] shrink-0 rounded-xl border border-white/10 bg-white/[0.06] p-2.5">
                <div className="mb-1.5 flex h-11 items-center justify-center rounded-lg text-xl" style={{ background: bg }}>{e}</div>
                <div className="text-[9px] font-semibold text-cream">{name}</div>
                <div className="text-[9px] font-medium text-ember-l">{price}</div>
                <div className="mt-0.5 text-[8px] text-cream/35">📍 {dist}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function FloatCard({ className = '', icon, title, sub, badge, stars }) {
  return (
    <div className={`absolute z-[5] animate-floaty rounded-2xl border border-brand-500/20 bg-night-2/90 px-3.5 py-3 shadow-[0_16px_48px_rgba(0,0,0,.5)] backdrop-blur-md ${className}`}>
      <div className="mb-1 text-lg">{icon}</div>
      <div className="text-[11px] font-semibold text-cream">{title}</div>
      <div className="mt-0.5 text-[10px] text-cream/45">{sub}</div>
      {badge && <span className="mt-1.5 inline-block rounded-full bg-brand-500/20 px-2 py-0.5 text-[10px] font-medium text-ember-l">{badge}</span>}
      {stars && <div className="mt-1.5"><Stars /></div>}
    </div>
  )
}

function MapPin({ top, left, color, label, delay }) {
  return (
    <div className="absolute z-[4] flex animate-pin flex-col items-center" style={{ top, left, animationDelay: delay }}>
      <div className="relative h-[18px] w-[18px] rounded-[50%_50%_50%_0] shadow-[0_2px_8px_rgba(0,0,0,.4)]" style={{ background: color, transform: 'rotate(-45deg)' }}>
        <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-white" style={{ transform: 'translate(-50%,-50%) rotate(45deg)' }} />
      </div>
      <div className="mt-0.5 whitespace-nowrap rounded bg-white/10 px-1.5 py-px text-[8px] font-semibold text-cream backdrop-blur">{label}</div>
    </div>
  )
}
