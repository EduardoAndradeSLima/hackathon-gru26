const createCrudController = require('./crudController');
const asyncHandler = require('../utils/asyncHandler');
const crudService = require('../services/crudService');
const store = require('../database/store');
const { logAction } = require('../services/auditService');

const base = createCrudController('cidadaos');

function getDateValue(item) {
  return new Date(item.updated_at || item.created_at || item.data_solicitacao || 0).getTime() || 0;
}

async function getLatestAttendanceFlow(cidadaoId) {
  const [solicitacoes, encaminhamentos] = await Promise.all([
    store.list('solicitacoes'),
    store.list('encaminhamentos')
  ]);

  const solicitacao = solicitacoes
    .filter((item) => item.cidadao_id === cidadaoId && item.tipo_servico === 'ILPI')
    .sort((a, b) => getDateValue(b) - getDateValue(a))[0];

  if (!solicitacao) {
    return { solicitacao: null, encaminhamento: null };
  }

  const related = encaminhamentos
    .filter((item) => item.solicitacao_id === solicitacao.id)
    .sort((a, b) => getDateValue(b) - getDateValue(a));

  const encaminhamento = related.find((item) => ['aguardando_osc', 'aceito'].includes(item.status)) || related[0] || null;

  return { solicitacao, encaminhamento };
}

async function syncVacancyByCitizenStatus(cidadao, status) {
  const { solicitacao, encaminhamento } = await getLatestAttendanceFlow(cidadao.id);
  const now = new Date().toISOString();

  if (!solicitacao) {
    return { changed: false, reason: 'cidadao_sem_solicitacao_ilpi' };
  }

  if (!encaminhamento) {
    if (['aguardando_triagem', 'em_triagem', 'aguardando_vaga'].includes(status)) {
      await crudService.update('solicitacoes', solicitacao.id, { status: 'em_analise' });
      return { changed: true, solicitacao_id: solicitacao.id, status_solicitacao: 'em_analise' };
    }

    return { changed: false, reason: 'solicitacao_sem_encaminhamento' };
  }

  const releaseStatuses = ['aguardando_triagem', 'em_triagem', 'aguardando_vaga', 'cancelado'];
  const nextByCitizenStatus = {
    encaminhado: {
      vaga: 'reservada',
      encaminhamento: 'aguardando_osc',
      solicitacao: 'encaminhada'
    },
    em_acolhimento: {
      vaga: 'ocupada',
      encaminhamento: 'aceito',
      solicitacao: 'concluida'
    },
    atendido: {
      vaga: 'ocupada',
      encaminhamento: 'concluido',
      solicitacao: 'concluida'
    }
  };

  const next = releaseStatuses.includes(status)
    ? {
        vaga: 'disponivel',
        encaminhamento: 'recusado',
        solicitacao: status === 'cancelado' ? 'cancelada' : 'em_analise'
      }
    : nextByCitizenStatus[status];

  if (!next) {
    return { changed: false, reason: 'status_sem_regra_de_vaga' };
  }

  const solicitacaoPayload = {
    status: next.solicitacao
  };

  if (next.solicitacao === 'encaminhada') {
    solicitacaoPayload.data_encaminhamento = solicitacao.data_encaminhamento || now;
  }

  const vaga = await crudService.update('vagas', encaminhamento.vaga_id, {
    status: next.vaga
  });
  const updatedEncaminhamento = await crudService.update('encaminhamentos', encaminhamento.id, {
    status: next.encaminhamento,
    justificativa: `Sincronizado automaticamente apos status do cidadao mudar para ${status}.`
  });
  const updatedSolicitacao = await crudService.update('solicitacoes', solicitacao.id, solicitacaoPayload);

  return {
    changed: true,
    vaga_id: vaga.id,
    status_vaga: vaga.status,
    encaminhamento_id: updatedEncaminhamento.id,
    status_encaminhamento: updatedEncaminhamento.status,
    solicitacao_id: updatedSolicitacao.id,
    status_solicitacao: updatedSolicitacao.status
  };
}

const update = asyncHandler(async (req, res) => {
  const before = await crudService.get('cidadaos', req.params.id);
  const nextStatus = req.body.status_atendimento;
  const statusChanged = nextStatus && nextStatus !== before.status_atendimento;
  const history = Array.isArray(before.historico) ? before.historico : [];
  const payload = statusChanged
    ? {
        ...req.body,
        historico: [
          ...history,
          `Status alterado de ${before.status_atendimento || 'nao informado'} para ${nextStatus} em ${new Date().toLocaleString('pt-BR')}.`
        ]
      }
    : req.body;

  const item = await crudService.update('cidadaos', req.params.id, payload);
  const sync = statusChanged ? await syncVacancyByCitizenStatus(item, nextStatus) : null;

  await logAction(req, 'ATUALIZAR', 'cidadaos', item.id, {
    before,
    after: item,
    sincronizacao_vaga: sync
  });

  res.json(item);
});

const uploadDocument = asyncHandler(async (req, res) => {
  const cidadao = await crudService.get('cidadaos', req.params.id);
  if (!req.file) {
    return res.status(422).json({ message: 'Documento obrigatorio.' });
  }

  const anexo = {
    nome_original: req.file.originalname,
    arquivo: req.file.filename,
    url: `/uploads/${req.file.filename}`,
    mimetype: req.file.mimetype,
    tamanho: req.file.size,
    uploaded_at: new Date().toISOString(),
    uploaded_by: req.user.id
  };

  const updated = await crudService.update('cidadaos', cidadao.id, {
    anexos: [...(cidadao.anexos || []), anexo],
    historico: [
      ...(cidadao.historico || []),
      `Documento ${req.file.originalname} anexado em ${new Date().toLocaleString('pt-BR')}.`
    ]
  });

  await logAction(req, 'ANEXAR_DOCUMENTO', 'cidadaos', cidadao.id, { anexo });
  res.status(201).json(updated);
});

module.exports = { ...base, update, uploadDocument };
