export default function Loading({ label = 'Carregando' }) {
  return (
    <div className="flex items-center justify-center gap-3 text-sm font-semibold text-civic-muted" role="status">
      <span className="size-5 animate-spin rounded-full border-2 border-guarulhos-200 border-t-guarulhos-700" />
      <span>{label}</span>
    </div>
  );
}
