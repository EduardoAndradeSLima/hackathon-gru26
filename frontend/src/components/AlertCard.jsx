import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

export default function AlertCard({ title, message, tone = 'blue' }) {
  const isDanger = tone === 'red' || tone === 'critico' || tone === 'alto';
  const classes = isDanger
    ? 'border-red-200 bg-red-50 text-red-800'
    : tone === 'yellow'
      ? 'border-amber-200 bg-amber-50 text-amber-800'
      : tone === 'green'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
        : 'border-blue-200 bg-blue-50 text-blue-800';
  const Icon = isDanger ? AlertTriangle : tone === 'green' ? CheckCircle2 : Info;

  return (
    <article className={`rounded-card border p-4 ${classes}`}>
      <div className="flex gap-3">
        <Icon size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
        <div>
          <h3 className="font-bold">{title}</h3>
          <p className="mt-1 text-sm leading-6">{message}</p>
        </div>
      </div>
    </article>
  );
}
