const store = require('../database/store');
const recommendationService = require('./recommendationService');
const { inferRegionFromBairro, getIlpiReferenceUnit } = require('./locationService');

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

const ilpiLabelMap = {
  grau_1: 'Grau 1 - independente',
  grau_2: 'Grau 2 - semi-dependente',
  grau_3: 'Grau 3 - dependente total',
  independente: 'independente',
  apoio: 'com apoio',
  cadeira_rodas: 'cadeira de rodas',
  acamado: 'acamado',
  assistida: 'assistida',
  dependente: 'dependente',
  preservada: 'preservada',
  confusao_leve: 'confusao leve',
  comprometida: 'comprometida',
  autonomo: 'autonomo',
  supervisionado: 'supervisionado',
  administrado: 'administrado por terceiros',
  sim: 'sim',
  parcial: 'parcial',
  nao: 'nao',
  baixo: 'baixo',
  medio: 'medio',
  alto: 'alto',
  critico: 'critico',
  propria_alugada: 'propria ou alugada',
  com_familia: 'com familia',
  provisoria: 'provisoria',
  rua: 'situacao de rua',
  institucional: 'institucional',
  estavel: 'estavel',
  acompanhamento: 'em acompanhamento',
  fragil: 'fragil',
  grave: 'grave'
};

function bool(value) {
  return value === true || value === 'true' || value === 'sim' || value === 'Sim';
}

function text(value) {
  return String(value || '').trim();
}

