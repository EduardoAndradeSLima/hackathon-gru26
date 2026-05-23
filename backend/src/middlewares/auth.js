const jwt = require('jsonwebtoken');
const env = require('../config/env');
const store = require('../database/store');
const ApiError = require('../utils/ApiError');

async function auth(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const [, token] = header.split(' ');

    if (!token) {
      throw new ApiError(401, 'Token de acesso nao informado.');
    }

    const payload = jwt.verify(token, env.jwtSecret);
    const user = await store.findById('users', payload.sub);

    if (!user) {
      throw new ApiError(401, 'Usuario nao encontrado.');
    }

    req.user = {
      id: user.id,
      nome: user.nome,
      email: user.email,
      perfil: user.perfil,
      unidade: user.unidade
    };

    return next();
  } catch (error) {
    return next(error.statusCode ? error : new ApiError(401, 'Sessao expirada ou invalida.'));
  }
}

module.exports = auth;
