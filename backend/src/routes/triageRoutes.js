const router = require('express').Router();
const controller = require('../controllers/triageController');
const optionalAuth = require('../middlewares/optionalAuth');
const validate = require('../middlewares/validate');
const { triageValidator } = require('../validators/commonValidators');

router.post('/', optionalAuth, triageValidator, validate, controller.submit);

module.exports = router;
