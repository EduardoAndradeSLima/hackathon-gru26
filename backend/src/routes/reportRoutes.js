const router = require('express').Router();
const controller = require('../controllers/reportController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const { CENTRAL_PROFILES } = require('../models/profiles');

router.get('/', auth, authorize(...CENTRAL_PROFILES), controller.getRows);
router.get('/csv', auth, authorize(...CENTRAL_PROFILES), controller.getCsv);
router.get('/pdf', auth, authorize(...CENTRAL_PROFILES), controller.getPdf);

module.exports = router;
