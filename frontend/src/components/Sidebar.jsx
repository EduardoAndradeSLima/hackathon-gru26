import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  Building2,
  ClipboardList,
  FileText,
  GitMerge,
  LayoutDashboard,
  ShieldCheck,
  Users,
  X
} from 'lucide-react';
import BrandLogo from './BrandLogo.jsx';

const links = [
  { to: '/app', label: 'Painel', icon: LayoutDashboard, end: true },
  { to: '/app/vagas', label: 'Vagas', icon: ClipboardList },
  { to: '/app/cidadaos', label: 'Cidadãos', icon: Users },
  { to: '/app/fila', label: 'Fila', icon: GitMerge },
  { to: '/app/match', label: 'Match', icon: GitMerge },
  { to: '/app/gerencial', label: 'Gerencial', icon: BarChart3 },
  { to: '/app/oscs', label: 'OSCs', icon: Building2 },
  { to: '/app/relatorios', label: 'Relatórios', icon: FileText },
  { to: '/app/usuarios', label: 'Usuários', icon: ShieldCheck }
];

export default function Sidebar({ open, onClose }) {
  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-civic-line bg-white transition-transform lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex h-full flex-col">
        <div className="flex min-h-16 items-center justify-between border-b border-civic-line px-5">
          <NavLink to="/app" className="flex items-center gap-3" onClick={onClose}>
            <BrandLogo compact />
          </NavLink>
          <button type="button" className="btn-secondary px-3 lg:hidden" onClick={onClose} aria-label="Fechar menu">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Navegacao principal">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-card px-3 text-sm font-semibold transition ${isActive ? 'bg-guarulhos-700 text-white' : 'text-civic-muted hover:bg-guarulhos-50 hover:text-guarulhos-900'}`}
            >
              <Icon size={18} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-civic-line p-4 text-xs leading-5 text-civic-muted">
          Plataforma institucional para decisão humana assistida por dados.
        </div>
      </div>
    </aside>
  );
}
