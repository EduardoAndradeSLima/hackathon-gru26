const asyncHandler = require('../utils/asyncHandler');
const triageService = require('../services/triageService');
const { logAction } = require('../services/auditService');

const submit = asyncHandler(async (req, res) => {
  const origem = req.user ? 'profissional' : 'cidadao';
  const result = await triageService.submit(req.body, origem);
  await logAction(req, 'TRIAGEM', 'triagens', result.triagem.id, {
    classificacao: result.resultado.classificacao
  });
  res.status(201).json(result);
});

module.exports = { submit };
