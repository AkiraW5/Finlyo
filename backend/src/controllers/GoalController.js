const Budget = require('../models/Budget');
const Category = require('../models/Category');

// Criar uma nova meta
exports.createGoal = async (req, res) => {
  try {
    const userId = req.user.id;  // Obtém o ID do usuário a partir do token JWT
    
    // Garantir que o tipo seja 'goal' e incluir o userId
    const goalData = {
      ...req.body,
      type: 'goal',
      userId: userId
    };
    
    const goal = await Budget.create(goalData);
    res.status(201).json(goal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obter todas as metas do usuário atual
exports.getAllGoals = async (req, res) => {
  try {
    const userId = req.user.id;  // Obtém o ID do usuário a partir do token JWT
    
    const goals = await Budget.findAll({
      where: { 
        type: 'goal',
        userId: userId
      },
      include: [{ model: Category, attributes: ['id', 'name', 'color'] }]
    });
    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obter meta por ID (somente se pertencer ao usuário atual)
exports.getGoalById = async (req, res) => {
  try {
    const userId = req.user.id;  // Obtém o ID do usuário a partir do token JWT
    
    const goal = await Budget.findOne({
      where: { 
        id: req.params.id,
        type: 'goal',
        userId: userId
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

// Atualizar uma meta (somente se pertencer ao usuário atual)
exports.updateGoal = async (req, res) => {
  try {
    const userId = req.user.id;  // Obtém o ID do usuário a partir do token JWT
    
    // Verificar se a meta existe e pertence ao usuário atual
    const goalExists = await Budget.findOne({
      where: { 
        id: req.params.id,
        type: 'goal',
        userId: userId
      }
    });
    
    if (!goalExists) {
      return res.status(404).json({ message: 'Meta não encontrada' });
    }
    
    // Garantir que o tipo permaneça como 'goal' e o userId não seja alterado
    const goalData = {
      ...req.body,
      type: 'goal',
      // Não incluímos userId aqui para não permitir a alteração do proprietário
    };
    
    await Budget.update(goalData, {
      where: { 
        id: req.params.id,
        userId: userId
      }
    });
    
    const updatedGoal = await Budget.findOne({
      where: { 
        id: req.params.id,
        userId: userId
      },
      include: [{ model: Category, attributes: ['id', 'name', 'color'] }]
    });
    
    res.status(200).json(updatedGoal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Excluir uma meta (somente se pertencer ao usuário atual)
exports.deleteGoal = async (req, res) => {
  try {
    const userId = req.user.id;  // Obtém o ID do usuário a partir do token JWT
    
    const deleted = await Budget.destroy({
      where: { 
        id: req.params.id,
        type: 'goal',
        userId: userId
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