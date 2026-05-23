const router = require('express').Router();
const controller = require('../controllers/dashboardController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const { PROFILES } = require('../models/profiles');

router.get('/', auth, authorize(PROFILES.ADMINISTRADOR, PROFILES.CENTRAL_VAGAS, PROFILES.CRAS, PROFILES.CREAS), controller.show);

module.exports = router;
