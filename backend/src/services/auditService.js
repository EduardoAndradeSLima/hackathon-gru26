const store = require('../database/store');

async function logAction(req, acao, entidade, entidadeId, detalhes = {}) {
  const usuario = req.user || { id: 'publico', nome: 'Acesso publico' };

  return store.create('logs', {
    usuario_id: usuario.id,
    usuario_nome: usuario.nome,
    acao,
    entidade,
    entidade_id: entidadeId,
    detalhes,
    data: new Date().toISOString()
  });
}

module.exports = { logAction };