function normalizeKey(value) {
  return text(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function findExistingCitizen(citizens, form, cpf, nis) {
  const name = normalizeKey(form.nome);
  const phone = normalizeKey(form.telefone);
  const neighborhood = normalizeKey(form.bairro);

  return citizens.find((item) => {
    if (cpf && item.cpf === cpf) return true;
    if (nis && item.nis === nis) return true;

    const sameName = normalizeKey(item.nome) === name;
    const samePhone = phone && normalizeKey(item.telefone) === phone;
    const sameNeighborhood = neighborhood && normalizeKey(item.bairro) === neighborhood;

    return !cpf && !nis && sameName && (samePhone || sameNeighborhood);
  });
}

function buildVulnerabilities(form, resultado) {
  const marked = vulnerabilityFields.filter((field) => bool(form[field]));
  return [...new Set([...marked, ...(resultado.classificacao.perfil || [])])];
}

function buildSocialProfile(form) {
  if (form.tipo_necessidade === 'ILPI') {
    const c = resultadoLabelCompatible(form);
    return [
      `Triagem ILPI padronizada`,
      `Mobilidade: ${c(form.grau_mobilidade)}`,
      `Alimentacao: ${c(form.alimentacao)}`,
      `Higiene pessoal: ${c(form.higiene_pessoal)}`,
      `Cognicao: ${c(form.cognicao)}`,
      `Medicamentos: ${c(form.uso_medicamentos)}`,
      `Cuidador: ${c(form.presenca_cuidador)}`,
      `Risco de abandono: ${c(form.risco_abandono)}`,
      `Moradia: ${c(form.situacao_moradia)}`,
      `Saude: ${c(form.saude)}`,
      form.renda_aproximada ? `Renda: R$ ${form.renda_aproximada}` : ''
    ].filter(Boolean).join('; ');
  }

  const parts = [
    form.renda_aproximada ? `Renda aproximada: R$ ${form.renda_aproximada}` : '',
    form.composicao_familiar ? `Composicao familiar: ${form.composicao_familiar}` : '',
    form.situacao_moradia ? `Moradia: ${form.situacao_moradia}` : '',
    form.dependentes ? `Dependentes: ${form.dependentes}` : '',
    form.historico_atendimento ? `Historico: ${form.historico_atendimento}` : ''
  ].filter(Boolean);

  return parts.join('; ') || 'Cadastro gerado pela triagem inicial.';
}

function resultadoLabelCompatible() {
  return (value) => ilpiLabelMap[value] || text(value) || 'nao informado';
}

function getAttendanceStatus(resultado) {
  const hasAvailableVacancy = resultado.recomendacoes.some((item) => item.vaga.status === 'disponivel');
  return hasAvailableVacancy ? 'em_triagem' : 'aguardando_vaga';
}

function normalizeForm(form) {
  const regiao = text(form.regiao) || inferRegionFromBairro(form.bairro);

  return {
    ...form,
    tipo_necessidade: 'ILPI',
    regiao
  };
}

async function upsertCitizen(form, resultado) {
  const providedCpf = text(form.cpf);
  const nis = text(form.nis);
  const citizens = await store.list('cidadaos');
  const existing = findExistingCitizen(citizens, form, providedCpf, nis);
  const cpf = existing?.cpf || providedCpf || `triagem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const grau = resultado.classificacao.grau_dependencia;
  const score = resultado.classificacao.indice_vulnerabilidade;
  const historyEntry = `Cadastro recebido pela triagem ILPI em ${new Date().toLocaleString('pt-BR')}. Grau sugerido: ${grau || 'nao informado'}. Score: ${score ?? resultado.classificacao.score_risco}. Prioridade sugerida: ${resultado.classificacao.prioridade}.`;

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
    unidade_referencia: text(form.vinculo_creas) || text(form.vinculo_cras) || getIlpiReferenceUnit(form.regiao)
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
  const service = text(form.tipo_necessidade) || 'ILPI'
    || resultado.servicos_compativeis?.[0]?.servico
    || 'Acompanhamento socioassistencial';
  const requestedAt = new Date().toISOString();
  const solicitacoes = await store.list('solicitacoes');
  const existing = solicitacoes
    .filter((item) =>
      item.cidadao_id === cidadao.id
      && item.tipo_servico === service
      && !['concluida', 'cancelada'].includes(item.status)
    )
    .sort((a, b) => new Date(b.updated_at || b.created_at || b.data_solicitacao || 0) - new Date(a.updated_at || a.created_at || a.data_solicitacao || 0))[0];

  if (existing) {
    return store.update('solicitacoes', existing.id, {
      prioridade: resultado.classificacao.prioridade,
      status: existing.status === 'encaminhada' ? existing.status : 'em_analise'
    });
  }

  return store.create('solicitacoes', {
    cidadao_id: cidadao.id,
    tipo_servico: service,
    prioridade: resultado.classificacao.prioridade,
    status: 'pendente',
    data_solicitacao: requestedAt,
    data_encaminhamento: null
  });
}

async function routeForHumanReview(form, cidadao, solicitacao, resultado) {
  const suggestion = resultado.recomendacoes.find((item) => item.vaga.status === 'disponivel');
  const now = new Date().toISOString();
  const regionalUnit = getIlpiReferenceUnit(cidadao.regiao);
  const encaminhamentos = await store.list('encaminhamentos');
  const encaminhamentoAtivo = encaminhamentos.find((item) =>
    item.solicitacao_id === solicitacao.id && ['aguardando_osc', 'aceito'].includes(item.status)
  );

  if (encaminhamentoAtivo) {
    return {
      cidadao,
      solicitacao,
      encaminhamento: encaminhamentoAtivo,
      osc: null,
      fluxo: 'encaminhamento_existente'
    };
  }

  if (!suggestion) {
    const updatedRequest = await store.update('solicitacoes', solicitacao.id, {
      status: 'em_analise'
    });
    const updatedCitizen = await store.update('cidadaos', cidadao.id, {
      status_atendimento: 'aguardando_vaga',
      historico: [
        ...(cidadao.historico || []),
        `Aviso enviado para ${regionalUnit} em ${new Date(now).toLocaleString('pt-BR')}. Aguardando avaliacao humana.`
      ]
    });

    return {
      cidadao: updatedCitizen,
      solicitacao: updatedRequest,
      encaminhamento: null,
      osc: null,
      fluxo: 'avaliacao_regional'
    };
  }

  const justificativa = [
    `Pre-encaminhamento assistido para ${suggestion.osc?.nome || 'OSC'}.`,
    `Grau sugerido: ${resultado.classificacao.grau_dependencia}.`,
    `Indice de vulnerabilidade: ${resultado.classificacao.indice_vulnerabilidade}.`,
    'A assinatura final permanece humana.'
  ].join(' ');

  const encaminhamento = await store.create('encaminhamentos', {
    solicitacao_id: solicitacao.id,
    vaga_id: suggestion.vaga.id,
    status: 'aguardando_osc',
    justificativa,
    created_at: now
  });

  await store.update('vagas', suggestion.vaga.id, {
    status: 'reservada',
    observacoes: `${suggestion.vaga.observacoes || ''}\nPre-reservada pela triagem ILPI ${encaminhamento.id}.`.trim()
  });

  const updatedRequest = await store.update('solicitacoes', solicitacao.id, {
    status: 'encaminhada',
    data_encaminhamento: now
  });

  const updatedCitizen = await store.update('cidadaos', cidadao.id, {
    status_atendimento: 'encaminhado',
    historico: [
      ...(cidadao.historico || []),
      `Pre-encaminhado para ${suggestion.osc?.nome || 'OSC'} em ${new Date(now).toLocaleString('pt-BR')}. Aguardando aceite e validacao humana.`
    ]
  });

  return {
    cidadao: updatedCitizen,
    solicitacao: updatedRequest,
    encaminhamento,
    osc: suggestion.osc,
    fluxo: 'pre_encaminhamento_humano'
  };
}

async function createRegionalNotice(form, cidadao, solicitacao, resultado, routing) {
  const unit = getIlpiReferenceUnit(cidadao.regiao);
  const action = routing.encaminhamento
    ? `pre-encaminhado para ${routing.osc?.nome || 'OSC'} e aguarda assinatura humana`
    : 'aguarda avaliacao humana regional';

  return store.create('notificacoes', {
    tipo: 'triagem_ilpi',
    titulo: `Idoso para avaliacao - ${cidadao.regiao}`,
    mensagem: `${cidadao.nome}, ${form.idade} anos, ${resultado.classificacao.grau_dependencia}, risco ${resultado.classificacao.grau_risco}. Caso ${action}. Responsavel sugerido: ${unit}. Solicitacao ${solicitacao.id}.`
  });
}

async function submit(form, origem = 'cidadao') {
  const normalizedForm = normalizeForm(form);
  const resultado = await recommendationService.recommend(normalizedForm);
  let cidadao = await upsertCitizen(normalizedForm, resultado);
  let solicitacao = await createRequest(normalizedForm, cidadao, resultado);
  const routing = await routeForHumanReview(normalizedForm, cidadao, solicitacao, resultado);

  cidadao = routing.cidadao || cidadao;
  solicitacao = routing.solicitacao || solicitacao;

  const triagem = await store.create('triagens', {
    origem,
    dados: normalizedForm,
    classificacao: resultado.classificacao,
    recomendacoes: resultado.recomendacoes.map((item) => ({
      vaga_id: item.vaga.id,
      osc_id: item.osc?.id,
      score: item.score,
      justificativa: item.justificativa
    })),
    alertas: resultado.alertas
  });

  await createRegionalNotice(normalizedForm, cidadao, solicitacao, resultado, routing);

  return {
    triagem,
    cidadao,
    solicitacao,
    encaminhamento: routing.encaminhamento,
    osc: routing.osc,
    fluxo: routing.fluxo,
    resultado
  };
}

module.exports = { submit };
