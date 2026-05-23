import { Bell, LogOut, Menu, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar({ onMenu }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-civic-line bg-white/95 backdrop-blur">
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button type="button" className="btn-secondary px-3 lg:hidden" onClick={onMenu} aria-label="Abrir menu">
            <Menu size={18} />
          </button>
          <div>
            <p className="text-xs font-semibold uppercase text-guarulhos-700">Prefeitura de Guarulhos</p>
            <h1 className="text-base font-bold text-civic-ink sm:text-lg">Gestão socioassistencial</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" className="btn-secondary px-3" title="Notificações" aria-label="Notificações">
            <Bell size={18} />
          </button>
          <div className="hidden items-center gap-2 rounded-card border border-civic-line px-3 py-2 sm:flex">
            <ShieldCheck size={18} className="text-civic-green" aria-hidden="true" />
            <div className="leading-tight">
              <p className="text-sm font-semibold text-civic-ink">{user?.nome}</p>
              <p className="text-xs text-civic-muted">{user?.perfil}</p>
            </div>
          </div>
          <button type="button" className="btn-secondary px-3" onClick={logout} title="Sair" aria-label="Sair">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
