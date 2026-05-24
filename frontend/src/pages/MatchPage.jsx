import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import AlertCard from '../components/AlertCard.jsx';
import FormInput from '../components/FormInput.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { api } from '../services/api.js';
import { bairros, getRegionByBairro } from '../services/options.js';

const initialForm = {
  nome: 'Simulacao ILPI',
  idade: 78,
  bairro: 'Vila Galvao',
  regiao: 'Norte',
  tipo_necessidade: 'ILPI',
  grau_mobilidade: 'apoio',
  alimentacao: 'assistida',
  higiene_pessoal: 'assistida',
  cognicao: 'confusao_leve',
  uso_medicamentos: 'supervisionado',
  presenca_cuidador: 'parcial',
  risco_abandono: 'alto',
  situacao_moradia: 'com_familia',
  renda_aproximada: 700,
  saude: 'fragil',
  tempo_espera_dias: 20
};

const options = {
  grau_mobilidade: [
    { value: 'independente', label: 'Independente' },
    { value: 'apoio', label: 'Anda com apoio' },
    { value: 'cadeira_rodas', label: 'Cadeira de rodas' },
    { value: 'acamado', label: 'Acamado' }
  ],
  alimentacao: [
    { value: 'independente', label: 'Independente' },
    { value: 'assistida', label: 'Assistida' }
  ],
  higiene_pessoal: [
    { value: 'independente', label: 'Independente' },
    { value: 'assistida', label: 'Assistida' },
    { value: 'dependente', label: 'Dependente' }
  ],
  cognicao: [
    { value: 'preservada', label: 'Preservada' },
    { value: 'confusao_leve', label: 'Confusao leve' },
    { value: 'comprometida', label: 'Comprometida' }
  ],
  uso_medicamentos: [
    { value: 'autonomo', label: 'Usa sozinho' },
    { value: 'supervisionado', label: 'Precisa de supervisao' },
    { value: 'administrado', label: 'Outra pessoa administra' }
  ],
  presenca_cuidador: [
    { value: 'sim', label: 'Sim' },
    { value: 'parcial', label: 'Parcial' },
    { value: 'nao', label: 'Nao' }
  ],
  risco_abandono: [
    { value: 'baixo', label: 'Baixo' },
    { value: 'medio', label: 'Medio' },
    { value: 'alto', label: 'Alto' },
    { value: 'critico', label: 'Critico' }
  ],
  situacao_moradia: [
    { value: 'propria_alugada', label: 'Casa propria ou alugada' },
    { value: 'com_familia', label: 'Com familia' },
    { value: 'provisoria', label: 'Moradia provisoria' },
    { value: 'rua', label: 'Situacao de rua' },
    { value: 'institucional', label: 'Institucional' }
  ],
  saude: [
    { value: 'estavel', label: 'Estavel' },
    { value: 'acompanhamento', label: 'Em acompanhamento' },
    { value: 'fragil', label: 'Fragil' },
    { value: 'grave', label: 'Grave' }
  ]
};

export default function MatchPage() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'bairro' ? { regiao: getRegionByBairro(value) } : {})
    }));
  }

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/recomendacoes', {
        ...form,
        regiao: getRegionByBairro(form.bairro),
        idade: Number(form.idade),
        renda_aproximada: Number(form.renda_aproximada),
        tempo_espera_dias: Number(form.tempo_espera_dias || 0)
      });
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase text-guarulhos-700">Match automatico ILPI</p>
        <h1 className="text-3xl font-bold">Compatibilidade perfil-vaga</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <form className="surface space-y-4 p-5" onSubmit={submit}>
          <div className="grid gap-4 md:grid-cols-2">
            <FormInput label="Nome de referencia" name="nome" value={form.nome} onChange={handleChange} required />
            <FormInput label="Idade" name="idade" type="number" value={form.idade} onChange={handleChange} required />
            <FormInput label="Bairro" name="bairro" value={form.bairro} onChange={handleChange} as="select" options={bairros} required />
            <label className="block" htmlFor="field-match-regiao">
              <span className="form-label">Regiao automatica</span>
              <input id="field-match-regiao" className="form-input bg-guarulhos-50 font-semibold" value={getRegionByBairro(form.bairro)} readOnly />
            </label>
            <FormInput label="Grau de mobilidade" name="grau_mobilidade" value={form.grau_mobilidade} onChange={handleChange} as="select" options={options.grau_mobilidade} required />
            <FormInput label="Alimentacao" name="alimentacao" value={form.alimentacao} onChange={handleChange} as="select" options={options.alimentacao} required />
            <FormInput label="Higiene pessoal" name="higiene_pessoal" value={form.higiene_pessoal} onChange={handleChange} as="select" options={options.higiene_pessoal} required />
            <FormInput label="Cognicao" name="cognicao" value={form.cognicao} onChange={handleChange} as="select" options={options.cognicao} required />
            <FormInput label="Uso de medicamentos" name="uso_medicamentos" value={form.uso_medicamentos} onChange={handleChange} as="select" options={options.uso_medicamentos} required />
            <FormInput label="Presenca de cuidador" name="presenca_cuidador" value={form.presenca_cuidador} onChange={handleChange} as="select" options={options.presenca_cuidador} required />
            <FormInput label="Risco de abandono" name="risco_abandono" value={form.risco_abandono} onChange={handleChange} as="select" options={options.risco_abandono} required />
            <FormInput label="Situacao de moradia" name="situacao_moradia" value={form.situacao_moradia} onChange={handleChange} as="select" options={options.situacao_moradia} required />
            <FormInput label="Renda aproximada" name="renda_aproximada" type="number" value={form.renda_aproximada} onChange={handleChange} required />
            <FormInput label="Condicao de saude" name="saude" value={form.saude} onChange={handleChange} as="select" options={options.saude} required />
            <FormInput label="Tempo de espera em dias" name="tempo_espera_dias" type="number" value={form.tempo_espera_dias} onChange={handleChange} />
          </div>

          <button className="btn-primary" type="submit" disabled={loading}>
            <Sparkles size={18} aria-hidden="true" />
            {loading ? 'Calculando' : 'Calcular compatibilidade'}
          </button>
        </form>

        <section className="space-y-4">
          {!result && (
            <div className="surface p-5 text-sm leading-6 text-civic-muted">
              Ajuste os criterios ILPI para visualizar grau automatico, indice de vulnerabilidade, alertas e vagas compativeis.
            </div>
          )}

          {result && (
            <>
              <div className="surface p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge value={result.classificacao.grau_dependencia} />
                  <StatusBadge value={result.classificacao.grau_risco} />
                  <StatusBadge value={result.classificacao.prioridade} />
                </div>
                <p className="mt-3 text-sm text-civic-muted">Indice de vulnerabilidade: {result.classificacao.indice_vulnerabilidade}</p>
                <p className="mt-2 text-sm text-civic-muted">Fatores: {result.classificacao.fatores.join(', ') || 'sem fator critico informado'}</p>
              </div>

              {result.alertas.map((alerta) => (
                <AlertCard key={alerta.mensagem} title="Alerta automatico" message={alerta.mensagem} tone={alerta.nivel} />
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
