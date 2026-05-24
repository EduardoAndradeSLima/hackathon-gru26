const router = require('express').Router();
const controller = require('../controllers/dashboardController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const { MANAGEMENT_PROFILES } = require('../models/profiles');

router.get('/', auth, authorize(...MANAGEMENT_PROFILES), controller.show);

module.exports = router;
