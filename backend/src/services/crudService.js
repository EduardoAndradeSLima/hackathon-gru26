const bcrypt = require('bcryptjs');
const store = require('../database/store');
const ApiError = require('../utils/ApiError');
const { applyQuery } = require('../utils/query');

const searchableFields = {
  users: ['nome', 'email', 'perfil', 'unidade'],
  oscs: ['nome', 'cnpj', 'bairro', 'regiao', 'tipo_servico'],
  vagas: ['tipo_servico', 'status', 'observacoes'],
  cidadaos: ['nome', 'cpf', 'nis', 'bairro', 'regiao', 'unidade_referencia'],
  solicitacoes: ['tipo_servico', 'prioridade', 'status'],
  encaminhamentos: ['status', 'justificativa'],
  logs: ['acao', 'entidade', 'usuario_nome']
};

function sanitize(collection, item) {
  if (!item) {
    return item;
  }

  if (collection === 'users') {
    const { senha_hash, senha_temporaria, ...safeUser } = item;
    return safeUser;
  }

  return item;
}

function cleanPayload(collection, payload) {
  const data = { ...payload };

  delete data.id;
  delete data.created_at;
  delete data.updated_at;

  if (collection === 'users') {
    delete data.senha_temporaria;
  }

  if (collection === 'cidadaos' && data.nascimento === '') {
    data.nascimento = null;
  }

  return data;
}

async function list(collection, query = {}) {
  const items = await store.list(collection);
  const result = applyQuery(items, query, searchableFields[collection] || []);

  return {
    ...result,
    data: result.data.map((item) => sanitize(collection, item))
  };
}

async function get(collection, id) {
  const item = await store.findById(collection, id);

  if (!item) {
    throw new ApiError(404, 'Registro nao encontrado.');
  }

  return sanitize(collection, item);
}

async function create(collection, payload) {
  const data = cleanPayload(collection, payload);

  if (collection === 'users') {
    if (!data.senha) {
      throw new ApiError(422, 'Senha obrigatoria para novo usuario.');
    }

    data.senha_hash = await bcrypt.hash(data.senha, 10);
    delete data.senha;
  }

  const created = await store.create(collection, data);
  return sanitize(collection, created);
}

async function update(collection, id, payload) {
  const data = cleanPayload(collection, payload);

  if (collection === 'users') {
    if (data.senha) {
      data.senha_hash = await bcrypt.hash(data.senha, 10);
    }
    delete data.senha;
  }

  const updated = await store.update(collection, id, data);

  if (!updated) {
    throw new ApiError(404, 'Registro nao encontrado.');
  }

  return sanitize(collection, updated);
}

async function remove(collection, id) {
  const removed = await store.remove(collection, id);

  if (!removed) {
    throw new ApiError(404, 'Registro nao encontrado.');
  }

  return sanitize(collection, removed);
}

module.exports = { list, get, create, update, remove };
