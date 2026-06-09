import { Outlet, Link, useNavigate, NavLink } from 'react-router-dom'
import { useState } from 'react'
import {
  IconMapPin2, IconSearch, IconShoppingCart, IconUser, IconHeart,
  IconMessage, IconReceipt, IconLogout, IconBuildingStore, IconLayoutDashboard,
} from '@tabler/icons-react'
import { useAuthStore } from '../store/auth'
import { useCartStore } from '../store/cart'
import { useAuthActions } from '../lib/useAuthActions'

export default function PublicLayout() {
  const { user, token } = useAuthStore()
  const cartCount = useCartStore((s) => s.items.length)
  const { logout } = useAuthActions()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [menu, setMenu] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    navigate(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-30 border-b border-brand-500/10 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <Link to="/" className="flex shrink-0 items-center gap-1.5">
            <span className="font-display text-2xl font-semibold leading-none text-stone-800">Suq<b className="font-bold text-brand-500">na</b></span>
          </Link>

          <form onSubmit={submit} className="relative flex-1">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search gullisuwa, tuwo, phone repair…"
              className="input pl-9"
            />
          </form>

          <Link to="/cart" className="relative rounded-lg p-2 text-stone-600 hover:bg-stone-100">
            <IconShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {token ? (
            <div className="relative">
              <button onClick={() => setMenu((m) => !m)} className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-stone-100">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500/20 text-sm font-bold text-brand-700">
                  {user?.name?.[0]?.toUpperCase()}
                </span>
              </button>
              {menu && (
                <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-stone-200 bg-white py-1 shadow-lg" onClick={() => setMenu(false)}>
                  <div className="border-b border-stone-200 px-4 py-2">
                    <p className="truncate text-sm font-semibold">{user?.name}</p>
                    <p className="text-xs capitalize text-stone-500">{user?.role}</p>
                  </div>
                  {user?.role === 'customer' && (
                    <>
                      <MenuItem to="/orders" icon={IconReceipt}>My Orders</MenuItem>
                      <MenuItem to="/wishlist" icon={IconHeart}>Wishlist</MenuItem>
                      <MenuItem to="/messages" icon={IconMessage}>Messages</MenuItem>
                    </>
                  )}
                  {user?.role === 'vendor' && <MenuItem to="/vendor" icon={IconLayoutDashboard}>Vendor Dashboard</MenuItem>}
                  {user?.role === 'admin' && <MenuItem to="/admin" icon={IconLayoutDashboard}>Admin Panel</MenuItem>}
                  <button onClick={logout} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-stone-50">
                    <IconLogout size={16} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-ghost hidden sm:inline-flex"><IconUser size={16} /> Sign in</Link>
              <Link to="/register/vendor" className="btn-primary"><IconBuildingStore size={16} /> Sell</Link>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-stone-200 bg-stone-50 py-6 text-center text-sm text-stone-500">
        <span className="font-display text-base text-stone-800">Suq<b className="text-brand-500">na</b></span> — connecting Kaduna with its local vendors. Built for the informal economy.
      </footer>
    </div>
  )
}

function MenuItem({ to, icon: Icon, children }) {
  return (
    <NavLink to={to} className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50">
      <Icon size={16} /> {children}
    </NavLink>
  )
}
