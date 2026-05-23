const statusMap = {
  disponivel: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ocupada: 'bg-slate-100 text-slate-700 border-slate-200',
  reservada: 'bg-amber-50 text-amber-700 border-amber-200',
  bloqueada: 'bg-red-50 text-red-700 border-red-200',
  pendente: 'bg-amber-50 text-amber-700 border-amber-200',
  em_analise: 'bg-blue-50 text-blue-700 border-blue-200',
  encaminhada: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  concluida: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelada: 'bg-slate-100 text-slate-700 border-slate-200',
  aguardando_osc: 'bg-amber-50 text-amber-700 border-amber-200',
  aceito: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  recusado: 'bg-red-50 text-red-700 border-red-200',
  critica: 'bg-red-50 text-red-700 border-red-200',
  alta: 'bg-amber-50 text-amber-700 border-amber-200',
  media: 'bg-blue-50 text-blue-700 border-blue-200',
  baixa: 'bg-slate-100 text-slate-700 border-slate-200'
};

export default function StatusBadge({ value }) {
  const label = String(value || 'nao informado').replaceAll('_', ' ');

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${statusMap[value] || 'border-slate-200 bg-slate-100 text-slate-700'}`}>
      {label}
    </span>
  );
}
