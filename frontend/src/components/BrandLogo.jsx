import logoGuarulhos from '../assets/logo-guarulhos-horizontal.png';

export default function BrandLogo({ compact = false, light = false }) {
  return (
    <span className={`flex items-center gap-3 ${compact ? 'min-w-0' : ''}`}>
      <span className="flex h-12 w-28 shrink-0 items-center rounded-card bg-white px-2 shadow-sm ring-1 ring-civic-line">
        <img src={logoGuarulhos} alt="Prefeitura de Guarulhos" className="max-h-10 w-full object-contain" />
      </span>
      <span className="min-w-0 leading-tight">
        <span className={`block text-base font-bold ${light ? 'text-white' : 'text-civic-ink'}`}>FacilitaGRU</span>
        <span className={`block text-xs font-semibold ${light ? 'text-guarulhos-100' : 'text-guarulhos-700'}`}>Gestão socioassistencial</span>
      </span>
    </span>
  );
}
