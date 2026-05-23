const createCrudController = require('./crudController');
const asyncHandler = require('../utils/asyncHandler');
const crudService = require('../services/crudService');
const { logAction } = require('../services/auditService');

const base = createCrudController('cidadaos');

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

module.exports = { ...base, uploadDocument };
