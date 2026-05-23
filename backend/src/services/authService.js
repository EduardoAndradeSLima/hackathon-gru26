const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const store = require('../database/store');
const ApiError = require('../utils/ApiError');

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      perfil: user.perfil,
      unidade: user.unidade
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

function publicUser(user) {
  const { senha_hash, senha_temporaria, ...safeUser } = user;
  return safeUser;
}

async function login(email, senha) {
  const users = await store.list('users');
  const user = users.find((item) => item.email.toLowerCase() === String(email).toLowerCase());

  if (!user) {
    throw new ApiError(401, 'Email ou senha invalidos.');
  }

  const isValid = await bcrypt.compare(senha, user.senha_hash);

  if (!isValid) {
    throw new ApiError(401, 'Email ou senha invalidos.');
  }

  return {
    token: signToken(user),
    user: publicUser(user)
  };
}

async function me(userId) {
  const user = await store.findById('users', userId);

  if (!user) {
    throw new ApiError(404, 'Usuario nao encontrado.');
  }

  return publicUser(user);
}

module.exports = { login, me };
