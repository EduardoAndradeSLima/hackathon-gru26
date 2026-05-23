const { body } = require('express-validator');

const loginValidator = [
  body('email').isEmail().withMessage('Email invalido.'),
  body('senha').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres.')
];

const forgotPasswordValidator = [
  body('email').isEmail().withMessage('Email invalido.')
];

module.exports = { loginValidator, forgotPasswordValidator };
