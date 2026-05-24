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

function isIlpiForm(form) {
  return form.tipo_necessidade === 'ILPI'
    || Boolean(form.grau_mobilidade)
    || Boolean(form.alimentacao)
    || Boolean(form.higiene_pessoal)
    || Boolean(form.cognicao)
    || Boolean(form.uso_medicamentos);
}

function scoreByValue(value, scores) {
  return scores[value] || 0;
}

function calculateIlpiDependency(form) {
  let score = 0;
  const factors = [];

  const checks = [
    ['grau_mobilidade', {
      independente: [0, 'mobilidade independente'],
      apoio: [1, 'mobilidade com apoio'],
      cadeira_rodas: [2, 'uso de cadeira de rodas'],
      acamado: [3, 'pessoa acamada']
    }],
    ['alimentacao', {
      independente: [0, 'alimentacao independente'],
      assistida: [2, 'alimentacao assistida']
    }],
    ['higiene_pessoal', {
      independente: [0, 'higiene independente'],
      assistida: [1, 'higiene assistida'],
      dependente: [3, 'dependencia para higiene']
    }],
    ['cognicao', {
      preservada: [0, 'cognicao preservada'],
      confusao_leve: [1, 'confusao leve'],
      comprometida: [3, 'cognicao comprometida']
    }],
    ['uso_medicamentos', {
      autonomo: [0, 'medicacao autonoma'],
      supervisionado: [1, 'medicacao supervisionada'],
      administrado: [2, 'medicacao administrada por terceiros']
    }]
  ];

  checks.forEach(([field, values]) => {
    const entry = values[form[field]];
    if (entry) {
      score += entry[0];
      factors.push(entry[1]);
    }
  });

  let grau_dependencia = 'grau_1';
  let descricao = 'independente';

  if (score >= 8 || form.grau_mobilidade === 'acamado' || form.higiene_pessoal === 'dependente') {
    grau_dependencia = 'grau_3';
    descricao = 'dependente total';
  } else if (score >= 4) {
    grau_dependencia = 'grau_2';
    descricao = 'semi-dependente';
  }

  return { score_dependencia: score, grau_dependencia, descricao, fatores_dependencia: factors };
}

function calculateIlpiRisk(form) {
  const dependency = calculateIlpiDependency(form);
  let score = 0;
  const reasons = [];

  if (dependency.grau_dependencia === 'grau_3') {
    score += 40;
    reasons.push('dependencia total');
  } else if (dependency.grau_dependencia === 'grau_2') {
    score += 25;
    reasons.push('semi-dependencia');
  } else {
    score += 10;
    reasons.push('independencia preservada');
  }

  const abandonment = scoreByValue(form.risco_abandono, {
    baixo: 0,
    medio: 15,
    alto: 25,
    critico: 35
  });
  if (abandonment) {
    score += abandonment;
    reasons.push(`risco de abandono ${form.risco_abandono}`);
  }

  const caregiver = scoreByValue(form.presenca_cuidador, {
    sim: 0,
    parcial: 15,
    nao: 25
  });
  if (caregiver) {
    score += caregiver;
    reasons.push(form.presenca_cuidador === 'nao' ? 'ausencia de cuidador' : 'cuidador parcial');
  }

  const income = Number(form.renda_aproximada || 0);
  if (income > 0 && income <= 706) {
    score += 15;
    reasons.push('renda muito baixa');
  } else if (income > 0 && income <= 1412) {
    score += 8;
    reasons.push('renda baixa');
  }

  const health = scoreByValue(form.saude, {
    estavel: 0,
    acompanhamento: 8,
    fragil: 18,
    grave: 25
  });
  if (health) {
    score += health;
    reasons.push(`saude ${form.saude}`);
  }

  const housing = scoreByValue(form.situacao_moradia, {
    propria_alugada: 0,
    com_familia: 5,
    provisoria: 15,
    rua: 25,
    institucional: 12
  });
  if (housing) {
    score += housing;
    reasons.push(`moradia ${form.situacao_moradia}`);
  }

  const waitingDays = Number(form.tempo_espera_dias || 0);
  if (waitingDays >= 60) {
    score += 25;
    reasons.push('espera acima de 60 dias');
  } else if (waitingDays >= 30) {
    score += 15;
    reasons.push('espera acima de 30 dias');
  } else if (waitingDays >= 15) {
    score += 8;
    reasons.push('espera acima de 15 dias');
  }

  const cappedScore = Math.min(score, 100);
  const grau_risco = cappedScore >= 80 ? 'critico' : cappedScore >= 60 ? 'alto' : cappedScore >= 35 ? 'medio' : 'baixo';
  const prioridade = cappedScore >= 80 ? 'critica' : cappedScore >= 60 ? 'alta' : cappedScore >= 35 ? 'media' : 'baixa';

  return {
    ...dependency,
    score: cappedScore,
    grau_risco,
    prioridade,
    reasons
  };
}

function calculateRisk(form) {
  if (isIlpiForm(form)) {
    return calculateIlpiRisk(form);
  }

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
  if (isIlpiForm(form)) {
    return [{
      key: 'ilpi',
      servico: 'ILPI',
      reason: 'triagem padronizada para ILPI'
    }];
  }

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

  if (isIlpiForm(form)) {
    const dependency = calculateIlpiDependency(form);
    tags.push('idoso', 'pessoa_idosa', dependency.grau_dependencia, `dependencia_${dependency.grau_dependencia}`);

    if (form.presenca_cuidador === 'nao') tags.push('sem_cuidador');
    if (form.presenca_cuidador === 'parcial') tags.push('cuidador_parcial');
    if (['alto', 'critico'].includes(form.risco_abandono)) tags.push('risco_abandono');
    if (['fragil', 'grave'].includes(form.saude)) tags.push('saude_fragil');
    if (['rua', 'provisoria'].includes(form.situacao_moradia)) tags.push('moradia_insegura');

    return [...new Set(tags)];
  }

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

function isCompatibleIlpiVacancy(form, vaga) {
  if (!isIlpiForm(form)) {
    return true;
  }

  if (vaga.tipo_servico !== 'ILPI') {
    return false;
  }

  const dependency = calculateIlpiDependency(form);
  if (!vaga.grau_dependencia || vaga.grau_dependencia === 'nao_aplicavel') {
    return true;
  }

  return vaga.grau_dependencia === dependency.grau_dependencia;
}

async function recommend(form) {
  const [vagas, oscs] = await Promise.all([store.list('vagas'), store.list('oscs')]);
  const ilpi = isIlpiForm(form);
  const risk = calculateRisk(form);
  const services = inferServices(form);
  const tags = getCitizenProfileTags(form);
  const wantedServices = services.map((item) => item.servico);

  const recommendations = vagas
    .filter((vaga) => isCompatibleIlpiVacancy(form, vaga))
    .filter((vaga) => !ilpi || vaga.status === 'disponivel')
    .map((vaga) => {
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

    const desiredDependency = risk.grau_dependencia || form.grau_dependencia;
    if (desiredDependency && vaga.grau_dependencia === desiredDependency) {
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
      grau_dependencia: risk.grau_dependencia || form.grau_dependencia || 'nao_aplicavel',
      descricao_dependencia: risk.descricao,
      score_dependencia: risk.score_dependencia,
      indice_vulnerabilidade: risk.score,
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
