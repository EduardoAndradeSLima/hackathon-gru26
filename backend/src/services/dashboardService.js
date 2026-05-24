const store = require('../database/store');

function groupCount(items, field) {
  return items.reduce((acc, item) => {
    const key = item[field] || 'Nao informado';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function asChartData(grouped, nameKey = 'name', valueKey = 'value') {
  return Object.entries(grouped).map(([name, value]) => ({ [nameKey]: name, [valueKey]: value }));
}

function getWaitDays(item) {
  if (!item.data_solicitacao) {
    return Number(item.tempo_espera_dias || 0);
  }

  const requestedAt = new Date(item.data_solicitacao).getTime();
  if (Number.isNaN(requestedAt)) {
    return Number(item.tempo_espera_dias || 0);
  }

  const diff = Date.now() - requestedAt;
  return Math.max(Math.floor(diff / 86400000), Number(item.tempo_espera_dias || 0));
}

async function getDashboard() {
  const [vagas, solicitacoes, oscs, cidadaos, encaminhamentos, triagens] = await Promise.all([
    store.list('vagas'),
    store.list('solicitacoes'),
    store.list('oscs'),
    store.list('cidadaos'),
    store.list('encaminhamentos'),
    store.list('triagens')
  ]);

  const disponiveis = vagas.filter((vaga) => vaga.status === 'disponivel').length;
  const ocupadas = vagas.filter((vaga) => vaga.status === 'ocupada').length;
  const pendentes = solicitacoes.filter((item) => ['pendente', 'em_analise'].includes(item.status)).length;
  const tempos = solicitacoes.map(getWaitDays);
  const tempoMedio = tempos.length ? Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length) : 0;

  const filaPorServico = asChartData(groupCount(solicitacoes, 'tipo_servico'), 'servico', 'total');
  const ocupacaoPorStatus = asChartData(groupCount(vagas, 'status'), 'status', 'total');
  const demandaPorRegiao = asChartData(groupCount(cidadaos, 'regiao'), 'regiao', 'total');
  const prioridades = asChartData(groupCount(solicitacoes, 'prioridade'), 'prioridade', 'total');
  const triagensIlpi = triagens.filter((item) => item.dados?.tipo_necessidade === 'ILPI');
  const triagensPorGrau = asChartData(groupCount(triagensIlpi.map((item) => ({
    grau: item.classificacao?.grau_dependencia || 'nao informado'
  })), 'grau'), 'grau', 'total');
  const triagensPorRisco = asChartData(groupCount(triagensIlpi.map((item) => ({
    risco: item.classificacao?.grau_risco || 'nao informado'
  })), 'risco'), 'risco', 'total');

  const gargalos = filaPorServico
    .map((servico) => ({
      ...servico,
      vagas_disponiveis: vagas.filter((vaga) => vaga.tipo_servico === servico.servico && vaga.status === 'disponivel').length
    }))
    .filter((item) => item.total > item.vagas_disponiveis)
    .sort((a, b) => b.total - a.total);

  const oscsComMaiorDemanda = oscs.map((osc) => {
    const vagasOsc = vagas.filter((vaga) => vaga.osc_id === osc.id);
    const encaminhados = encaminhamentos.filter((enc) => vagasOsc.some((vaga) => vaga.id === enc.vaga_id)).length;
    return { nome: osc.nome, encaminhamentos: encaminhados, vagas: vagasOsc.length };
  }).sort((a, b) => b.encaminhamentos - a.encaminhamentos);

  const alertasCriticos = solicitacoes
    .filter((item) =>
      item.prioridade === 'critica'
      || getWaitDays(item) >= 30
      || (item.tipo_servico === 'ILPI' && ['pendente', 'em_analise', 'encaminhada'].includes(item.status))
    )
    .map((item) => {
      const cidadao = cidadaos.find((current) => current.id === item.cidadao_id);
      const region = cidadao?.regiao || 'regiao nao informada';
      const dependency = Array.isArray(cidadao?.vulnerabilidade)
        ? cidadao.vulnerabilidade.find((value) => ['grau_1', 'grau_2', 'grau_3'].includes(value))
        : null;

      return {
        id: item.id,
        tipo_servico: item.tipo_servico,
        prioridade: item.prioridade,
        tempo_espera_dias: getWaitDays(item),
        regiao: region,
        cidadao_nome: cidadao?.nome,
        mensagem: item.tipo_servico === 'ILPI'
          ? `Idoso em ${region} deve ser avaliado. ${dependency ? `Grau sugerido: ${dependency}. ` : ''}Status: ${item.status}.`
          : item.prioridade === 'critica'
            ? 'Solicitacao critica aguardando decisao.'
            : 'Tempo de espera acima do parametro recomendado.'
      };
    });

  return {
    cards: {
      vagas_disponiveis: disponiveis,
      vagas_ocupadas: ocupadas,
      tempo_medio_espera: tempoMedio,
      solicitacoes_pendentes: pendentes,
      oscs_ativas: oscs.length,
      cidadaos_acompanhados: cidadaos.length,
      triagens_ilpi: triagensIlpi.length
    },
    charts: {
      fila_por_servico: filaPorServico,
      ocupacao_por_status: ocupacaoPorStatus,
      demanda_por_regiao: demandaPorRegiao,
      prioridades,
      triagens_por_grau: triagensPorGrau,
      triagens_por_risco: triagensPorRisco
    },
    gargalos,
    alertas_criticos: alertasCriticos,
    oscs_maior_demanda: oscsComMaiorDemanda
  };
}

module.exports = { getDashboard };
