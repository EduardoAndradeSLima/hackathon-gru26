import { useEffect, useState } from 'react';
import { Plus, Send } from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import FilterBar from '../components/FilterBar.jsx';
import FormInput from '../components/FormInput.jsx';
import Modal from '../components/Modal.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useResource } from '../hooks/useResource.js';
import { api } from '../services/api.js';
import { statusSolicitacao, tiposServico, urgencias } from '../services/options.js';

const emptyForm = {
  cidadao_id: '',
  tipo_servico: '',
  prioridade: 'media',
  status: 'pendente',
  data_solicitacao: new Date().toISOString(),
  data_encaminhamento: null
};

const priorityWeight = {
  critica: 4,
  alta: 3,
  media: 2,
  baixa: 1
};

function getWaitDays(row) {
  if (!row.data_solicitacao) return Number(row.tempo_espera_dias || 0);

  const requestedAt = new Date(row.data_solicitacao).getTime();
  if (Number.isNaN(requestedAt)) return Number(row.tempo_espera_dias || 0);

  const diff = Date.now() - requestedAt;
  return Math.max(Math.floor(diff / 86400000), Number(row.tempo_espera_dias || 0));
}

function getDynamicPriority(row) {
  const wait = getWaitDays(row);
  const current = row.prioridade || 'baixa';

  if (wait >= 60) return 'critica';
  if (wait >= 30 && priorityWeight[current] < priorityWeight.alta) return 'alta';
  if (wait >= 15 && priorityWeight[current] < priorityWeight.media) return 'media';

  return current;
}

export default function FilaEsperaPage() {
  const solicitacoes = useResource('/solicitacoes');
  const [cidadaos, setCidadaos] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  async function loadCidadaos() {
    const { data } = await api.get('/cidadaos', { params: { limit: 100 } });
    setCidadaos(data.data || []);
  }

  useEffect(() => {
    loadCidadaos();
  }, []);

  function handleChange(event) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    await solicitacoes.create({
      ...form,
      data_solicitacao: new Date().toISOString(),
      tempo_espera_dias: 0
    });
    setOpen(false);
    setForm(emptyForm);
  }

  async function encaminhar(row) {
    setFeedback('');
    setError('');

    try {
      const { data } = await api.patch(`/solicitacoes/${row.id}/encaminhar`);
      setFeedback(`Solicitacao encaminhada para ${data.osc?.nome || 'OSC'} e vaga reservada.`);
      await solicitacoes.load();
      await loadCidadaos();
    } catch (err) {
      setError(err.response?.data?.message || 'Nao foi possivel encaminhar a solicitacao.');
    }
  }

  const citizenOptions = cidadaos.map((cidadao) => ({ value: cidadao.id, label: cidadao.nome }));
  const citizenById = Object.fromEntries(cidadaos.map((cidadao) => [cidadao.id, cidadao.nome]));
  const citizenStatusById = Object.fromEntries(cidadaos.map((cidadao) => [cidadao.id, cidadao.status_atendimento || 'aguardando_triagem']));
  const dynamicQueue = [...solicitacoes.items].sort((a, b) => {
    const priorityDiff = priorityWeight[getDynamicPriority(b)] - priorityWeight[getDynamicPriority(a)];
    if (priorityDiff !== 0) return priorityDiff;
    return getWaitDays(b) - getWaitDays(a);
  });

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold uppercase text-guarulhos-700">Fila de espera</p>
        <h1 className="text-3xl font-bold">Prioridade, encaminhamento e status</h1>
      </div>

      {feedback && <p className="rounded-card bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{feedback}</p>}
      {error && <p className="rounded-card bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}

      <FilterBar search={solicitacoes.query.search || ''} onSearch={(value) => solicitacoes.setQuery((prev) => ({ ...prev, search: value }))} action={(
        <button className="btn-primary" type="button" onClick={() => setOpen(true)}>
          <Plus size={18} aria-hidden="true" />
          Nova solicitacao
        </button>
      )} />

      <DataTable
        data={dynamicQueue}
        loading={solicitacoes.loading}
        columns={[
          { key: 'cidadao_id', label: 'Cidadao', render: (row) => citizenById[row.cidadao_id] || row.cidadao_id },
          { key: 'tipo_servico', label: 'Servico' },
          { key: 'prioridade', label: 'Prioridade dinamica', render: (row) => <StatusBadge value={getDynamicPriority(row)} /> },
          { key: 'status', label: 'Solicitacao', render: (row) => <StatusBadge value={row.status} /> },
          { key: 'status_cidadao', label: 'Cidadao', render: (row) => <StatusBadge value={citizenStatusById[row.cidadao_id]} /> },
          { key: 'tempo_espera_dias', label: 'Espera', render: (row) => `${getWaitDays(row)} dias` },
          { key: 'data_solicitacao', label: 'Solicitada em', render: (row) => new Date(row.data_solicitacao).toLocaleDateString('pt-BR') }
        ]}
        actions={(row) => (
          <button
            className="btn-primary px-3"
            type="button"
            onClick={() => encaminhar(row)}
            disabled={['encaminhada', 'concluida', 'cancelada'].includes(row.status)}
            aria-label="Encaminhar para OSC com vaga disponivel"
          >
            <Send size={16} />
            Encaminhar
          </button>
        )}
      />

      <Modal open={open} title="Nova solicitacao" onClose={() => setOpen(false)}>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
          <FormInput label="Cidadao" name="cidadao_id" value={form.cidadao_id} onChange={handleChange} as="select" options={citizenOptions} required />
          <FormInput label="Tipo de servico" name="tipo_servico" value={form.tipo_servico} onChange={handleChange} as="select" options={tiposServico} required />
          <FormInput label="Prioridade" name="prioridade" value={form.prioridade} onChange={handleChange} as="select" options={urgencias} required />
          <FormInput label="Status" name="status" value={form.status} onChange={handleChange} as="select" options={statusSolicitacao} required />
          <div className="md:col-span-2">
            <button className="btn-primary" type="submit">Salvar solicitacao</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
