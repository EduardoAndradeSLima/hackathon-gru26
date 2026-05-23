const router = require('express').Router();
const controller = require('../controllers/recommendationController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { triageValidator } = require('../validators/commonValidators');

router.post('/', auth, triageValidator, validate, controller.simulate);

module.exports = router;
