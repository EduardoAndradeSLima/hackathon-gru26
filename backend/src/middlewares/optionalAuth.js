const jwt = require('jsonwebtoken');
const env = require('../config/env');
const store = require('../database/store');

async function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const [, token] = header.split(' ');

  if (!token) {
    return next();
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await store.findById('users', payload.sub);

    if (user) {
      req.user = {
        id: user.id,
        nome: user.nome,
        email: user.email,
        perfil: user.perfil,
        unidade: user.unidade
      };
    }
  } catch {
    req.user = null;
  }

  return next();
}

module.exports = optionalAuth;
