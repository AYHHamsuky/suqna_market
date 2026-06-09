import { Outlet, NavLink, Link } from 'react-router-dom'
import { IconMapPin2, IconLogout, IconExternalLink } from '@tabler/icons-react'
import { useAuthStore } from '../store/auth'
import { useAuthActions } from '../lib/useAuthActions'

/** Shared shell for vendor & admin dashboards. */
export default function DashboardLayout({ title, nav }) {
  const { user } = useAuthStore()
  const { logout } = useAuthActions()

  return (
    <div className="flex min-h-full">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-stone-200 bg-white md:flex">
        <Link to="/" className="px-5 py-4 font-display text-2xl font-semibold leading-none text-stone-800">
          Suq<b className="font-bold text-brand-500">na</b>
        </Link>
        <p className="px-5 pb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">{title}</p>
        <nav className="flex-1 space-y-1 px-3">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive ? 'bg-brand-500/10 text-brand-700' : 'text-stone-600 hover:bg-stone-100'
                }`
              }
            >
              <n.icon size={18} /> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-stone-200 p-3">
          <button onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-stone-50">
            <IconLogout size={18} /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-stone-200 bg-white px-5 py-3">
          <div className="flex items-center gap-2 md:hidden">
            <IconMapPin2 className="h-5 w-5 text-brand-600" />
            <span className="font-bold text-brand-600">{title}</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Link to="/" className="btn-ghost text-xs"><IconExternalLink size={14} /> View site</Link>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500/20 text-sm font-bold text-brand-700">
              {user?.name?.[0]?.toUpperCase()}
            </span>
          </div>
        </header>

        {/* Mobile nav */}
        <nav className="flex gap-1 overflow-x-auto border-b border-stone-200 bg-white px-3 py-2 md:hidden">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
                  isActive ? 'bg-brand-500/10 text-brand-700' : 'text-stone-600'
                }`
              }
            >
              <n.icon size={15} /> {n.label}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 bg-stone-50 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
