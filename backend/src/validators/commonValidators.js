const { body, param } = require('express-validator');

const idParam = [
  param('id').notEmpty().withMessage('Identificador obrigatorio.')
];

const userValidator = [
  body('nome').notEmpty().withMessage('Nome obrigatorio.'),
  body('email').isEmail().withMessage('Email invalido.'),
  body('perfil').isIn([
    'ADMINISTRADOR',
    'GESTOR_CENTRAL',
    'FUNCIONARIO_CRAS',
    'FUNCIONARIO_CREAS',
    'CENTRAL_VAGAS',
    'CRAS',
    'CREAS',
    'OSC',
    'CIDADAO'
  ]).withMessage('Perfil invalido.'),
  body('unidade').notEmpty().withMessage('Unidade obrigatoria.')
];

const oscValidator = [
  body('nome').notEmpty().withMessage('Nome obrigatorio.'),
  body('cnpj').notEmpty().withMessage('CNPJ obrigatorio.'),
  body('telefone').notEmpty().withMessage('Telefone obrigatorio.'),
  body('responsavel').notEmpty().withMessage('Responsavel obrigatorio.'),
  body('tipo_servico').notEmpty().withMessage('Tipo de servico obrigatorio.')
];

const vagaValidator = [
  body('osc_id').notEmpty().withMessage('OSC obrigatoria.'),
  body('tipo_servico').notEmpty().withMessage('Tipo de servico obrigatorio.'),
  body('status').isIn(['disponivel', 'ocupada', 'reservada', 'bloqueada']).withMessage('Status invalido.')
];

const cidadaoValidator = [
  body('nome').notEmpty().withMessage('Nome obrigatorio.'),
  body('cpf').notEmpty().withMessage('CPF obrigatorio.'),
  body('telefone').optional({ checkFalsy: true }).isLength({ min: 8 }).withMessage('Telefone invalido.'),
  body('status_atendimento')
    .optional({ checkFalsy: true })
    .isIn(['aguardando_triagem', 'em_triagem', 'aguardando_vaga', 'encaminhado', 'em_acolhimento', 'atendido', 'cancelado'])
    .withMessage('Status do cidadao invalido.')
];

const solicitacaoValidator = [
  body('cidadao_id').notEmpty().withMessage('Cidadao obrigatorio.'),
  body('tipo_servico').notEmpty().withMessage('Tipo de servico obrigatorio.'),
  body('prioridade').isIn(['baixa', 'media', 'alta', 'critica']).withMessage('Prioridade invalida.'),
  body('status').isIn(['pendente', 'em_analise', 'encaminhada', 'concluida', 'cancelada']).withMessage('Status invalido.')
];

const encaminhamentoValidator = [
  body('solicitacao_id').notEmpty().withMessage('Solicitacao obrigatoria.'),
  body('vaga_id').notEmpty().withMessage('Vaga obrigatoria.'),
  body('status').isIn(['aguardando_osc', 'aceito', 'recusado', 'concluido']).withMessage('Status invalido.')
];

const triageValidator = [
  body('nome').notEmpty().withMessage('Nome obrigatorio.'),
  body('idade').isInt({ min: 0, max: 130 }).withMessage('Idade invalida.'),
  body('bairro').notEmpty().withMessage('Bairro obrigatorio.'),
  body('regiao').notEmpty().withMessage('Regiao obrigatoria.'),
  body('urgencia').isIn(['baixa', 'media', 'alta', 'critica']).withMessage('Urgencia invalida.'),
  body('tipo_necessidade').notEmpty().withMessage('Tipo de necessidade obrigatorio.')
];

module.exports = {
  idParam,
  userValidator,
  oscValidator,
  vagaValidator,
  cidadaoValidator,
  solicitacaoValidator,
  encaminhamentoValidator,
  triageValidator
};
