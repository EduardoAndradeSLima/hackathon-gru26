import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import FormInput from '../components/FormInput.jsx';
import { api, downloadReport } from '../services/api.js';

const tipos = [
  { value: 'ocupacao', label: 'Ocupação' },
  { value: 'demanda', label: 'Demanda' },
  { value: 'encaminhamentos', label: 'Encaminhamentos' }
];

export default function RelatoriosPage() {
  const [tipo, setTipo] = useState('ocupacao');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    api.get('/relatorios', { params: { tipo } })
      .then(({ data }) => setRows(data.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Nao foi possivel carregar o relatorio.'))
      .finally(() => setLoading(false));
  }, [tipo]);

  async function baixar(format) {
    setError('');
    try {
      await downloadReport(format, tipo);
    } catch (err) {
      setError(err.response?.data?.message || 'Nao foi possivel baixar o arquivo.');
    }
  }

  const columns = rows[0]
    ? Object.keys(rows[0]).map((key) => ({
      key,
      label: key.replaceAll('_', ' ')
    }))
    : [{ key: 'vazio', label: 'Relatório' }];

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold uppercase text-guarulhos-700">Relatórios</p>
        <h1 className="text-3xl font-bold">Exportação e transparência operacional</h1>
      </div>

      <div className="surface flex flex-col gap-3 p-4 md:flex-row md:items-end md:justify-between">
        <div className="w-full md:max-w-xs">
          <FormInput label="Tipo de relatório" name="tipo" value={tipo} onChange={(event) => setTipo(event.target.value)} as="select" options={tipos} />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button className="btn-secondary" type="button" onClick={() => baixar('csv')}>
            <Download size={18} aria-hidden="true" />
            CSV
          </button>
          <button className="btn-primary" type="button" onClick={() => baixar('pdf')}>
            <Download size={18} aria-hidden="true" />
            PDF
          </button>
        </div>
      </div>

      {error && <p className="rounded-card bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}

      <DataTable
        data={rows.map((row, index) => ({ id: `${tipo}-${index}`, ...row }))}
        loading={loading}
        columns={columns}
        empty="Nenhum dado para o relatório selecionado."
      />
    </div>
  );
}
