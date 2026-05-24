import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';

export default function AppLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-civic-ink">
      <div className="flex min-h-screen">
        <Sidebar open={open} onClose={() => setOpen(false)} />
        {open && (
          <button
            type="button"
            aria-label="Fechar menu"
            className="fixed inset-0 z-30 bg-slate-900/35 lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}
        <div className="min-w-0 flex-1">
          <Navbar onMenu={() => setOpen(true)} />
          <main className="page-shell py-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
