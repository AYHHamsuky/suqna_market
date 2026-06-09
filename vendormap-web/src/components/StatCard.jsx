export default function StatCard({ label, value, sub, icon: Icon, accent = 'brand' }) {
  const colors = {
    brand: 'bg-brand-500/10 text-brand-600',
    green: 'bg-green-50 text-green-600',
    sky: 'bg-sky-50 text-sky-600',
    amber: 'bg-amber-50 text-amber-600',
    violet: 'bg-violet-50 text-violet-600',
  }
  return (
    <div className="card flex items-center gap-3 p-4">
      {Icon && (
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${colors[accent]}`}>
          <Icon size={22} />
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-xl font-bold">{value}</p>
        <p className="text-xs text-stone-600">{label}</p>
        {sub && <p className="text-xs text-stone-500">{sub}</p>}
      </div>
    </div>
  )
}
