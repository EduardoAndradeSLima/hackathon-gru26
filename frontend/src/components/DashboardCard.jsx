export default function DashboardCard({ title, value, description, icon: Icon, tone = 'blue' }) {
  const tones = {
    blue: 'bg-guarulhos-50 text-guarulhos-700',
    green: 'bg-emerald-50 text-civic-green',
    yellow: 'bg-amber-50 text-civic-yellow',
    red: 'bg-red-50 text-civic-red',
    gray: 'bg-slate-100 text-slate-700'
  };

  return (
    <article className="surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-civic-muted">{title}</p>
          <p className="mt-2 text-2xl font-bold text-civic-ink">{value}</p>
          {description && <p className="mt-1 text-xs leading-5 text-civic-muted">{description}</p>}
        </div>
        {Icon && (
          <span className={`grid size-10 shrink-0 place-items-center rounded-card ${tones[tone]}`}>
            <Icon size={20} aria-hidden="true" />
          </span>
        )}
      </div>
    </article>
  );
}
