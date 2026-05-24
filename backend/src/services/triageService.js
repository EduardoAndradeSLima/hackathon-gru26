const store = require('../database/store');
const recommendationService = require('./recommendationService');

const vulnerabilityFields = [
  'situacao_rua',
  'desemprego',
  'violencia_domestica',
  'abandono',
  'inseguranca_alimentar',
  'deficiencia',
  'pessoa_idosa',
  'dependencia_quimica',
  'risco_social'
];

function bool(value) {
  return value === true || value === 'true' || value === 'sim' || value === 'Sim';
}

function text(value) {
  return String(value || '').trim();
}

function getCpf(form) {
  return text(form.cpf) || `triagem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildVulnerabilities(form, resultado) {
  const marked = vulnerabilityFields.filter((field) => bool(form[field]));
  return [...new Set([...marked, ...(resultado.classificacao.perfil || [])])];
}

function buildSocialProfile(form) {
  const parts = [
    form.renda_aproximada ? `Renda aproximada: R$ ${form.renda_aproximada}` : '',
    form.composicao_familiar ? `Composicao familiar: ${form.composicao_familiar}` : '',
    form.situacao_moradia ? `Moradia: ${form.situacao_moradia}` : '',
    form.dependentes ? `Dependentes: ${form.dependentes}` : '',
    form.historico_atendimento ? `Historico: ${form.historico_atendimento}` : ''
  ].filter(Boolean);

  return parts.join('; ') || 'Cadastro gerado pela triagem inicial.';
}

function getAttendanceStatus(resultado) {
  const hasAvailableVacancy = resultado.recomendacoes.some((item) => item.vaga.status === 'disponivel');
  return hasAvailableVacancy ? 'em_triagem' : 'aguardando_vaga';
}

async function upsertCitizen(form, resultado) {
  const cpf = getCpf(form);
  const nis = text(form.nis);
  const citizens = await store.list('cidadaos');
  const existing = citizens.find((item) => item.cpf === cpf || (nis && item.nis === nis));
  const historyEntry = `Cadastro recebido pela triagem em ${new Date().toLocaleString('pt-BR')}. Prioridade sugerida: ${resultado.classificacao.prioridade}.`;

  const payload = {
    nome: text(form.nome),
    cpf,
    nis,
    nascimento: null,
    endereco: text(form.endereco),
    telefone: text(form.telefone),
    bairro: text(form.bairro),
    regiao: text(form.regiao),
    perfil_social: buildSocialProfile(form),
    vulnerabilidade: buildVulnerabilities(form, resultado),
    grau_risco: resultado.classificacao.grau_risco,
    status_atendimento: getAttendanceStatus(resultado),
    unidade_referencia: text(form.vinculo_creas) || text(form.vinculo_cras) || 'Triagem online'
  };

  if (existing) {
    return store.update('cidadaos', existing.id, {
      ...payload,
      historico: [...(existing.historico || []), historyEntry],
      anexos: existing.anexos || []
    });
  }

  return store.create('cidadaos', {
    ...payload,
    historico: [historyEntry],
    anexos: []
  });
}

async function createRequest(form, cidadao, resultado) {
  const service = text(form.tipo_necessidade)
    || resultado.servicos_compativeis?.[0]?.servico
    || 'Acompanhamento socioassistencial';

  return store.create('solicitacoes', {
    cidadao_id: cidadao.id,
    tipo_servico: service,
    prioridade: resultado.classificacao.prioridade,
    status: 'pendente',
    data_solicitacao: new Date().toISOString(),
    data_encaminhamento: null,
    tempo_espera_dias: 0
  });
}

async function submit(form, origem = 'cidadao') {
  const resultado = await recommendationService.recommend(form);
  const cidadao = await upsertCitizen(form, resultado);
  const solicitacao = await createRequest(form, cidadao, resultado);
  const triagem = await store.create('triagens', {
    origem,
    dados: form,
    classificacao: resultado.classificacao,
    recomendacoes: resultado.recomendacoes.map((item) => ({
      vaga_id: item.vaga.id,
      osc_id: item.osc?.id,
      score: item.score,
      justificativa: item.justificativa
    })),
    alertas: resultado.alertas
  });

  await store.create('notificacoes', {
    tipo: 'triagem',
    titulo: 'Novo cidadao cadastrado',
    mensagem: `${cidadao.nome} entrou para analise com prioridade ${solicitacao.prioridade}.`
  });

  return { triagem, cidadao, solicitacao, resultado };
}

module.exports = { submit };
