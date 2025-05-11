// backend/src/routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticateToken } = require('../middlewares/auth');

// Proteger todas as rotas com o middleware de autenticação
router.get('/', authenticateToken, transactionController.getTransactions);
// Rota específica deve vir antes da rota com parâmetro (:id)
router.post('/pay-credit-card', authenticateToken, transactionController.payCreditCardBill);
router.get('/:id', authenticateToken, transactionController.getTransactionById);
router.post('/', authenticateToken, transactionController.createTransaction);
router.put('/:id', authenticateToken, transactionController.updateTransaction);
router.delete('/:id', authenticateToken, transactionController.deleteTransaction);

module.exports = router;