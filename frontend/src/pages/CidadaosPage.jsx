import { useState } from 'react';
import { Edit, Plus, Trash2, Upload } from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import FilterBar from '../components/FilterBar.jsx';
import FormInput from '../components/FormInput.jsx';
import Modal from '../components/Modal.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useResource } from '../hooks/useResource.js';
import { api } from '../services/api.js';
import { regioes, statusAtendimentoCidadao } from '../services/options.js';

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
  status_atendimento: 'aguardando_triagem',
  unidade_referencia: '',
  historico: []
};

function buildPayload(data) {
  return {
    nome: data.nome,
    cpf: data.cpf,
    nis: data.nis || '',
    nascimento: data.nascimento || null,
    telefone: data.telefone || '',
    endereco: data.endereco || '',
    bairro: data.bairro || '',
    regiao: data.regiao || '',
    perfil_social: data.perfil_social || '',
    vulnerabilidade: Array.isArray(data.vulnerabilidade)
      ? data.vulnerabilidade
      : String(data.vulnerabilidade || '').split(',').map((item) => item.trim()).filter(Boolean),
    grau_risco: data.grau_risco || 'baixo',
    status_atendimento: data.status_atendimento || 'aguardando_triagem',
    unidade_referencia: data.unidade_referencia || '',
    historico: Array.isArray(data.historico) ? data.historico : []
  };
}

