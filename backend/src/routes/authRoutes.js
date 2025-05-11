// Isso já está correto no seu código, então não precisa mudar
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passwordResetController = require('../controllers/passwordResetController');

// Rotas de autenticação
router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/verify', authController.verify);

// Rotas de recuperação de senha
router.post('/forgot-password', passwordResetController.requestPasswordReset);
router.post('/reset-password', passwordResetController.resetPassword);

module.exports = router;