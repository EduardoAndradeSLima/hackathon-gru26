const router = require('express').Router();
const controller = require('../controllers/authController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { loginValidator, forgotPasswordValidator } = require('../validators/authValidator');

router.post('/login', loginValidator, validate, controller.login);
router.post('/forgot-password', forgotPasswordValidator, validate, controller.forgotPassword);
router.get('/me', auth, controller.me);

module.exports = router;
