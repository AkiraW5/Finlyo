const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

// Rotas para contas
router.get('/', accountController.getAccounts);
router.post('/', accountController.createAccount);
router.get('/:id', accountController.getAccountById);
router.put('/:id', accountController.updateAccount);
router.delete('/:id', accountController.deleteAccount);

module.exports = router;