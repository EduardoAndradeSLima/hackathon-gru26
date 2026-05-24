const router = require('express').Router;
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const createCrudController = require('../controllers/crudController');
const cidadaoController = require('../controllers/cidadaoController');
const encaminhamentoController = require('../controllers/encaminhamentoController');
const solicitacaoController = require('../controllers/solicitacaoController');
const upload = require('../middlewares/upload');
const {
  idParam,
  userValidator,
  oscValidator,
  vagaValidator,
  cidadaoValidator,
  solicitacaoValidator,
  encaminhamentoValidator
} = require('../validators/commonValidators');
const { PROFILES, CENTRAL_PROFILES, CRAS_PROFILES, CREAS_PROFILES } = require('../models/profiles');

function resource(collection, validator, profiles = []) {
  const instance = router();
  const controller = collection === 'cidadaos'
    ? cidadaoController
    : collection === 'solicitacoes'
      ? solicitacaoController
    : collection === 'encaminhamentos'
      ? encaminhamentoController
      : createCrudController(collection);

  instance.use(auth);
  instance.get('/', controller.list);
  instance.get('/:id', idParam, validate, controller.get);
  instance.post('/', authorize(...profiles), validator, validate, controller.create);
  instance.put('/:id', authorize(...profiles), idParam, validator, validate, controller.update);
  instance.delete('/:id', authorize(PROFILES.ADMINISTRADOR), idParam, validate, controller.remove);

  return instance;
}

const users = resource('users', userValidator, [PROFILES.ADMINISTRADOR]);
const oscs = resource('oscs', oscValidator, CENTRAL_PROFILES);
const vagas = resource('vagas', vagaValidator, [...CENTRAL_PROFILES, PROFILES.OSC]);
const cidadaos = resource('cidadaos', cidadaoValidator, [...CRAS_PROFILES, ...CREAS_PROFILES]);
const solicitacoes = resource('solicitacoes', solicitacaoValidator, [...CRAS_PROFILES, ...CREAS_PROFILES]);
const encaminhamentos = resource('encaminhamentos', encaminhamentoValidator, CENTRAL_PROFILES);

cidadaos.post('/:id/documentos', auth, authorize(...CRAS_PROFILES, ...CREAS_PROFILES), upload.single('documento'), cidadaoController.uploadDocument);
solicitacoes.patch('/:id/encaminhar', auth, authorize(...CENTRAL_PROFILES), solicitacaoController.encaminhar);
encaminhamentos.patch('/:id/responder', auth, authorize(...CENTRAL_PROFILES, PROFILES.OSC), encaminhamentoController.responder);

module.exports = { users, oscs, vagas, cidadaos, solicitacoes, encaminhamentos };
