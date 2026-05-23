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
  }

  if (status === 'recusado') {
    await crudService.update('vagas', encaminhamento.vaga_id, { status: 'disponivel' });
  }

  await logAction(req, 'RESPONDER_ENCAMINHAMENTO', 'encaminhamentos', encaminhamento.id, {
    status,
    justificativa: req.body.justificativa
  });

  res.json(encaminhamento);
});

module.exports = { ...base, responder };
