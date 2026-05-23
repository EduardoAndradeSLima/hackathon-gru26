import { Search } from 'lucide-react';

export default function FilterBar({ search, onSearch, children, action }) {
  return (
    <div className="surface mb-4 flex flex-col gap-3 p-3 md:flex-row md:items-center md:justify-between">
      <label className="relative flex-1" htmlFor="search">
        <span className="sr-only">Buscar</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-civic-muted" size={18} aria-hidden="true" />
        <input
          id="search"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Buscar por nome, serviço, bairro ou status"
          className="form-input pl-10"
        />
      </label>
      {children}
      {action}
    </div>
  );
}
