import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ClipboardCheck, UserPlus } from 'lucide-react';
import AlertCard from '../components/AlertCard.jsx';
import FormInput from '../components/FormInput.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { api } from '../services/api.js';
import { bairros, getRegionByBairro } from '../services/options.js';

const initialForm = {
  nome: '',
  idade: '',
  cpf: '',
  nis: '',
  telefone: '',
  endereco: '',
  bairro: '',
  regiao: '',
  tipo_necessidade: 'ILPI',
  grau_mobilidade: '',
  alimentacao: '',
  higiene_pessoal: '',
  cognicao: '',
  uso_medicamentos: '',
  presenca_cuidador: '',
  risco_abandono: '',
  situacao_moradia: '',
  renda_aproximada: '',
  saude: ''
};

const mobilityOptions = [
  { value: 'independente', label: 'Independente' },
  { value: 'apoio', label: 'Anda com apoio' },
  { value: 'cadeira_rodas', label: 'Cadeira de rodas' },
  { value: 'acamado', label: 'Acamado' }
];

const feedingOptions = [
  { value: 'independente', label: 'Independente' },
  { value: 'assistida', label: 'Assistida' }
];

const hygieneOptions = [
  { value: 'independente', label: 'Independente' },
  { value: 'assistida', label: 'Assistida' },
  { value: 'dependente', label: 'Dependente' }
];

const cognitionOptions = [
  { value: 'preservada', label: 'Preservada' },
  { value: 'confusao_leve', label: 'Confusao leve' },
  { value: 'comprometida', label: 'Comprometida' }
];

const medicationOptions = [
  { value: 'autonomo', label: 'Usa sozinho' },
  { value: 'supervisionado', label: 'Precisa de supervisao' },
  { value: 'administrado', label: 'Outra pessoa administra' }
];

const caregiverOptions = [
  { value: 'sim', label: 'Sim' },
  { value: 'parcial', label: 'Parcial' },
  { value: 'nao', label: 'Nao' }
];

const riskOptions = [
  { value: 'baixo', label: 'Baixo' },
  { value: 'medio', label: 'Medio' },
  { value: 'alto', label: 'Alto' },
  { value: 'critico', label: 'Critico' }
];

const housingOptions = [
  { value: 'propria_alugada', label: 'Casa propria ou alugada' },
  { value: 'com_familia', label: 'Com familia' },
  { value: 'provisoria', label: 'Moradia provisoria' },
  { value: 'rua', label: 'Situacao de rua' },
  { value: 'institucional', label: 'Institucional' }
];

const healthOptions = [
  { value: 'estavel', label: 'Estavel' },
  { value: 'acompanhamento', label: 'Em acompanhamento' },
  { value: 'fragil', label: 'Fragil' },
  { value: 'grave', label: 'Grave' }
];

const dependencyPreview = {
  grau_1: { title: 'Grau 1', text: 'Independente', tone: 'baixo' },
  grau_2: { title: 'Grau 2', text: 'Semi-dependente', tone: 'medio' },
  grau_3: { title: 'Grau 3', text: 'Dependente total', tone: 'alto' }
};

function previewDependency(form) {
  let score = 0;

  if (form.grau_mobilidade === 'apoio') score += 1;
  if (form.grau_mobilidade === 'cadeira_rodas') score += 2;
  if (form.grau_mobilidade === 'acamado') score += 3;
  if (form.alimentacao === 'assistida') score += 2;
  if (form.higiene_pessoal === 'assistida') score += 1;
  if (form.higiene_pessoal === 'dependente') score += 3;
  if (form.cognicao === 'confusao_leve') score += 1;
  if (form.cognicao === 'comprometida') score += 3;
  if (form.uso_medicamentos === 'supervisionado') score += 1;
  if (form.uso_medicamentos === 'administrado') score += 2;

  if (score >= 8 || form.grau_mobilidade === 'acamado' || form.higiene_pessoal === 'dependente') {
    return { ...dependencyPreview.grau_3, score };
  }

  if (score >= 4) {
    return { ...dependencyPreview.grau_2, score };
  }

  return { ...dependencyPreview.grau_1, score };
}

