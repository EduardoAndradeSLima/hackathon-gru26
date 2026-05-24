import { useEffect, useState } from 'react';
import { Plus, Send } from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import FilterBar from '../components/FilterBar.jsx';
import FormInput from '../components/FormInput.jsx';
import Modal from '../components/Modal.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useResource } from '../hooks/useResource.js';
import { api } from '../services/api.js';
import { statusSolicitacao, urgencias } from '../services/options.js';

const emptyForm = {
  cidadao_id: '',
  tipo_servico: 'ILPI',
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

function getDynamicPriority(row) {
  return row.prioridade || 'baixa';
}

export default function FilaEsperaPage() {
  const solicitacoes = useResource('/solicitacoes', { tipo_servico: 'ILPI', limit: 100 });
  const vagas = useResource('/vagas', { tipo_servico: 'ILPI', limit: 100 });
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
      data_solicitacao: new Date().toISOString()
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
      await vagas.load();
      await loadCidadaos();
    } catch (err) {
      setError(err.response?.data?.message || 'Nao foi possivel encaminhar a solicitacao.');
    }
  }

  const citizenOptions = cidadaos.map((cidadao) => ({ value: cidadao.id, label: cidadao.nome }));
  const citizenById = Object.fromEntries(cidadaos.map((cidadao) => [cidadao.id, cidadao]));
  const citizenStatusById = Object.fromEntries(cidadaos.map((cidadao) => [cidadao.id, cidadao.status_atendimento || 'aguardando_triagem']));
  const availableVagas = vagas.items.filter((vaga) => vaga.status === 'disponivel');
  const latestByCitizen = Object.values(solicitacoes.items.reduce((acc, item) => {
    const current = acc[item.cidadao_id];
    const currentDate = new Date(current?.updated_at || current?.created_at || current?.data_solicitacao || 0).getTime();
    const itemDate = new Date(item.updated_at || item.created_at || item.data_solicitacao || 0).getTime();
    if (!current || itemDate >= currentDate) {
      acc[item.cidadao_id] = item;
    }
    return acc;
  }, {}));
  const dynamicQueue = latestByCitizen.sort((a, b) => {
    const priorityDiff = priorityWeight[getDynamicPriority(b)] - priorityWeight[getDynamicPriority(a)];
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(a.data_solicitacao || 0).getTime() - new Date(b.data_solicitacao || 0).getTime();
  });

  function getCitizen(row) {
    return citizenById[row.cidadao_id] || null;
  }

  function getCitizenGrade(row) {
    const citizen = getCitizen(row);
    return Array.isArray(citizen?.vulnerabilidade)
      ? citizen.vulnerabilidade.find((item) => ['grau_1', 'grau_2', 'grau_3'].includes(item))
      : null;
  }

  function hasCompatibleVacancy(row) {
    const grade = getCitizenGrade(row);
    if (!grade) {
      return availableVagas.length > 0;
    }

    return availableVagas.some((vaga) => vaga.grau_dependencia === grade);
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold uppercase text-guarulhos-700">Fila ILPI</p>
        <h1 className="text-3xl font-bold">Prioridade, encaminhamento e status</h1>
      </div>

      {feedback && <p className="rounded-card bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{feedback}</p>}
      {error && <p className="rounded-card bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
      {!vagas.loading && availableVagas.length === 0 && (
        <p className="rounded-card bg-amber-50 p-3 text-sm font-semibold text-amber-700">
          Todas as vagas ILPI estao reservadas, ocupadas ou bloqueadas. Novos casos permanecem na fila para avaliacao humana.
        </p>
      )}

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
          { key: 'cidadao_id', label: 'Nome', render: (row) => getCitizen(row)?.nome || row.cidadao_id },
          { key: 'prioridade', label: 'Prioridade dinamica', render: (row) => <StatusBadge value={getDynamicPriority(row)} /> },
          { key: 'status', label: 'Solicitacao', render: (row) => <StatusBadge value={row.status} /> },
          { key: 'status_cidadao', label: 'Status do cidadao', render: (row) => <StatusBadge value={citizenStatusById[row.cidadao_id]} /> },
          { key: 'data_solicitacao', label: 'Solicitada em', render: (row) => new Date(row.data_solicitacao).toLocaleDateString('pt-BR') }
        ]}
        actions={(row) => (
          ['encaminhada', 'concluida', 'cancelada'].includes(row.status) ? (
            <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">
              Sem acao pendente
            </span>
          ) : !hasCompatibleVacancy(row) ? (
            <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
              Sem vaga compativel
            </span>
          ) : (
            <button
              className="btn-primary px-3"
              type="button"
              onClick={() => encaminhar(row)}
              aria-label="Encaminhar para OSC com vaga disponivel"
            >
              <Send size={16} />
              Encaminhar
            </button>
          )
        )}
      />

      <Modal open={open} title="Nova solicitacao" onClose={() => setOpen(false)}>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
          <FormInput label="Cidadao" name="cidadao_id" value={form.cidadao_id} onChange={handleChange} as="select" options={citizenOptions} required />
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
