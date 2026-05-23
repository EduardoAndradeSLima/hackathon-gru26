const router = require('express').Router();
const controller = require('../controllers/reportController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const { PROFILES } = require('../models/profiles');

router.get('/', auth, authorize(PROFILES.ADMINISTRADOR, PROFILES.CENTRAL_VAGAS), controller.getRows);
router.get('/csv', auth, authorize(PROFILES.ADMINISTRADOR, PROFILES.CENTRAL_VAGAS), controller.getCsv);
router.get('/pdf', auth, authorize(PROFILES.ADMINISTRADOR, PROFILES.CENTRAL_VAGAS), controller.getPdf);

module.exports = router;
