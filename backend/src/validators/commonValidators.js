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

const cidadaoPartialValidator = [
  body('nome').optional({ checkFalsy: true }).notEmpty().withMessage('Nome obrigatorio.'),
  body('cpf').optional({ checkFalsy: true }).notEmpty().withMessage('CPF obrigatorio.'),
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
  body('idade').isInt({ min: 60, max: 130 }).withMessage('Idade invalida para triagem ILPI.'),
  body('bairro').notEmpty().withMessage('Bairro obrigatorio.'),
  body('regiao').optional({ checkFalsy: true }).isString().withMessage('Regiao invalida.'),
  body('tipo_necessidade').equals('ILPI').withMessage('A triagem publica atual aceita apenas casos de ILPI.'),
  body('grau_mobilidade').isIn(['independente', 'apoio', 'cadeira_rodas', 'acamado']).withMessage('Grau de mobilidade obrigatorio.'),
  body('alimentacao').isIn(['independente', 'assistida']).withMessage('Alimentacao obrigatoria.'),
  body('higiene_pessoal').isIn(['independente', 'assistida', 'dependente']).withMessage('Higiene pessoal obrigatoria.'),
  body('cognicao').isIn(['preservada', 'confusao_leve', 'comprometida']).withMessage('Cognicao obrigatoria.'),
  body('uso_medicamentos').isIn(['autonomo', 'supervisionado', 'administrado']).withMessage('Uso de medicamentos obrigatorio.'),
  body('presenca_cuidador').isIn(['sim', 'parcial', 'nao']).withMessage('Presenca de cuidador obrigatoria.'),
  body('risco_abandono').isIn(['baixo', 'medio', 'alto', 'critico']).withMessage('Risco de abandono obrigatorio.'),
  body('situacao_moradia').isIn(['propria_alugada', 'com_familia', 'provisoria', 'rua', 'institucional']).withMessage('Situacao de moradia obrigatoria.'),
  body('renda_aproximada').isFloat({ min: 0 }).withMessage('Renda obrigatoria.'),
  body('saude').isIn(['estavel', 'acompanhamento', 'fragil', 'grave']).withMessage('Condicao de saude obrigatoria.')
];

module.exports = {
  idParam,
  userValidator,
  oscValidator,
  vagaValidator,
  cidadaoValidator,
  cidadaoPartialValidator,
  solicitacaoValidator,
  encaminhamentoValidator,
  triageValidator
};
