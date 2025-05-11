const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passwordResetController = require('../controllers/passwordResetController');
const userController = require('../controllers/userController');

// Rotas existentes
router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/verify', authController.verify);

// Novas rotas para recuperação de senha
router.post('/forgot-password', passwordResetController.requestPasswordReset);
router.post('/reset-password', passwordResetController.resetPassword);

// Route for getting user information
router.get('/me', userController.getUserInfo);

module.exports = router;