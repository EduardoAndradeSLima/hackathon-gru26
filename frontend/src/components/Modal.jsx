import { X } from 'lucide-react';

export default function Modal({ open, title, children, onClose }) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-card bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-civic-line px-5 py-4">
          <h2 className="text-lg font-bold text-civic-ink">{title}</h2>
          <button type="button" className="btn-secondary px-3" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
