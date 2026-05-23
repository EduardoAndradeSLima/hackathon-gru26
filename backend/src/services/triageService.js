const store = require('../database/store');
const recommendationService = require('./recommendationService');

async function submit(form, origem = 'cidadao') {
  const resultado = await recommendationService.recommend(form);
  const triagem = await store.create('triagens', {
    origem,
    dados: form,
    classificacao: resultado.classificacao,
    recomendacoes: resultado.recomendacoes.map((item) => ({
      vaga_id: item.vaga.id,
      osc_id: item.osc?.id,
      score: item.score,
      justificativa: item.justificativa
    })),
    alertas: resultado.alertas
  });

  return { triagem, resultado };
}

module.exports = { submit };