export default function CitizenTriage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [created, setCreated] = useState(null);
  const [error, setError] = useState('');
  const preview = useMemo(() => previewDependency(form), [form]);
  const regiaoAutomatica = useMemo(() => getRegionByBairro(form.bairro), [form.bairro]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'bairro' ? { regiao: getRegionByBairro(value) } : {})
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setCreated(null);

    try {
      const { data } = await api.post('/triagem', {
        ...form,
        tipo_necessidade: 'ILPI',
        regiao: getRegionByBairro(form.bairro),
        idade: Number(form.idade),
        renda_aproximada: Number(form.renda_aproximada)
      });
      setResult(data.resultado);
      setCreated({
        cidadao: data.cidadao,
        solicitacao: data.solicitacao,
        encaminhamento: data.encaminhamento,
        fluxo: data.fluxo
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Nao foi possivel cadastrar a triagem ILPI.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-guarulhos-600 bg-guarulhos-500">
        <div className="page-shell flex min-h-16 items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-guarulhos-900">
            <ArrowLeft size={18} />
            Voltar
          </Link>
          <Link to="/login" className="btn-secondary">Area da gestao</Link>
        </div>
      </header>

      <main className="page-shell py-8">
        <div className="mb-6 max-w-3xl">
          <p className="text-sm font-bold uppercase text-guarulhos-700">Triagem ILPI</p>
          <h1 className="mt-2 text-3xl font-bold text-civic-ink">Formulario unico para ILPI</h1>
          <p className="mt-3 leading-7 text-civic-muted">
            Cadastro estruturado para classificar grau de dependencia, vulnerabilidade social, prioridade e compatibilidade com vaga.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <form className="surface space-y-6 p-5" onSubmit={handleSubmit}>
            <section>
              <h2 className="text-lg font-bold">Identificacao</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <FormInput label="Nome" name="nome" value={form.nome} onChange={handleChange} required />
                <FormInput label="Idade" name="idade" type="number" value={form.idade} onChange={handleChange} required />
                <FormInput label="CPF" name="cpf" value={form.cpf} onChange={handleChange} />
                <FormInput label="NIS" name="nis" value={form.nis} onChange={handleChange} />
                <FormInput label="Telefone" name="telefone" value={form.telefone} onChange={handleChange} />
                <FormInput label="Bairro" name="bairro" value={form.bairro} onChange={handleChange} as="select" options={bairros} required />
                <FormInput label="Endereco" name="endereco" value={form.endereco} onChange={handleChange} />
                <label className="block" htmlFor="field-regiao-automatica">
                  <span className="form-label">Regiao identificada automaticamente</span>
                  <input id="field-regiao-automatica" className="form-input bg-guarulhos-50 font-semibold" value={regiaoAutomatica} readOnly />
                </label>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2">
                <ClipboardCheck size={20} className="text-guarulhos-700" aria-hidden="true" />
                <h2 className="text-lg font-bold">Checklist ILPI obrigatorio</h2>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <FormInput label="Grau de mobilidade" name="grau_mobilidade" value={form.grau_mobilidade} onChange={handleChange} as="select" options={mobilityOptions} required />
                <FormInput label="Alimentacao" name="alimentacao" value={form.alimentacao} onChange={handleChange} as="select" options={feedingOptions} required />
                <FormInput label="Higiene pessoal" name="higiene_pessoal" value={form.higiene_pessoal} onChange={handleChange} as="select" options={hygieneOptions} required />
                <FormInput label="Cognicao" name="cognicao" value={form.cognicao} onChange={handleChange} as="select" options={cognitionOptions} required />
                <FormInput label="Uso de medicamentos" name="uso_medicamentos" value={form.uso_medicamentos} onChange={handleChange} as="select" options={medicationOptions} required />
                <FormInput label="Presenca de cuidador" name="presenca_cuidador" value={form.presenca_cuidador} onChange={handleChange} as="select" options={caregiverOptions} required />
                <FormInput label="Risco de abandono" name="risco_abandono" value={form.risco_abandono} onChange={handleChange} as="select" options={riskOptions} required />
                <FormInput label="Situacao de moradia" name="situacao_moradia" value={form.situacao_moradia} onChange={handleChange} as="select" options={housingOptions} required />
                <FormInput label="Renda aproximada" name="renda_aproximada" type="number" value={form.renda_aproximada} onChange={handleChange} required />
                <FormInput label="Condicao de saude" name="saude" value={form.saude} onChange={handleChange} as="select" options={healthOptions} required />
              </div>
            </section>

            {created && (
              <AlertCard
                title="Triagem ILPI cadastrada"
                message={created.encaminhamento
                  ? `O caso foi pre-encaminhado para avaliacao humana e aguarda aceite final. Tambem foi gerado aviso regional. Protocolo: ${created.solicitacao?.id || created.cidadao?.id}.`
                  : `O caso entrou em analise e gerou aviso para a equipe da regiao ${created.cidadao?.regiao || regiaoAutomatica}. Protocolo: ${created.solicitacao?.id || created.cidadao?.id}.`}
                tone="green"
              />
            )}

            {error && <AlertCard title="Atencao" message={error} tone="red" />}

            <button className="btn-primary w-full sm:w-auto" type="submit" disabled={loading}>
              <UserPlus size={18} aria-hidden="true" />
              {loading ? 'Cadastrando' : 'Cadastrar caso ILPI'}
            </button>
          </form>

          <aside className="space-y-4">
            <div className="surface p-5">
              <h2 className="text-lg font-bold">Classificacao assistida</h2>
              <div className="mt-4 rounded-card border border-civic-line p-4">
                <p className="text-sm font-semibold text-civic-muted">Previa do grau</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-3 py-1 text-sm font-bold ${
                    preview.tone === 'alto'
                      ? 'border-red-200 bg-red-50 text-red-700'
                      : preview.tone === 'medio'
                        ? 'border-amber-200 bg-amber-50 text-amber-700'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  }`}>
                    {preview.title} - {preview.text}
                  </span>
                </div>
                <p className="mt-2 text-sm text-civic-muted">{preview.text}. Pontos tecnicos: {preview.score}</p>
              </div>

              {!result && (
                <div className="mt-5 rounded-card bg-guarulhos-50 p-4 text-sm leading-6 text-civic-muted">
                  O resultado final aparecera aqui apos o cadastro com grau, score de vulnerabilidade, alertas e vagas compativeis.
                  O sistema pode pre-encaminhar o caso para evitar lentidao, mas o aceite final continua sendo humano.
                </div>
              )}

              {result && (
                <div className="mt-5 space-y-4">
                  <div className="rounded-card border border-civic-line p-4">
                    <p className="text-sm font-semibold text-civic-muted">Resultado tecnico</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <StatusBadge value={result.classificacao.grau_dependencia} />
                      <StatusBadge value={result.classificacao.grau_risco} />
                      <StatusBadge value={result.classificacao.prioridade} />
                    </div>
                    <p className="mt-3 text-sm text-civic-muted">
                      Indice de vulnerabilidade: {result.classificacao.indice_vulnerabilidade}
                    </p>
                    <p className="mt-1 text-sm text-civic-muted">
                      Grau: {result.classificacao.descricao_dependencia || 'nao informado'}
                    </p>
                  </div>

                  {result.alertas.map((alerta) => (
                    <AlertCard key={alerta.mensagem} title="Alerta automatico" message={alerta.mensagem} tone={alerta.nivel} />
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
