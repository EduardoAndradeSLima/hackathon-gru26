import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, UserPlus } from 'lucide-react';
import AlertCard from '../components/AlertCard.jsx';
import FormInput from '../components/FormInput.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { api } from '../services/api.js';
import { regioes, tiposServico, urgencias, grausDependencia } from '../services/options.js';

const initialForm = {
  nome: '',
  idade: '',
  cpf: '',
  nis: '',
  telefone: '',
  endereco: '',
  bairro: '',
  regiao: '',
  renda_aproximada: '',
  composicao_familiar: '',
  situacao_moradia: '',
  situacao_rua: false,
  desemprego: false,
  dependentes: '',
  violencia_domestica: false,
  abandono: false,
  inseguranca_alimentar: false,
  deficiencia: false,
  pessoa_idosa: false,
  dependencia_quimica: false,
  risco_social: false,
  vinculo_cras: '',
  vinculo_creas: '',
  historico_atendimento: '',
  urgencia: 'media',
  grau_dependencia: 'nao_aplicavel',
  tipo_necessidade: ''
};

const checkboxes = [
  ['situacao_rua', 'Situação de rua'],
  ['desemprego', 'Desemprego'],
  ['violencia_domestica', 'Violência doméstica'],
  ['abandono', 'Abandono'],
  ['inseguranca_alimentar', 'Insegurança alimentar'],
  ['deficiencia', 'Deficiência'],
  ['pessoa_idosa', 'Pessoa idosa'],
  ['dependencia_quimica', 'Dependência química'],
  ['risco_social', 'Risco social']
];

export default function CitizenTriage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [created, setCreated] = useState(null);
  const [error, setError] = useState('');

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setCreated(null);
    try {
      const { data } = await api.post('/triagem', form);
      setResult(data.resultado);
      setCreated({ cidadao: data.cidadao, solicitacao: data.solicitacao });
    } catch (err) {
      setError(err.response?.data?.message || 'Nao foi possivel cadastrar o cidadao.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-civic-line bg-white">
        <div className="page-shell flex min-h-16 items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-guarulhos-700">
            <ArrowLeft size={18} />
            Voltar
          </Link>
          <Link to="/login" className="btn-secondary">Área da gestão</Link>
        </div>
      </header>

      <main className="page-shell py-8">
        <div className="mb-6 max-w-3xl">
          <p className="text-sm font-bold uppercase text-guarulhos-700">Triagem inicial</p>
          <h1 className="mt-2 text-3xl font-bold text-civic-ink">Buscar atendimento socioassistencial</h1>
          <p className="mt-3 leading-7 text-civic-muted">
            Preencha as informações principais. O sistema apresenta orientações e sugestões para avaliação da equipe técnica.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <form className="surface space-y-6 p-5" onSubmit={handleSubmit}>
            <section>
              <h2 className="text-lg font-bold">Dados pessoais</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <FormInput label="Nome" name="nome" value={form.nome} onChange={handleChange} required />
                <FormInput label="Idade" name="idade" type="number" value={form.idade} onChange={handleChange} required />
                <FormInput label="CPF" name="cpf" value={form.cpf} onChange={handleChange} />
                <FormInput label="NIS" name="nis" value={form.nis} onChange={handleChange} />
                <FormInput label="Telefone" name="telefone" value={form.telefone} onChange={handleChange} />
                <FormInput label="Bairro" name="bairro" value={form.bairro} onChange={handleChange} required />
                <FormInput label="Endereço" name="endereco" value={form.endereco} onChange={handleChange} />
                <FormInput label="Região" name="regiao" value={form.regiao} onChange={handleChange} as="select" options={regioes} required />
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold">Condições sociais</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <FormInput label="Renda aproximada" name="renda_aproximada" type="number" value={form.renda_aproximada} onChange={handleChange} />
                <FormInput label="Dependentes" name="dependentes" type="number" value={form.dependentes} onChange={handleChange} />
                <FormInput label="Composição familiar" name="composicao_familiar" value={form.composicao_familiar} onChange={handleChange} />
                <FormInput label="Situação de moradia" name="situacao_moradia" value={form.situacao_moradia} onChange={handleChange} />
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold">Vulnerabilidades</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {checkboxes.map(([name, label]) => (
                  <label key={name} className="flex min-h-11 items-center gap-3 rounded-card border border-civic-line bg-white px-3 text-sm font-semibold text-civic-ink">
                    <input type="checkbox" name={name} checked={form[name]} onChange={handleChange} className="size-4 accent-guarulhos-600" />
                    {label}
                  </label>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold">Dados técnicos</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <FormInput label="Tipo de necessidade" name="tipo_necessidade" value={form.tipo_necessidade} onChange={handleChange} as="select" options={tiposServico} required />
                <FormInput label="Urgência" name="urgencia" value={form.urgencia} onChange={handleChange} as="select" options={urgencias} required />
                <FormInput label="Grau de dependência" name="grau_dependencia" value={form.grau_dependencia} onChange={handleChange} as="select" options={grausDependencia} />
                <FormInput label="Vínculo com CRAS" name="vinculo_cras" value={form.vinculo_cras} onChange={handleChange} />
                <FormInput label="Vínculo com CREAS" name="vinculo_creas" value={form.vinculo_creas} onChange={handleChange} />
                <FormInput label="Histórico de atendimento" name="historico_atendimento" value={form.historico_atendimento} onChange={handleChange} as="textarea" />
              </div>
            </section>

            {created && (
              <AlertCard
                title="Cadastro enviado"
                message={`O cidadão foi cadastrado e a solicitação entrou para análise da gestão. Protocolo: ${created.solicitacao?.id || created.cidadao?.id}.`}
                tone="green"
              />
            )}

            {error && <AlertCard title="Atenção" message={error} tone="red" />}

            <button className="btn-primary w-full sm:w-auto" type="submit" disabled={loading}>
              <UserPlus size={18} aria-hidden="true" />
              {loading ? 'Cadastrando' : 'Cadastrar cidadão'}
            </button>
          </form>

          <aside className="space-y-4">
            <div className="surface p-5">
              <h2 className="text-lg font-bold">Resultado assistido</h2>
              <p className="mt-2 text-sm leading-6 text-civic-muted">
                A sugestão não substitui avaliação humana. Ela organiza critérios, risco e disponibilidade.
              </p>
              {!result && (
                <div className="mt-5 rounded-card bg-slate-100 p-4 text-sm text-civic-muted">
                  O resultado aparecerá aqui após o envio.
                </div>
              )}
              {result && (
                <div className="mt-5 space-y-4">
                  <div className="rounded-card border border-civic-line p-4">
                    <p className="text-sm font-semibold text-civic-muted">Classificação</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <StatusBadge value={result.classificacao.prioridade} />
                      <StatusBadge value={result.classificacao.grau_risco} />
                    </div>
                    <p className="mt-3 text-sm text-civic-muted">Score de risco: {result.classificacao.score_risco}</p>
                  </div>

                  {result.alertas.map((alerta) => (
                    <AlertCard key={alerta.mensagem} title="Alerta de prioridade" message={alerta.mensagem} tone={alerta.nivel} />
                  ))}

                  {result.recomendacoes.slice(0, 4).map((item) => (
                    <article key={item.vaga.id} className="rounded-card border border-civic-line p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold">{item.vaga.tipo_servico}</h3>
                          <p className="text-sm text-civic-muted">{item.osc?.nome}</p>
                        </div>
                        <span className="rounded-full bg-guarulhos-50 px-3 py-1 text-sm font-bold text-guarulhos-700">{item.aderencia}</span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-civic-muted">{item.justificativa}</p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
