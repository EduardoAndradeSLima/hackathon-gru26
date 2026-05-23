import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import AlertCard from '../components/AlertCard.jsx';
import FormInput from '../components/FormInput.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { api } from '../services/api.js';
import { grausDependencia, regioes, tiposServico, urgencias } from '../services/options.js';

const initialForm = {
  nome: 'Simulação técnica',
  idade: 68,
  bairro: 'Vila Galvao',
  regiao: 'Norte',
  renda_aproximada: 600,
  dependentes: 1,
  pessoa_idosa: true,
  deficiencia: true,
  violencia_domestica: false,
  situacao_rua: false,
  abandono: false,
  inseguranca_alimentar: false,
  dependencia_quimica: false,
  risco_social: true,
  desemprego: false,
  urgencia: 'alta',
  grau_dependencia: 'grau_2',
  tipo_necessidade: 'ILPI'
};

const booleanFields = [
  ['pessoa_idosa', 'Pessoa idosa'],
  ['deficiencia', 'Deficiência'],
  ['violencia_domestica', 'Violência doméstica'],
  ['situacao_rua', 'Situação de rua'],
  ['abandono', 'Abandono'],
  ['inseguranca_alimentar', 'Insegurança alimentar'],
  ['dependencia_quimica', 'Dependência química'],
  ['risco_social', 'Risco social'],
  ['desemprego', 'Desemprego']
];

export default function MatchPage() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/recomendacoes', form);
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase text-guarulhos-700">Match automático</p>
        <h1 className="text-3xl font-bold">Compatibilidade perfil-vaga</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <form className="surface space-y-4 p-5" onSubmit={submit}>
          <div className="grid gap-4 md:grid-cols-2">
            <FormInput label="Nome de referência" name="nome" value={form.nome} onChange={handleChange} required />
            <FormInput label="Idade" name="idade" type="number" value={form.idade} onChange={handleChange} required />
            <FormInput label="Bairro" name="bairro" value={form.bairro} onChange={handleChange} required />
            <FormInput label="Região" name="regiao" value={form.regiao} onChange={handleChange} as="select" options={regioes} required />
            <FormInput label="Renda aproximada" name="renda_aproximada" type="number" value={form.renda_aproximada} onChange={handleChange} />
            <FormInput label="Dependentes" name="dependentes" type="number" value={form.dependentes} onChange={handleChange} />
            <FormInput label="Tipo de necessidade" name="tipo_necessidade" value={form.tipo_necessidade} onChange={handleChange} as="select" options={tiposServico} required />
            <FormInput label="Urgência" name="urgencia" value={form.urgencia} onChange={handleChange} as="select" options={urgencias} required />
            <FormInput label="Grau de dependência" name="grau_dependencia" value={form.grau_dependencia} onChange={handleChange} as="select" options={grausDependencia} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {booleanFields.map(([name, label]) => (
              <label key={name} className="flex min-h-11 items-center gap-3 rounded-card border border-civic-line px-3 text-sm font-semibold">
                <input type="checkbox" className="size-4 accent-guarulhos-700" name={name} checked={Boolean(form[name])} onChange={handleChange} />
                {label}
              </label>
            ))}
          </div>

          <button className="btn-primary" type="submit" disabled={loading}>
            <Sparkles size={18} aria-hidden="true" />
            {loading ? 'Calculando' : 'Calcular compatibilidade'}
          </button>
        </form>

        <section className="space-y-4">
          {!result && (
            <div className="surface p-5 text-sm leading-6 text-civic-muted">
              Preencha ou ajuste os dados para visualizar o score, justificativas e alertas de prioridade.
            </div>
          )}

          {result && (
            <>
              <div className="surface p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge value={result.classificacao.prioridade} />
                  <StatusBadge value={result.classificacao.grau_risco} />
                </div>
                <p className="mt-3 text-sm text-civic-muted">Fatores: {result.classificacao.fatores.join(', ') || 'sem fator crítico informado'}</p>
              </div>

              {result.alertas.map((alerta) => (
                <AlertCard key={alerta.mensagem} title="Alerta automático" message={alerta.mensagem} tone={alerta.nivel} />
              ))}

              {result.recomendacoes.map((item) => (
                <article key={item.vaga.id} className="surface p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold">{item.vaga.tipo_servico}</h2>
                      <p className="text-sm text-civic-muted">{item.osc?.nome}</p>
                    </div>
                    <span className="rounded-full bg-guarulhos-50 px-4 py-2 text-sm font-bold text-guarulhos-700">{item.aderencia}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-civic-muted">{item.justificativa}</p>
                  <div className="mt-3">
                    <StatusBadge value={item.vaga.status} />
                  </div>
                </article>
              ))}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
