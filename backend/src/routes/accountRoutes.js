const express = require('express');
const router = express.Router();
const accountController = require('../controllers/AccountController');
const { authenticateToken } = require('../middlewares/auth');

// Todas as rotas agora exigem autenticação
router.get('/', authenticateToken, accountController.getAccounts);
router.post('/', authenticateToken, accountController.createAccount);
router.get('/:id', authenticateToken, accountController.getAccountById);
router.put('/:id', authenticateToken, accountController.updateAccount);
router.delete('/:id', authenticateToken, accountController.deleteAccount);

module.exports = router;