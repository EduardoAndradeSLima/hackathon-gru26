const createCrudController = require('./crudController');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const crudService = require('../services/crudService');
const store = require('../database/store');
const { logAction } = require('../services/auditService');

const base = createCrudController('solicitacoes');

const create = asyncHandler(async (req, res) => {
  const solicitacoes = await store.list('solicitacoes');
  const existing = solicitacoes.find((item) =>
    item.cidadao_id === req.body.cidadao_id
    && item.tipo_servico === req.body.tipo_servico
    && !['concluida', 'cancelada'].includes(item.status)
  );

  if (existing) {
    return res.json(existing);
  }

  const item = await crudService.create('solicitacoes', req.body);
  await logAction(req, 'CRIAR', 'solicitacoes', item.id, { after: item });
  return res.status(201).json(item);
});

function scoreVaga(vaga, osc, cidadao, solicitacao) {
  let score = 0;

  if (vaga.status === 'disponivel') score += 50;
  if (vaga.tipo_servico === solicitacao.tipo_servico) score += 30;
  if (cidadao?.regiao && osc?.regiao === cidadao.regiao) score += 10;

  const vulnerabilidades = Array.isArray(cidadao?.vulnerabilidade) ? cidadao.vulnerabilidade : [];
  const perfilAceito = Array.isArray(vaga.perfil_aceito) ? vaga.perfil_aceito : [];
  const grauIlpi = vulnerabilidades.find((item) => ['grau_1', 'grau_2', 'grau_3'].includes(item));

  if (solicitacao.tipo_servico === 'ILPI' && vaga.grau_dependencia && vaga.grau_dependencia !== grauIlpi) {
    return -1;
  }

  const matches = vulnerabilidades.filter((item) => perfilAceito.includes(item));
  score += Math.min(matches.length * 5, 10);

  return score;
}

const encaminhar = asyncHandler(async (req, res) => {
  const solicitacao = await crudService.get('solicitacoes', req.params.id);

  if (['encaminhada', 'concluida', 'cancelada'].includes(solicitacao.status)) {
    throw new ApiError(409, 'Solicitacao ja encaminhada, concluida ou cancelada.');
  }

  const [encaminhamentos, vagas, oscs] = await Promise.all([
    store.list('encaminhamentos'),
    store.list('vagas'),
    store.list('oscs')
  ]);

  const encaminhamentoAtivo = encaminhamentos.find((item) =>
    item.solicitacao_id === solicitacao.id && ['aguardando_osc', 'aceito'].includes(item.status)
  );

  if (encaminhamentoAtivo) {
    throw new ApiError(409, 'Esta solicitacao ja possui encaminhamento ativo.');
  }

  const cidadao = await crudService.get('cidadaos', solicitacao.cidadao_id);
  const candidatas = vagas
    .filter((vaga) => vaga.status === 'disponivel' && vaga.tipo_servico === solicitacao.tipo_servico)
    .map((vaga) => {
      const osc = oscs.find((item) => item.id === vaga.osc_id);
      return { vaga, osc, score: scoreVaga(vaga, osc, cidadao, solicitacao) };
    })
    .filter((item) => item.score >= 0)
    .sort((a, b) => b.score - a.score);

  if (!candidatas.length) {
    const vulnerabilidades = Array.isArray(cidadao?.vulnerabilidade) ? cidadao.vulnerabilidade : [];
    const grauIlpi = vulnerabilidades.find((item) => ['grau_1', 'grau_2', 'grau_3'].includes(item));
    await crudService.update('cidadaos', cidadao.id, {
      status_atendimento: 'aguardando_vaga',
      historico: [
        ...(cidadao.historico || []),
        `Sem vaga ILPI compativel${grauIlpi ? ` com ${grauIlpi}` : ''} em ${new Date().toLocaleString('pt-BR')}.`
      ]
    });

    throw new ApiError(409, grauIlpi
      ? `Nao existe vaga ILPI disponivel compativel com ${grauIlpi}. O caso permanece na fila.`
      : 'Nao existe vaga ILPI disponivel compativel. O caso permanece na fila.');
  }

  const escolhida = candidatas[0];
  const now = new Date().toISOString();
  const justificativa = req.body.justificativa ||
    `Encaminhamento assistido para ${escolhida.osc?.nome || 'OSC'} porque existe vaga disponivel em ${solicitacao.tipo_servico}.`;

  const encaminhamento = await crudService.create('encaminhamentos', {
    solicitacao_id: solicitacao.id,
    vaga_id: escolhida.vaga.id,
    status: 'aguardando_osc',
    justificativa,
    created_at: now
  });

  const solicitacaoAtualizada = await crudService.update('solicitacoes', solicitacao.id, {
    status: 'encaminhada',
    data_encaminhamento: now
  });

  const vagaAtualizada = await crudService.update('vagas', escolhida.vaga.id, {
    status: 'reservada',
    observacoes: `${escolhida.vaga.observacoes || ''}\nReservada por encaminhamento ${encaminhamento.id}.`.trim()
  });

  const cidadaoAtualizado = await crudService.update('cidadaos', cidadao.id, {
    status_atendimento: 'encaminhado',
    historico: [
      ...(cidadao.historico || []),
      `Encaminhado para ${escolhida.osc?.nome || 'OSC'} em ${new Date(now).toLocaleString('pt-BR')}.`
    ]
  });

  await logAction(req, 'ENCAMINHAR_SOLICITACAO', 'solicitacoes', solicitacao.id, {
    encaminhamento_id: encaminhamento.id,
    vaga_id: vagaAtualizada.id,
    cidadao_id: cidadaoAtualizado.id,
    score: escolhida.score
  });

  res.status(201).json({
    encaminhamento,
    solicitacao: solicitacaoAtualizada,
    vaga: vagaAtualizada,
    cidadao: cidadaoAtualizado,
    osc: escolhida.osc,
    justificativa
  });
});

module.exports = { ...base, create, encaminhar };
