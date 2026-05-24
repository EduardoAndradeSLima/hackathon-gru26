import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import Modal from '../components/Modal.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useResource } from '../hooks/useResource.js';
import { api } from '../services/api.js';

export default function OscArea() {
  const vagas = useResource('/vagas', { tipo_servico: 'ILPI', limit: 100 });
  const encaminhamentos = useResource('/encaminhamentos', { limit: 100 });
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [recusa, setRecusa] = useState({ open: false, id: null, justificativa: '' });

  async function responder(id, status, justificativa) {
    setFeedback('');
    setError('');

    try {
      await api.patch(`/encaminhamentos/${id}/responder`, { status, justificativa });
      await encaminhamentos.load();
      await vagas.load();
      setFeedback(status === 'aceito'
        ? 'Encaminhamento aceito e vaga marcada como ocupada.'
        : 'Recusa registrada e vaga liberada para nova avaliacao.');
    } catch (err) {
      setError(err.response?.data?.message || 'Nao foi possivel responder o encaminhamento.');
    }
  }

  function abrirRecusa(id) {
    setRecusa({
      open: true,
      id,
      justificativa: 'Recusa tecnica registrada para reavaliacao da Central de Vagas.'
    });
  }

  async function confirmarRecusa(event) {
    event.preventDefault();
    await responder(recusa.id, 'recusado', recusa.justificativa);
    setRecusa({ open: false, id: null, justificativa: '' });
  }

  async function atualizarStatusVaga(row, status) {
    setFeedback('');
    setError('');

    try {
      await api.put(`/vagas/${row.id}`, { ...row, status });
      await vagas.load();
      setFeedback(status === 'disponivel'
        ? 'Vaga liberada para encaminhamento.'
        : 'Vaga bloqueada para revisao tecnica.');
    } catch (err) {
      setError(err.response?.data?.message || 'Nao foi possivel atualizar a vaga.');
    }
  }

  const vagaIdsIlpi = new Set(vagas.items.map((vaga) => vaga.id));
  const encaminhamentosIlpi = encaminhamentos.items.filter((item) => vagaIdsIlpi.has(item.vaga_id));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase text-guarulhos-700">Area das OSCs</p>
        <h1 className="text-3xl font-bold">Vagas ILPI, encaminhamentos e justificativas</h1>
      </div>

      {feedback && <p className="rounded-card bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{feedback}</p>}
      {error && <p className="rounded-card bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Encaminhamentos recebidos</h2>
        <DataTable
          data={encaminhamentosIlpi}
          loading={encaminhamentos.loading}
          columns={[
            { key: 'solicitacao_id', label: 'Solicitacao' },
            { key: 'vaga_id', label: 'Vaga' },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
            { key: 'justificativa', label: 'Justificativa' }
          ]}
          actions={(row) => (
            <div className="flex gap-2">
              <button className="btn-secondary px-3 text-civic-green" type="button" onClick={() => responder(row.id, 'aceito', 'Encaminhamento aceito pela OSC.')} aria-label="Aceitar encaminhamento">
                <CheckCircle size={16} />
              </button>
              <button className="btn-secondary px-3 text-civic-red" type="button" onClick={() => abrirRecusa(row.id)} aria-label="Recusar encaminhamento">
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
            { key: 'grau_dependencia', label: 'Dependencia', render: (row) => String(row.grau_dependencia).replaceAll('_', ' ') },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
            { key: 'observacoes', label: 'Observacoes' }
          ]}
          actions={(row) => (
            <div className="flex gap-2">
              <button className="btn-secondary px-3" type="button" onClick={() => atualizarStatusVaga(row, 'disponivel')}>
                Disponivel
              </button>
              <button className="btn-secondary px-3" type="button" onClick={() => atualizarStatusVaga(row, 'bloqueada')}>
                Bloquear
              </button>
            </div>
          )}
        />
      </section>

      <Modal open={recusa.open} title="Justificar recusa" onClose={() => setRecusa({ open: false, id: null, justificativa: '' })}>
        <form className="space-y-4" onSubmit={confirmarRecusa}>
          <label className="block" htmlFor="justificativa-recusa">
            <span className="form-label">Justificativa tecnica</span>
            <textarea
              id="justificativa-recusa"
              className="form-input min-h-32"
              value={recusa.justificativa}
              onChange={(event) => setRecusa((prev) => ({ ...prev, justificativa: event.target.value }))}
              required
            />
          </label>
          <button className="btn-primary" type="submit">Registrar recusa</button>
        </form>
      </Modal>
    </div>
  );
}
