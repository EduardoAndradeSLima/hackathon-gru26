import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
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
  data_encaminhamento: null,
  tempo_espera_dias: 0
};

export default function FilaEsperaPage() {
  const solicitacoes = useResource('/solicitacoes');
  const [cidadaos, setCidadaos] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    api.get('/cidadaos', { params: { limit: 100 } }).then(({ data }) => setCidadaos(data.data || []));
  }, []);

  function handleChange(event) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    await solicitacoes.create({
      ...form,
      tempo_espera_dias: Number(form.tempo_espera_dias || 0)
    });
    setOpen(false);
    setForm(emptyForm);
  }

  const citizenOptions = cidadaos.map((cidadao) => ({ value: cidadao.id, label: cidadao.nome }));
  const citizenById = Object.fromEntries(cidadaos.map((cidadao) => [cidadao.id, cidadao.nome]));

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold uppercase text-guarulhos-700">Fila de espera</p>
        <h1 className="text-3xl font-bold">Prioridade, status e tempo de espera</h1>
      </div>

      <FilterBar search={solicitacoes.query.search || ''} onSearch={(value) => solicitacoes.setQuery((prev) => ({ ...prev, search: value }))} action={(
        <button className="btn-primary" type="button" onClick={() => setOpen(true)}>
          <Plus size={18} aria-hidden="true" />
          Nova solicitação
        </button>
      )} />

      <DataTable
        data={solicitacoes.items}
        loading={solicitacoes.loading}
        columns={[
          { key: 'cidadao_id', label: 'Cidadão', render: (row) => citizenById[row.cidadao_id] || row.cidadao_id },
          { key: 'tipo_servico', label: 'Serviço' },
          { key: 'prioridade', label: 'Prioridade', render: (row) => <StatusBadge value={row.prioridade} /> },
          { key: 'status', label: 'Situação', render: (row) => <StatusBadge value={row.status} /> },
          { key: 'tempo_espera_dias', label: 'Espera', render: (row) => `${row.tempo_espera_dias || 0} dias` },
          { key: 'data_solicitacao', label: 'Solicitada em', render: (row) => new Date(row.data_solicitacao).toLocaleDateString('pt-BR') }
        ]}
      />

      <Modal open={open} title="Nova solicitação" onClose={() => setOpen(false)}>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
          <FormInput label="Cidadão" name="cidadao_id" value={form.cidadao_id} onChange={handleChange} as="select" options={citizenOptions} required />
          <FormInput label="Tipo de serviço" name="tipo_servico" value={form.tipo_servico} onChange={handleChange} as="select" options={tiposServico} required />
          <FormInput label="Prioridade" name="prioridade" value={form.prioridade} onChange={handleChange} as="select" options={urgencias} required />
          <FormInput label="Status" name="status" value={form.status} onChange={handleChange} as="select" options={statusSolicitacao} required />
          <FormInput label="Tempo de espera em dias" name="tempo_espera_dias" type="number" value={form.tempo_espera_dias} onChange={handleChange} />
          <div className="md:col-span-2">
            <button className="btn-primary" type="submit">Salvar solicitação</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
