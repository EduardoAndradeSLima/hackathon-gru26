import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import BrandLogo from '../components/BrandLogo.jsx';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: 'admin@guarulhos.sp.gov.br', senha: 'Admin@123' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  function handleChange(event) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    try {
      await login(form.email, form.senha);
      navigate(location.state?.from?.pathname || '/app', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Nao foi possivel entrar.');
    }
  }

  async function handleRecover() {
    setError('');
    setNotice('');
    try {
      const { data } = await api.post('/auth/forgot-password', { email: form.email });
      setNotice(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Nao foi possivel solicitar recuperacao.');
    }
  }

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[0.95fr_1.05fr]">
      <section className="hidden bg-guarulhos-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="flex items-center gap-3">
          <BrandLogo light />
        </Link>
        <div>
          <p className="text-sm font-bold uppercase text-guarulhos-100">Acesso protegido</p>
          <h1 className="mt-3 max-w-xl text-4xl font-bold leading-tight">
            FacilitaGRU integra Central de Vagas, CRAS, CREAS e OSCs.
          </h1>
          <p className="mt-5 max-w-xl leading-8 text-guarulhos-100">
            Use seu perfil institucional para consultar dashboards, fila, vagas, encaminhamentos e relatórios.
          </p>
        </div>
        <p className="text-sm text-guarulhos-100">Ambiente com JWT, senha criptografada e trilha de auditoria.</p>
      </section>

      <main className="flex items-center justify-center p-4">
        <form onSubmit={handleSubmit} className="surface w-full max-w-md p-6">
          <div className="mb-6">
            <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-guarulhos-700 lg:hidden">
              <BrandLogo compact />
            </Link>
            <h1 className="text-2xl font-bold text-civic-ink">Área da gestão</h1>
            <p className="mt-2 text-sm leading-6 text-civic-muted">Entre com suas credenciais institucionais.</p>
          </div>

          {error && <p className="mb-4 rounded-card bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
          {notice && <p className="mb-4 rounded-card bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{notice}</p>}

          <label className="mb-4 block">
            <span className="form-label">Email</span>
            <input className="form-input" name="email" type="email" value={form.email} onChange={handleChange} required />
          </label>
          <label className="mb-4 block">
            <span className="form-label">Senha</span>
            <input className="form-input" name="senha" type="password" value={form.senha} onChange={handleChange} required />
          </label>

          <button className="btn-primary w-full" type="submit" disabled={loading}>
            <LogIn size={18} aria-hidden="true" />
            Entrar
          </button>

          <button type="button" className="mt-3 w-full text-sm font-semibold text-guarulhos-700 hover:underline" onClick={handleRecover}>
            Recuperar senha
          </button>
        </form>
      </main>
    </div>
  );
}
