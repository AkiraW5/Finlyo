const express = require('express');
const router = express.Router();
const goalController = require('../controllers/GoalController');
const { authenticateToken } = require('../middlewares/auth');

// Proteger todas as rotas de metas
router.use(authenticateToken);

// Rotas de metas
router.get('/', goalController.getAllGoals);
router.get('/:id', goalController.getGoalById);
router.post('/', goalController.createGoal);
router.put('/:id', goalController.updateGoal);
router.delete('/:id', goalController.deleteGoal);

module.exports = router;