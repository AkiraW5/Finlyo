const Budget = require('../models/Budget');
const Category = require('../models/Category');

// Criar uma nova meta
exports.createGoal = async (req, res) => {
  try {
    // Garantir que o tipo seja 'goal'
    const goalData = {
      ...req.body,
      type: 'goal'
    };
    
    const goal = await Budget.create(goalData);
    res.status(201).json(goal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obter todas as metas
exports.getAllGoals = async (req, res) => {
  try {
    const goals = await Budget.findAll({
      where: { type: 'goal' },
      include: [{ model: Category, attributes: ['id', 'name', 'color'] }]
    });
    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obter meta por ID
exports.getGoalById = async (req, res) => {
  try {
    const goal = await Budget.findOne({
      where: { 
        id: req.params.id,
        type: 'goal'
      },
      include: [{ model: Category, attributes: ['id', 'name', 'color'] }]
    });
    
    if (!goal) {
      return res.status(404).json({ message: 'Meta não encontrada' });
    }
    
    res.status(200).json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Atualizar uma meta
exports.updateGoal = async (req, res) => {
  try {
    // Verificar se a meta existe e é do tipo 'goal'
    const goalExists = await Budget.findOne({
      where: { 
        id: req.params.id,
        type: 'goal'
      }
    });
    
    if (!goalExists) {
      return res.status(404).json({ message: 'Meta não encontrada' });
    }
    
    // Garantir que o tipo permaneça como 'goal'
    const goalData = {
      ...req.body,
      type: 'goal'
    };
    
    await Budget.update(goalData, {
      where: { id: req.params.id }
    });
    
    const updatedGoal = await Budget.findOne({
      where: { id: req.params.id },
      include: [{ model: Category, attributes: ['id', 'name', 'color'] }]
    });
    
    res.status(200).json(updatedGoal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Excluir uma meta
exports.deleteGoal = async (req, res) => {
  try {
    const deleted = await Budget.destroy({
      where: { 
        id: req.params.id,
        type: 'goal'
      }
    });
    
    if (deleted === 0) {
      return res.status(404).json({ message: 'Meta não encontrada' });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obter progresso de uma meta
exports.getGoalProgress = async (req, res) => {
  try {
    const goalId = req.params.id;
    
    const goal = await Budget.findOne({
      where: { 
        id: goalId,
        type: 'goal'
      }
    });
    
    if (!goal) {
      return res.status(404).json({ message: 'Meta não encontrada' });
    }
    
    // Aqui você pode implementar a lógica para calcular o progresso
    // Por exemplo, buscar todas as contribuições para esta meta
    
    const progress = {
      goalId: goalId,
      target: goal.amount,
      current: 0, // Você calcularia isso com base nas contribuições
      percentage: 0 // E isso também
    };
    
    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};