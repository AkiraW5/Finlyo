const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const { authenticateToken } = require('../middlewares/auth');  // Importar a função específica

// Todas as rotas precisam de autenticação
router.use(authenticateToken);  // Usar a função importada

// Rotas de contas
router.get('/', accountController.getAccounts);
router.get('/:id', accountController.getAccountById);
router.post('/', accountController.createAccount);
router.put('/:id', accountController.updateAccount);
router.delete('/:id', accountController.deleteAccount);

module.exports = router;