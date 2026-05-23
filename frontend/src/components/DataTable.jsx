import Loading from './Loading.jsx';

export default function DataTable({ columns, data, loading, empty = 'Nenhum registro encontrado.', actions }) {
  return (
    <div className="surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-civic-line bg-slate-100 text-xs uppercase text-civic-muted">
            <tr>
              {columns.map((column) => (
                <th key={column.key} scope="col" className="px-4 py-3 font-bold">
                  {column.label}
                </th>
              ))}
              {actions && <th scope="col" className="px-4 py-3 font-bold">Ações</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-civic-line bg-white">
            {loading && (
              <tr>
                <td className="px-4 py-8" colSpan={columns.length + (actions ? 1 : 0)}>
                  <Loading label="Carregando registros" />
                </td>
              </tr>
            )}

            {!loading && data.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-civic-muted" colSpan={columns.length + (actions ? 1 : 0)}>
                  {empty}
                </td>
              </tr>
            )}

            {!loading && data.map((row) => (
              <tr key={row.id} className="hover:bg-guarulhos-50/50">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 align-top text-civic-ink">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
                {actions && <td className="px-4 py-3 align-top">{actions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
