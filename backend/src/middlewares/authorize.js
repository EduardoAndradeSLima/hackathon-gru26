const ApiError = require('../utils/ApiError');

function authorize(...profiles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Autenticacao obrigatoria.'));
    }

    if (!profiles.includes(req.user.perfil)) {
      return next(new ApiError(403, 'Perfil sem permissao para esta acao.'));
    }

    return next();
  };
}

module.exports = authorize;
