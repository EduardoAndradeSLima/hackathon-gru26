const router = require('express').Router;
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const createCrudController = require('../controllers/crudController');
const cidadaoController = require('../controllers/cidadaoController');
const encaminhamentoController = require('../controllers/encaminhamentoController');
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
const { PROFILES } = require('../models/profiles');

function resource(collection, validator, profiles = []) {
  const instance = router();
  const controller = collection === 'cidadaos'
    ? cidadaoController
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
const oscs = resource('oscs', oscValidator, [PROFILES.ADMINISTRADOR, PROFILES.CENTRAL_VAGAS]);
const vagas = resource('vagas', vagaValidator, [PROFILES.ADMINISTRADOR, PROFILES.CENTRAL_VAGAS, PROFILES.OSC]);
const cidadaos = resource('cidadaos', cidadaoValidator, [PROFILES.ADMINISTRADOR, PROFILES.CRAS, PROFILES.CREAS, PROFILES.CENTRAL_VAGAS]);
const solicitacoes = resource('solicitacoes', solicitacaoValidator, [PROFILES.ADMINISTRADOR, PROFILES.CRAS, PROFILES.CREAS, PROFILES.CENTRAL_VAGAS]);
const encaminhamentos = resource('encaminhamentos', encaminhamentoValidator, [PROFILES.ADMINISTRADOR, PROFILES.CENTRAL_VAGAS]);

cidadaos.post('/:id/documentos', auth, authorize(PROFILES.ADMINISTRADOR, PROFILES.CRAS, PROFILES.CREAS, PROFILES.CENTRAL_VAGAS), upload.single('documento'), cidadaoController.uploadDocument);
encaminhamentos.patch('/:id/responder', auth, authorize(PROFILES.ADMINISTRADOR, PROFILES.CENTRAL_VAGAS, PROFILES.OSC), encaminhamentoController.responder);

module.exports = { users, oscs, vagas, cidadaos, solicitacoes, encaminhamentos };