export default function CidadaosPage() {
  const cidadaos = useResource('/cidadaos');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [pageError, setPageError] = useState('');

  function handleChange(event) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError('');
    setOpen(true);
  }

  function openEdit(row) {
    setEditing(row);
    setForm({
      ...emptyForm,
      ...row,
      nascimento: row.nascimento || '',
      historico: Array.isArray(row.historico) ? row.historico : [],
      status_atendimento: row.status_atendimento || 'aguardando_triagem',
      vulnerabilidade: Array.isArray(row.vulnerabilidade) ? row.vulnerabilidade.join(', ') : row.vulnerabilidade || ''
    });
    setFormError('');
    setOpen(true);
  }

  async function submit(event) {
    event.preventDefault();
    const payload = buildPayload(form);

    setSaving(true);
    setFormError('');
    setFeedback('');
    setPageError('');
    try {
      if (editing) {
        await api.patch(`/cidadaos/${editing.id}`, payload);
        await cidadaos.load();
      } else {
        await cidadaos.create(payload);
      }

      setOpen(false);
      setFeedback(editing ? 'Cadastro atualizado com sucesso.' : 'Cidadao cadastrado com sucesso.');
    } catch (err) {
      setFormError(err.response?.data?.message || 'Nao foi possivel salvar o cadastro.');
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(row, status) {
    setFeedback('');
    setPageError('');
    try {
      await api.patch(`/cidadaos/${row.id}`, { status_atendimento: status });
      await cidadaos.load();
      setFeedback('Status atualizado e vaga vinculada sincronizada.');
    } catch (err) {
      setPageError(err.response?.data?.message || 'Nao foi possivel alterar o status.');
    }
  }

  async function uploadDocument(row, file) {
    if (!file) return;

    setFeedback('');
    setPageError('');
    try {
      const payload = new FormData();
      payload.append('documento', file);
      await api.post(`/cidadaos/${row.id}/documentos`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await cidadaos.load();
      setFeedback('Documento anexado com sucesso.');
    } catch (err) {
      setPageError(err.response?.data?.message || 'Nao foi possivel anexar o documento.');
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold uppercase text-guarulhos-700">Gestao de cidadaos</p>
        <h1 className="text-3xl font-bold">Cadastro, historico, vulnerabilidade e status</h1>
      </div>

      <FilterBar search={cidadaos.query.search || ''} onSearch={(value) => cidadaos.setQuery((prev) => ({ ...prev, search: value }))} action={(
        <button className="btn-primary" type="button" onClick={openCreate}>
          <Plus size={18} aria-hidden="true" />
          Novo cidadao
        </button>
      )} />

      {feedback && <p className="rounded-card bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{feedback}</p>}
      {pageError && <p className="rounded-card bg-red-50 p-3 text-sm font-semibold text-red-700">{pageError}</p>}
      {cidadaos.error && <p className="rounded-card bg-red-50 p-3 text-sm font-semibold text-red-700">{cidadaos.error}</p>}

      <DataTable
        data={cidadaos.items}
        loading={cidadaos.loading}
        columns={[
          { key: 'nome', label: 'Nome' },
          { key: 'cpf', label: 'CPF', render: (row) => `${String(row.cpf || '').slice(0, 3)}.***.***-**` },
          { key: 'bairro', label: 'Bairro' },
          { key: 'regiao', label: 'Regiao' },
          { key: 'grau_risco', label: 'Risco', render: (row) => <StatusBadge value={row.grau_risco} /> },
          { key: 'status_atendimento', label: 'Status', render: (row) => <StatusBadge value={row.status_atendimento || 'aguardando_triagem'} /> },
          { key: 'unidade_referencia', label: 'Referencia' }
        ]}
        actions={(row) => (
          <div className="flex flex-wrap gap-2">
            <select
              className="form-input min-h-9 w-44 py-1"
              value={row.status_atendimento || 'aguardando_triagem'}
              onChange={(event) => updateStatus(row, event.target.value)}
              aria-label="Alterar status do cidadao"
            >
              {statusAtendimentoCidadao.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <button className="btn-secondary px-3" type="button" onClick={() => openEdit(row)} aria-label="Editar cidadao">
              <Edit size={16} />
            </button>
            <label className="btn-secondary cursor-pointer px-3" aria-label="Anexar documento">
              <Upload size={16} />
              <input className="sr-only" type="file" accept="application/pdf,image/png,image/jpeg" onChange={(event) => uploadDocument(row, event.target.files?.[0])} />
            </label>
            <button className="btn-danger px-3" type="button" onClick={() => cidadaos.remove(row.id)} aria-label="Remover cidadao">
              <Trash2 size={16} />
            </button>
          </div>
        )}
      />

      <Modal open={open} title={editing ? 'Editar cidadao' : 'Novo cidadao'} onClose={() => setOpen(false)}>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
          {formError && (
            <p className="rounded-card border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700 md:col-span-2">
              {formError}
            </p>
          )}
          <FormInput label="Nome" name="nome" value={form.nome} onChange={handleChange} required />
          <FormInput label="CPF" name="cpf" value={form.cpf} onChange={handleChange} required />
          <FormInput label="NIS" name="nis" value={form.nis} onChange={handleChange} />
          <FormInput label="Nascimento" name="nascimento" type="date" value={form.nascimento} onChange={handleChange} />
          <FormInput label="Telefone" name="telefone" value={form.telefone} onChange={handleChange} />
          <FormInput label="Bairro" name="bairro" value={form.bairro} onChange={handleChange} />
          <FormInput label="Endereco" name="endereco" value={form.endereco} onChange={handleChange} />
          <FormInput label="Regiao" name="regiao" value={form.regiao} onChange={handleChange} as="select" options={regioes} />
          <FormInput label="Grau de risco" name="grau_risco" value={form.grau_risco} onChange={handleChange} as="select" options={[
            { value: 'baixo', label: 'Baixo' },
            { value: 'medio', label: 'Medio' },
            { value: 'alto', label: 'Alto' },
            { value: 'critico', label: 'Critico' }
          ]} />
          <FormInput label="Status do cidadao" name="status_atendimento" value={form.status_atendimento} onChange={handleChange} as="select" options={statusAtendimentoCidadao} />
          <FormInput label="Unidade de referencia" name="unidade_referencia" value={form.unidade_referencia} onChange={handleChange} />
          <FormInput label="Vulnerabilidades" name="vulnerabilidade" value={form.vulnerabilidade} onChange={handleChange} placeholder="pessoa_idosa, deficiencia" />
          <FormInput label="Perfil social" name="perfil_social" value={form.perfil_social} onChange={handleChange} as="textarea" />
          <div className="md:col-span-2">
            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? 'Salvando' : 'Salvar cadastro'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
