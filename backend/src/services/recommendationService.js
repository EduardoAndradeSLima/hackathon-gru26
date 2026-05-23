const store = require('../database/store');

const serviceMap = [
  {
    key: 'violencia_domestica',
    servico: 'Violencia domestica',
    reason: 'necessidade de protecao e sigilo por violencia domestica'
  },
  {
    key: 'pessoa_idosa',
    servico: 'ILPI',
    reason: 'perfil de pessoa idosa com necessidade de cuidado continuado'
  },
  {
    key: 'situacao_rua',
    servico: 'Acolhimento adulto',
    reason: 'situacao de rua informada na triagem'
  },
  {
    key: 'abandono',
    servico: 'Acolhimento infantil',
    reason: 'indicativo de abandono ou ausencia de rede protetiva'
  },
  {
    key: 'deficiencia',
    servico: 'Centro Dia',
    reason: 'necessidade de cuidado e apoio durante o dia'
  }
];

function bool(value) {
  return value === true || value === 'true' || value === 'sim' || value === 'Sim';
}

function calculateRisk(form) {
  let score = 0;
  const reasons = [];

  const checks = [
    ['violencia_domestica', 30, 'violencia domestica'],
    ['risco_social', 25, 'risco social'],
    ['situacao_rua', 25, 'situacao de rua'],
    ['abandono', 20, 'abandono'],
    ['inseguranca_alimentar', 15, 'inseguranca alimentar'],
    ['dependencia_quimica', 15, 'dependencia quimica'],
    ['deficiencia', 10, 'deficiencia'],
    ['pessoa_idosa', 10, 'pessoa idosa']
  ];

  checks.forEach(([field, weight, label]) => {
    if (bool(form[field])) {
      score += weight;
      reasons.push(label);
    }
  });

  if (Number(form.renda_aproximada || 0) <= 706) {
    score += 10;
    reasons.push('renda baixa');
  }

  if (Number(form.dependentes || 0) >= 3) {
    score += 8;
    reasons.push('familia com muitos dependentes');
  }

  if (form.urgencia === 'critica') {
    score += 25;
    reasons.push('urgencia critica');
  } else if (form.urgencia === 'alta') {
    score += 15;
    reasons.push('urgencia alta');
  }

  const grau_risco = score >= 75 ? 'critico' : score >= 50 ? 'alto' : score >= 25 ? 'medio' : 'baixo';
  const prioridade = score >= 75 ? 'critica' : score >= 50 ? 'alta' : score >= 25 ? 'media' : 'baixa';

  return { score, grau_risco, prioridade, reasons };
}

function inferServices(form) {
  const matches = serviceMap.filter((rule) => bool(form[rule.key]));

  if (form.tipo_necessidade) {
    matches.unshift({
      key: 'tipo_necessidade',
      servico: form.tipo_necessidade,
      reason: 'tipo de necessidade informado'
    });
  }

  if (!matches.length) {
    matches.push({
      key: 'general',
      servico: 'Acompanhamento socioassistencial',
      reason: 'triagem inicial para avaliacao tecnica'
    });
  }

  return [...new Map(matches.map((item) => [item.servico, item])).values()];
}

function getCitizenProfileTags(form) {
  const tags = [];

  [
    'situacao_rua',
    'violencia_domestica',
    'abandono',
    'inseguranca_alimentar',
    'deficiencia',
    'pessoa_idosa',
    'dependencia_quimica',
    'risco_social',
    'desemprego'
  ].forEach((field) => {
    if (bool(form[field])) {
      tags.push(field);
    }
  });

  if (Number(form.idade || 0) >= 60) {
    tags.push('idoso');
  }

  if (Number(form.idade || 99) < 18) {
    tags.push('crianca', 'adolescente');
  }

  if (form.grau_dependencia) {
    tags.push(`dependencia_${form.grau_dependencia}`);
  }

  return tags;
}

function explainRecommendation(vaga, osc, reasons, score) {
  const availability = vaga.status === 'disponivel'
    ? 'possui disponibilidade imediata'
    : `esta com status ${vaga.status}`;

  return `Essa opcao foi sugerida porque ${reasons.join(', ')}; ${availability}; score de aderencia ${score}%. OSC indicada: ${osc?.nome || 'unidade a confirmar'}.`;
}

async function recommend(form) {
  const [vagas, oscs] = await Promise.all([store.list('vagas'), store.list('oscs')]);
  const risk = calculateRisk(form);
  const services = inferServices(form);
  const tags = getCitizenProfileTags(form);
  const wantedServices = services.map((item) => item.servico);

  const recommendations = vagas.map((vaga) => {
    const osc = oscs.find((item) => item.id === vaga.osc_id);
    const reasons = [];
    let score = 0;

    if (vaga.status === 'disponivel') {
      score += 25;
      reasons.push('ha vaga disponivel');
    }

    if (wantedServices.includes(vaga.tipo_servico)) {
      score += 30;
      reasons.push(`o servico ${vaga.tipo_servico} e compativel com a necessidade`);
    }

    const accepted = Array.isArray(vaga.perfil_aceito) ? vaga.perfil_aceito : [];
    const tagMatches = tags.filter((tag) => accepted.includes(tag));

    if (tagMatches.length) {
      score += Math.min(25, tagMatches.length * 8);
      reasons.push(`o perfil aceito contempla ${tagMatches.join(', ')}`);
    }

    if (form.regiao && osc?.regiao === form.regiao) {
      score += 10;
      reasons.push('a unidade fica na mesma regiao informada');
    }

    if (form.grau_dependencia && vaga.grau_dependencia === form.grau_dependencia) {
      score += 10;
      reasons.push('o grau de dependencia e compativel');
    }

    if (risk.prioridade === 'critica' && vaga.status === 'disponivel') {
      score += 8;
      reasons.push('ha prioridade sugerida por risco elevado');
    }

    return {
      vaga,
      osc,
      score: Math.min(score, 100),
      aderencia: `${Math.min(score, 100)}%`,
      prioridade_sugerida: risk.prioridade,
      justificativa: explainRecommendation(vaga, osc, reasons.length ? reasons : ['exige avaliacao tecnica complementar'], Math.min(score, 100)),
      motivos: reasons
    };
  })
    .filter((item) => item.score >= 35)
    .sort((a, b) => b.score - a.score);

  const alertas = [];

  if (risk.grau_risco === 'critico' || risk.grau_risco === 'alto') {
    alertas.push({
      tipo: 'prioridade',
      nivel: risk.grau_risco,
      mensagem: 'Risco elevado identificado. Avaliacao humana prioritaria recomendada.'
    });
  }

  if (!recommendations.some((item) => item.vaga.status === 'disponivel')) {
    alertas.push({
      tipo: 'fila',
      nivel: 'atencao',
      mensagem: 'Nenhuma vaga disponivel encontrada para o perfil. Manter em fila e revisar alternativas.'
    });
  }

  return {
    classificacao: {
      perfil: tags.length ? tags : ['avaliacao_inicial'],
      grau_risco: risk.grau_risco,
      prioridade: risk.prioridade,
      score_risco: risk.score,
      fatores: risk.reasons
    },
    servicos_compativeis: services,
    recomendacoes: recommendations,
    alertas
  };
}

module.exports = { recommend, calculateRisk, inferServices };
