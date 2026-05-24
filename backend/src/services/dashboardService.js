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
  const [vagas, solicitacoes, oscs, cidadaos, encaminhamentos, triagens] = await Promise.all([
    store.list('vagas'),
    store.list('solicitacoes'),
    store.list('oscs'),
    store.list('cidadaos'),
    store.list('encaminhamentos'),
    store.list('triagens')
  ]);

  const vagasIlpi = vagas.filter((vaga) => vaga.tipo_servico === 'ILPI');
  const solicitacoesIlpi = solicitacoes.filter((item) => item.tipo_servico === 'ILPI');
  const oscsIlpi = oscs.filter((osc) => osc.tipo_servico === 'ILPI');
  const cidadaoIdsIlpi = new Set(solicitacoesIlpi.map((item) => item.cidadao_id));
  const cidadaosIlpi = cidadaos.filter((item) =>
    cidadaoIdsIlpi.has(item.id)
    || (Array.isArray(item.vulnerabilidade) && item.vulnerabilidade.some((value) => ['idoso', 'pessoa_idosa', 'grau_1', 'grau_2', 'grau_3'].includes(value)))
  );

  const disponiveis = vagasIlpi.filter((vaga) => vaga.status === 'disponivel').length;
  const ocupadas = vagasIlpi.filter((vaga) => vaga.status === 'ocupada').length;
  const pendentes = solicitacoesIlpi.filter((item) => ['pendente', 'em_analise'].includes(item.status)).length;

  const filaPorServico = asChartData(groupCount(solicitacoesIlpi, 'tipo_servico'), 'servico', 'total');
  const ocupacaoPorStatus = asChartData(groupCount(vagasIlpi, 'status'), 'status', 'total');
  const demandaPorRegiao = asChartData(groupCount(cidadaosIlpi, 'regiao'), 'regiao', 'total');
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
      vagas_disponiveis: vagasIlpi.filter((vaga) => vaga.tipo_servico === servico.servico && vaga.status === 'disponivel').length
    }))
    .filter((item) => item.total > item.vagas_disponiveis)
    .sort((a, b) => b.total - a.total);

  const oscsComMaiorDemanda = oscsIlpi.map((osc) => {
    const vagasOsc = vagasIlpi.filter((vaga) => vaga.osc_id === osc.id);
    const encaminhados = encaminhamentos.filter((enc) => vagasOsc.some((vaga) => vaga.id === enc.vaga_id)).length;
    return { nome: osc.nome, encaminhamentos: encaminhados, vagas: vagasOsc.length };
  }).sort((a, b) => b.encaminhamentos - a.encaminhamentos);

  const alertasCriticos = solicitacoesIlpi
    .filter((item) =>
      item.prioridade === 'critica'
      || ['pendente', 'em_analise', 'encaminhada'].includes(item.status)
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
        regiao: region,
        cidadao_nome: cidadao?.nome,
        mensagem: `Idoso em ${region} deve ser avaliado. ${dependency ? `Grau sugerido: ${dependency}. ` : ''}Status: ${item.status}.`
      };
    });

  return {
    cards: {
      vagas_disponiveis: disponiveis,
      vagas_ocupadas: ocupadas,
      solicitacoes_pendentes: pendentes,
      oscs_ativas: oscsIlpi.length,
      cidadaos_acompanhados: cidadaosIlpi.length,
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
