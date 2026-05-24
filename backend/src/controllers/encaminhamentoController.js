const createCrudController = require('./crudController');
const asyncHandler = require('../utils/asyncHandler');
const crudService = require('../services/crudService');
const { logAction } = require('../services/auditService');

const base = createCrudController('encaminhamentos');

const responder = asyncHandler(async (req, res) => {
  const status = req.body.status;
  const allowed = ['aceito', 'recusado', 'aguardando_osc', 'concluido'];

  if (!allowed.includes(status)) {
    return res.status(422).json({ message: 'Status de encaminhamento invalido.' });
  }

  const encaminhamento = await crudService.update('encaminhamentos', req.params.id, {
    status,
    justificativa: req.body.justificativa || '',
    respondido_em: new Date().toISOString(),
    respondido_por: req.user.id
  });

  if (status === 'aceito') {
    await crudService.update('vagas', encaminhamento.vaga_id, { status: 'ocupada' });
    const solicitacao = await crudService.update('solicitacoes', encaminhamento.solicitacao_id, { status: 'concluida' });
    const cidadao = await crudService.get('cidadaos', solicitacao.cidadao_id);
    await crudService.update('cidadaos', cidadao.id, {
      status_atendimento: 'em_acolhimento',
      historico: [
        ...(cidadao.historico || []),
        `Encaminhamento aceito pela OSC em ${new Date().toLocaleString('pt-BR')}.`
      ]
    });
  }

  if (status === 'recusado') {
    await crudService.update('vagas', encaminhamento.vaga_id, { status: 'disponivel' });
    const solicitacao = await crudService.update('solicitacoes', encaminhamento.solicitacao_id, { status: 'em_analise' });
    const cidadao = await crudService.get('cidadaos', solicitacao.cidadao_id);
    await crudService.update('cidadaos', cidadao.id, {
      status_atendimento: 'aguardando_vaga',
      historico: [
        ...(cidadao.historico || []),
        `Encaminhamento recusado pela OSC em ${new Date().toLocaleString('pt-BR')}.`
      ]
    });
  }

  if (status === 'concluido') {
    const solicitacao = await crudService.update('solicitacoes', encaminhamento.solicitacao_id, { status: 'concluida' });
    const cidadao = await crudService.get('cidadaos', solicitacao.cidadao_id);
    await crudService.update('cidadaos', cidadao.id, {
      status_atendimento: 'atendido',
      historico: [
        ...(cidadao.historico || []),
        `Atendimento concluido em ${new Date().toLocaleString('pt-BR')}.`
      ]
    });
  }

  await logAction(req, 'RESPONDER_ENCAMINHAMENTO', 'encaminhamentos', encaminhamento.id, {
    status,
    justificativa: req.body.justificativa
  });

  res.json(encaminhamento);
});

module.exports = { ...base, responder };
