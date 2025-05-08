const Budget = require('../models/Budget');
const Category = require('../models/Category');

// Criar um novo orçamento
exports.createBudget = async (req, res) => {
  try {
    // Garantir que o tipo seja 'expense' ou 'income' (não 'goal')
    const budgetData = {
      ...req.body,
      type: req.body.type === 'income' ? 'income' : 'expense'
    };
    
    // Verificar se o campo category está presente
    if (!budgetData.category) {
      // Se tiver categoryId mas não category, buscar o nome da categoria
      if (budgetData.categoryId) {
        const category = await Category.findByPk(budgetData.categoryId);
        if (category) {
          budgetData.category = category.name;
        } else {
          return res.status(400).json({ message: 'Categoria não encontrada' });
        }
      } else {
        return res.status(400).json({ message: 'Campo category é obrigatório' });
      }
    }
    
    const budget = await Budget.create(budgetData);
    res.status(201).json(budget);
  } catch (error) {
    console.error('Erro ao criar orçamento:', error);
    res.status(400).json({ message: error.message });
  }
};

// Obter todos os orçamentos (não metas)
exports.getAllBudgets = async (req, res) => {
  try {
    const budgets = await Budget.findAll({
      where: {
        type: ['expense', 'income']
      },
      include: [{ model: Category, attributes: ['id', 'name', 'color'] }]
    });
    res.status(200).json(budgets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obter orçamento por ID
exports.getBudgetById = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      where: { 
        id: req.params.id,
        type: ['expense', 'income']
      },
      include: [{ model: Category, attributes: ['id', 'name', 'color'] }]
    });
    
    if (!budget) {
      return res.status(404).json({ message: 'Orçamento não encontrado' });
    }
    
    res.status(200).json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Atualizar um orçamento
exports.updateBudget = async (req, res) => {
  try {
    // Verificar se o orçamento existe e não é do tipo 'goal'
    const budgetExists = await Budget.findOne({
      where: { 
        id: req.params.id,
        type: ['expense', 'income']
      }
    });
    
    if (!budgetExists) {
      return res.status(404).json({ message: 'Orçamento não encontrado' });
    }
    
    // Garantir que o tipo não seja alterado para 'goal'
    const budgetData = {
      ...req.body,
      type: req.body.type === 'income' ? 'income' : 'expense'
    };
    
    await Budget.update(budgetData, {
      where: { id: req.params.id }
    });
    
    const updatedBudget = await Budget.findOne({
      where: { id: req.params.id },
      include: [{ model: Category, attributes: ['id', 'name', 'color'] }]
    });
    
    res.status(200).json(updatedBudget);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Excluir um orçamento
exports.deleteBudget = async (req, res) => {
  try {
    const deleted = await Budget.destroy({
      where: { 
        id: req.params.id,
        type: ['expense', 'income']
      }
    });
    
    if (deleted === 0) {
      return res.status(404).json({ message: 'Orçamento não encontrado' });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};