const PDFDocument = require('pdfkit');
const store = require('../database/store');
const { toCsv } = require('../utils/csv');

async function rowsFor(type) {
  const [vagas, oscs, solicitacoes, cidadaos, encaminhamentos] = await Promise.all([
    store.list('vagas'),
    store.list('oscs'),
    store.list('solicitacoes'),
    store.list('cidadaos'),
    store.list('encaminhamentos')
  ]);

  if (type === 'ocupacao') {
    return vagas.map((vaga) => {
      const osc = oscs.find((item) => item.id === vaga.osc_id);
      return {
        vaga_id: vaga.id,
        osc: osc?.nome || '',
        tipo_servico: vaga.tipo_servico,
        status: vaga.status,
        grau_dependencia: vaga.grau_dependencia,
        atualizado_em: vaga.updated_at
      };
    });
  }

  if (type === 'demanda') {
    return solicitacoes.map((solicitacao) => {
      const cidadao = cidadaos.find((item) => item.id === solicitacao.cidadao_id);
      return {
        solicitacao_id: solicitacao.id,
        cidadao: cidadao?.nome || '',
        regiao: cidadao?.regiao || '',
        tipo_servico: solicitacao.tipo_servico,
        prioridade: solicitacao.prioridade,
        status: solicitacao.status,
        tempo_espera_dias: solicitacao.tempo_espera_dias
      };
    });
  }

  if (type === 'encaminhamentos') {
    return encaminhamentos.map((encaminhamento) => ({
      encaminhamento_id: encaminhamento.id,
      solicitacao_id: encaminhamento.solicitacao_id,
      vaga_id: encaminhamento.vaga_id,
      status: encaminhamento.status,
      justificativa: encaminhamento.justificativa,
      criado_em: encaminhamento.created_at
    }));
  }

  return [];
}

async function csv(type) {
  return toCsv(await rowsFor(type));
}

async function pdf(type) {
  const rows = await rowsFor(type);
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const chunks = [];

  return new Promise((resolve) => {
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    doc.fontSize(18).text('FacilitaGRU', { align: 'left' });
    doc.moveDown(0.4);
    doc.fontSize(12).text(`Relatorio: ${type}`);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`);
    doc.moveDown();

    rows.forEach((row, index) => {
      doc.fontSize(11).text(`${index + 1}. ${Object.values(row).join(' | ')}`, {
        width: 520
      });
      doc.moveDown(0.2);
    });

    if (!rows.length) {
      doc.text('Nenhum registro encontrado.');
    }

    doc.end();
  });
}

module.exports = { rowsFor, csv, pdf };
