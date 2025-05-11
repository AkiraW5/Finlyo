const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const { authenticateToken } = require('../middlewares/auth');

// Proteger todas as rotas
router.use(authenticateToken);

// Rotas de orçamentos
router.get('/', budgetController.getAllBudgets);
router.post('/', budgetController.createBudget);
router.put('/:id', budgetController.updateBudget);
router.delete('/:id', budgetController.deleteBudget);
router.get('/:id', budgetController.getBudgetById);

router.get('/category/:categoryId', budgetController.getBudgetsByCategory);
router.get('/type/:type', budgetController.getBudgetsByType);
router.get('/summary', budgetController.getBudgetSummary);

module.exports = router;