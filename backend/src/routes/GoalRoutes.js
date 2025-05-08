const express = require('express');
const router = express.Router();
const goalController = require('../controllers/GoalController');

// Rotas para metas financeiras
router.post('/', goalController.createGoal);
router.get('/', goalController.getAllGoals);
router.get('/:id', goalController.getGoalById);
router.put('/:id', goalController.updateGoal);
router.delete('/:id', goalController.deleteGoal);
router.get('/:id/progress', goalController.getGoalProgress);

module.exports = router;