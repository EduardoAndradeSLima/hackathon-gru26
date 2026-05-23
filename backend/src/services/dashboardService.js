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

async function getDashboard() {
  const [vagas, solicitacoes, oscs, cidadaos, encaminhamentos] = await Promise.all([
    store.list('vagas'),
    store.list('solicitacoes'),
    store.list('oscs'),
    store.list('cidadaos'),
    store.list('encaminhamentos')
  ]);

  const disponiveis = vagas.filter((vaga) => vaga.status === 'disponivel').length;
  const ocupadas = vagas.filter((vaga) => vaga.status === 'ocupada').length;
  const pendentes = solicitacoes.filter((item) => ['pendente', 'em_analise'].includes(item.status)).length;
  const tempos = solicitacoes.map((item) => Number(item.tempo_espera_dias || 0));
  const tempoMedio = tempos.length ? Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length) : 0;

  const filaPorServico = asChartData(groupCount(solicitacoes, 'tipo_servico'), 'servico', 'total');
  const ocupacaoPorStatus = asChartData(groupCount(vagas, 'status'), 'status', 'total');
  const demandaPorRegiao = asChartData(groupCount(cidadaos, 'regiao'), 'regiao', 'total');
  const prioridades = asChartData(groupCount(solicitacoes, 'prioridade'), 'prioridade', 'total');

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
    .filter((item) => item.prioridade === 'critica' || Number(item.tempo_espera_dias || 0) >= 30)
    .map((item) => ({
      id: item.id,
      tipo_servico: item.tipo_servico,
      prioridade: item.prioridade,
      tempo_espera_dias: item.tempo_espera_dias,
      mensagem: item.prioridade === 'critica'
        ? 'Solicitacao critica aguardando decisao.'
        : 'Tempo de espera acima do parametro recomendado.'
    }));

  return {
    cards: {
      vagas_disponiveis: disponiveis,
      vagas_ocupadas: ocupadas,
      tempo_medio_espera: tempoMedio,
      solicitacoes_pendentes: pendentes,
      oscs_ativas: oscs.length,
      cidadaos_acompanhados: cidadaos.length
    },
    charts: {
      fila_por_servico: filaPorServico,
      ocupacao_por_status: ocupacaoPorStatus,
      demanda_por_regiao: demandaPorRegiao,
      prioridades
    },
    gargalos,
    alertas_criticos: alertasCriticos,
    oscs_maior_demanda: oscsComMaiorDemanda
  };
}

module.exports = { getDashboard };
