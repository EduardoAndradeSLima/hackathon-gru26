import { useState } from 'react';
import { Edit, Plus, Trash2, Upload } from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import FilterBar from '../components/FilterBar.jsx';
import FormInput from '../components/FormInput.jsx';
import Modal from '../components/Modal.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useResource } from '../hooks/useResource.js';
import { api } from '../services/api.js';
import { regioes } from '../services/options.js';

const emptyForm = {
  nome: '',
  cpf: '',
  nis: '',
  nascimento: '',
  telefone: '',
  endereco: '',
  bairro: '',
  regiao: '',
  perfil_social: '',
  vulnerabilidade: '',
  grau_risco: 'baixo',
  unidade_referencia: '',
  historico: []
};

export default function CidadaosPage() {
  const cidadaos = useResource('/cidadaos');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

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
      vulnerabilidade: Array.isArray(row.vulnerabilidade) ? row.vulnerabilidade.join(', ') : row.vulnerabilidade || ''
    });
    setOpen(true);
  }

  async function submit(event) {
    event.preventDefault();
    const payload = {
      ...form,
      vulnerabilidade: String(form.vulnerabilidade).split(',').map((item) => item.trim()).filter(Boolean),
      historico: form.historico || []
    };

    if (editing) {
      await cidadaos.update(editing.id, payload);
    } else {
      await cidadaos.create(payload);
    }

    setOpen(false);
  }

  async function uploadDocument(row, file) {
    if (!file) return;

    const payload = new FormData();
    payload.append('documento', file);
    await api.post(`/cidadaos/${row.id}/documentos`, payload, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    await cidadaos.load();
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold uppercase text-guarulhos-700">Gestão de cidadãos</p>
        <h1 className="text-3xl font-bold">Cadastro, histórico e vulnerabilidade</h1>
      </div>

      <FilterBar search={cidadaos.query.search || ''} onSearch={(value) => cidadaos.setQuery((prev) => ({ ...prev, search: value }))} action={(
        <button className="btn-primary" type="button" onClick={openCreate}>
          <Plus size={18} aria-hidden="true" />
          Novo cidadão
        </button>
      )} />

      <DataTable
        data={cidadaos.items}
        loading={cidadaos.loading}
        columns={[
          { key: 'nome', label: 'Nome' },
          { key: 'cpf', label: 'CPF', render: (row) => `${String(row.cpf || '').slice(0, 3)}.***.***-**` },
          { key: 'bairro', label: 'Bairro' },
          { key: 'regiao', label: 'Região' },
          { key: 'grau_risco', label: 'Risco', render: (row) => <StatusBadge value={row.grau_risco} /> },
          { key: 'unidade_referencia', label: 'Referência' }
        ]}
        actions={(row) => (
          <div className="flex gap-2">
            <button className="btn-secondary px-3" type="button" onClick={() => openEdit(row)} aria-label="Editar cidadão">
              <Edit size={16} />
            </button>
            <label className="btn-secondary cursor-pointer px-3" aria-label="Anexar documento">
              <Upload size={16} />
              <input className="sr-only" type="file" accept="application/pdf,image/png,image/jpeg" onChange={(event) => uploadDocument(row, event.target.files?.[0])} />
            </label>
            <button className="btn-danger px-3" type="button" onClick={() => cidadaos.remove(row.id)} aria-label="Remover cidadão">
              <Trash2 size={16} />
            </button>
          </div>
        )}
      />

      <Modal open={open} title={editing ? 'Editar cidadão' : 'Novo cidadão'} onClose={() => setOpen(false)}>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
          <FormInput label="Nome" name="nome" value={form.nome} onChange={handleChange} required />
          <FormInput label="CPF" name="cpf" value={form.cpf} onChange={handleChange} required />
          <FormInput label="NIS" name="nis" value={form.nis} onChange={handleChange} />
          <FormInput label="Nascimento" name="nascimento" type="date" value={form.nascimento} onChange={handleChange} />
          <FormInput label="Telefone" name="telefone" value={form.telefone} onChange={handleChange} />
          <FormInput label="Bairro" name="bairro" value={form.bairro} onChange={handleChange} />
          <FormInput label="Endereço" name="endereco" value={form.endereco} onChange={handleChange} />
          <FormInput label="Região" name="regiao" value={form.regiao} onChange={handleChange} as="select" options={regioes} />
          <FormInput label="Grau de risco" name="grau_risco" value={form.grau_risco} onChange={handleChange} as="select" options={[
            { value: 'baixo', label: 'Baixo' },
            { value: 'medio', label: 'Médio' },
            { value: 'alto', label: 'Alto' },
            { value: 'critico', label: 'Crítico' }
          ]} />
          <FormInput label="Unidade de referência" name="unidade_referencia" value={form.unidade_referencia} onChange={handleChange} />
          <FormInput label="Vulnerabilidades" name="vulnerabilidade" value={form.vulnerabilidade} onChange={handleChange} placeholder="pessoa_idosa, deficiencia" />
          <FormInput label="Perfil social" name="perfil_social" value={form.perfil_social} onChange={handleChange} as="textarea" />
          <div className="md:col-span-2">
            <button className="btn-primary" type="submit">Salvar cadastro</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
