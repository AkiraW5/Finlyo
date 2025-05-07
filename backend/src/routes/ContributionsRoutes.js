const express = require('express');
const router = express.Router();
const contributionController = require('../controllers/contributionController');

// Definição das rotas de contribuições
router.get('/', contributionController.getAllContributions);
router.get('/budget/:budgetId', contributionController.getContributionsByBudget);
router.post('/', contributionController.createContribution);
router.put('/:id', contributionController.updateContribution);
router.delete('/:id', contributionController.deleteContribution);
router.get('/:id', contributionController.getContributionById);

module.exports = router;