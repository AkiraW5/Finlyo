const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rotas públicas
router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/verify', authController.verify);

module.exports = router;