import { useEffect, useState } from 'react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import FilterBar from '../components/FilterBar.jsx';
import FormInput from '../components/FormInput.jsx';
import Modal from '../components/Modal.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useResource } from '../hooks/useResource.js';
import { api } from '../services/api.js';
import { grausDependencia, statusVaga, tiposServico } from '../services/options.js';

const emptyForm = {
  osc_id: '',
  tipo_servico: '',
  perfil_aceito: '',
  grau_dependencia: 'nao_aplicavel',
  status: 'disponivel',
  observacoes: ''
};

export default function VagasPage() {
  const vagas = useResource('/vagas');
  const [oscs, setOscs] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    api.get('/oscs', { params: { limit: 100 } }).then(({ data }) => setOscs(data.data || []));
  }, []);

  function changeSearch(value) {
    vagas.setQuery((prev) => ({ ...prev, search: value }));
  }

  function handleChange(event) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(row) {
    setEditing(row);
    setForm({
      ...row,
      perfil_aceito: Array.isArray(row.perfil_aceito) ? row.perfil_aceito.join(', ') : row.perfil_aceito || ''
    });
    setOpen(true);
  }

  async function submit(event) {
    event.preventDefault();
    const payload = {
      ...form,
      perfil_aceito: form.perfil_aceito.split(',').map((item) => item.trim()).filter(Boolean)
    };

    if (editing) {
      await vagas.update(editing.id, payload);
    } else {
      await vagas.create(payload);
    }

    setOpen(false);
  }

  const oscOptions = oscs.map((osc) => ({ value: osc.id, label: osc.nome }));
  const byOsc = Object.fromEntries(oscs.map((osc) => [osc.id, osc.nome]));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase text-guarulhos-700">Gestão de vagas</p>
          <h1 className="text-3xl font-bold">Vagas socioassistenciais</h1>
        </div>
      </div>

      <FilterBar search={vagas.query.search || ''} onSearch={changeSearch} action={(
        <button className="btn-primary" type="button" onClick={openCreate}>
          <Plus size={18} aria-hidden="true" />
          Nova vaga
        </button>
      )} />

      {vagas.error && <p className="rounded-card bg-red-50 p-3 text-sm font-semibold text-red-700">{vagas.error}</p>}

      <DataTable
        data={vagas.items}
        loading={vagas.loading}
        columns={[
          { key: 'tipo_servico', label: 'Serviço' },
          { key: 'osc_id', label: 'OSC', render: (row) => byOsc[row.osc_id] || row.osc_id },
          { key: 'grau_dependencia', label: 'Dependência', render: (row) => String(row.grau_dependencia).replaceAll('_', ' ') },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
          { key: 'updated_at', label: 'Atualizado', render: (row) => row.updated_at ? new Date(row.updated_at).toLocaleDateString('pt-BR') : '-' }
        ]}
        actions={(row) => (
          <div className="flex gap-2">
            <button className="btn-secondary px-3" type="button" onClick={() => openEdit(row)} aria-label="Editar vaga">
              <Edit size={16} />
            </button>
            <button className="btn-danger px-3" type="button" onClick={() => vagas.remove(row.id)} aria-label="Remover vaga">
              <Trash2 size={16} />
            </button>
          </div>
        )}
      />

      <Modal open={open} title={editing ? 'Editar vaga' : 'Nova vaga'} onClose={() => setOpen(false)}>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
          <FormInput label="OSC" name="osc_id" value={form.osc_id} onChange={handleChange} as="select" options={oscOptions} required />
          <FormInput label="Tipo de serviço" name="tipo_servico" value={form.tipo_servico} onChange={handleChange} as="select" options={tiposServico} required />
          <FormInput label="Status" name="status" value={form.status} onChange={handleChange} as="select" options={statusVaga} required />
          <FormInput label="Grau de dependência" name="grau_dependencia" value={form.grau_dependencia} onChange={handleChange} as="select" options={grausDependencia} />
          <FormInput label="Perfil aceito" name="perfil_aceito" value={form.perfil_aceito} onChange={handleChange} placeholder="idoso, deficiencia, dependencia_grau_2" />
          <FormInput label="Observações" name="observacoes" value={form.observacoes} onChange={handleChange} as="textarea" />
          <div className="md:col-span-2">
            <button className="btn-primary" type="submit">Salvar vaga</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
