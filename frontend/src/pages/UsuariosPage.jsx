import { useState } from 'react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import FilterBar from '../components/FilterBar.jsx';
import FormInput from '../components/FormInput.jsx';
import Modal from '../components/Modal.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useResource } from '../hooks/useResource.js';
import { perfisUsuario } from '../services/options.js';

const emptyForm = {
  nome: '',
  email: '',
  senha: '',
  perfil: 'FUNCIONARIO_CRAS',
  unidade: ''
};

export default function UsuariosPage() {
  const usuarios = useResource('/users');
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
    setForm({ ...emptyForm, ...row, senha: '' });
    setOpen(true);
  }

  async function submit(event) {
    event.preventDefault();
    const payload = { ...form };

    if (editing && !payload.senha) {
      delete payload.senha;
    }

    if (editing) {
      await usuarios.update(editing.id, payload);
    } else {
      await usuarios.create(payload);
    }

    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold uppercase text-guarulhos-700">Gestao de usuarios</p>
        <h1 className="text-3xl font-bold">Perfis gestores e acessos</h1>
      </div>

      <FilterBar search={usuarios.query.search || ''} onSearch={(value) => usuarios.setQuery((prev) => ({ ...prev, search: value }))} action={(
        <button className="btn-primary" type="button" onClick={openCreate}>
          <Plus size={18} aria-hidden="true" />
          Novo usuario
        </button>
      )} />

      <DataTable
        data={usuarios.items}
        loading={usuarios.loading}
        columns={[
          { key: 'nome', label: 'Nome' },
          { key: 'email', label: 'Email' },
          { key: 'perfil', label: 'Perfil', render: (row) => <StatusBadge value={row.perfil} /> },
          { key: 'unidade', label: 'Unidade' }
        ]}
        actions={(row) => (
          <div className="flex gap-2">
            <button className="btn-secondary px-3" type="button" onClick={() => openEdit(row)} aria-label="Editar usuario">
              <Edit size={16} />
            </button>
            <button className="btn-danger px-3" type="button" onClick={() => usuarios.remove(row.id)} aria-label="Remover usuario">
              <Trash2 size={16} />
            </button>
          </div>
        )}
      />

      <Modal open={open} title={editing ? 'Editar usuario' : 'Novo usuario'} onClose={() => setOpen(false)}>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
          <FormInput label="Nome" name="nome" value={form.nome} onChange={handleChange} required />
          <FormInput label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
          <FormInput label={editing ? 'Nova senha' : 'Senha'} name="senha" type="password" value={form.senha} onChange={handleChange} required={!editing} />
          <FormInput label="Perfil gestor" name="perfil" value={form.perfil} onChange={handleChange} as="select" options={perfisUsuario} required />
          <FormInput label="Unidade" name="unidade" value={form.unidade} onChange={handleChange} required />
          <div className="md:col-span-2">
            <button className="btn-primary" type="submit">Salvar usuario</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
