import { CheckCircle, XCircle } from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useResource } from '../hooks/useResource.js';
import { api } from '../services/api.js';

export default function OscArea() {
  const vagas = useResource('/vagas', { limit: 100 });
  const encaminhamentos = useResource('/encaminhamentos', { limit: 100 });

  async function responder(id, status) {
    const justificativa = status === 'aceito'
      ? 'Encaminhamento aceito pela OSC.'
      : window.prompt('Informe a justificativa da recusa:') || 'Recusa registrada para reavaliacao da Central de Vagas.';

    await api.patch(`/encaminhamentos/${id}/responder`, { status, justificativa });
    await encaminhamentos.load();
    await vagas.load();
  }

  async function atualizarStatusVaga(row, status) {
    await api.put(`/vagas/${row.id}`, { ...row, status });
    await vagas.load();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase text-guarulhos-700">Área das OSCs</p>
        <h1 className="text-3xl font-bold">Vagas, encaminhamentos e justificativas</h1>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Encaminhamentos recebidos</h2>
        <DataTable
          data={encaminhamentos.items}
          loading={encaminhamentos.loading}
          columns={[
            { key: 'solicitacao_id', label: 'Solicitação' },
            { key: 'vaga_id', label: 'Vaga' },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
            { key: 'justificativa', label: 'Justificativa' }
          ]}
          actions={(row) => (
            <div className="flex gap-2">
              <button className="btn-secondary px-3 text-civic-green" type="button" onClick={() => responder(row.id, 'aceito')} aria-label="Aceitar encaminhamento">
                <CheckCircle size={16} />
              </button>
              <button className="btn-secondary px-3 text-civic-red" type="button" onClick={() => responder(row.id, 'recusado')} aria-label="Recusar encaminhamento">
                <XCircle size={16} />
              </button>
            </div>
          )}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Vagas cadastradas</h2>
        <DataTable
          data={vagas.items}
          loading={vagas.loading}
          columns={[
            { key: 'tipo_servico', label: 'Serviço' },
            { key: 'grau_dependencia', label: 'Dependência', render: (row) => String(row.grau_dependencia).replaceAll('_', ' ') },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
            { key: 'observacoes', label: 'Observações' }
          ]}
          actions={(row) => (
            <div className="flex gap-2">
              <button className="btn-secondary px-3" type="button" onClick={() => atualizarStatusVaga(row, 'disponivel')}>
                Disponível
              </button>
              <button className="btn-secondary px-3" type="button" onClick={() => atualizarStatusVaga(row, 'bloqueada')}>
                Bloquear
              </button>
            </div>
          )}
        />
      </section>
    </div>
  );
}
