const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/authService');
const { logAction } = require('../services/auditService');

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body.email, req.body.senha);
  await logAction({ user: result.user }, 'LOGIN', 'users', result.user.id);
  res.json(result);
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.me(req.user.id);
  res.json(user);
});

const forgotPassword = asyncHandler(async (req, res) => {
  res.json({
    message: 'Solicitacao registrada. Em producao, um fluxo seguro de redefinicao sera enviado ao email institucional.'
  });
});

module.exports = { login, me, forgotPassword };
