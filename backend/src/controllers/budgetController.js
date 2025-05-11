const Budget = require('../models/Budget');
const Category = require('../models/Category');

// Criar um novo orçamento
exports.createBudget = async (req, res) => {
  try {
    const userId = req.user.id; // Obtido do middleware de autenticação

    // Garantir que o tipo seja 'expense' ou 'income' (não 'goal')
    const budgetData = {
      ...req.body,
      type: req.body.type === 'income' ? 'income' : 'expense',
      userId: userId
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

// Obter todos os orçamentos do usuário atual
exports.getAllBudgets = async (req, res) => {
  try {
    const userId = req.user.id; // Obtido do middleware de autenticação
    
    const budgets = await Budget.findAll({
      where: { 
        userId: userId,
        type: ['expense', 'income'] // Garantir que apenas orçamentos (não metas) sejam retornados
      },
      include: [{ model: Category, attributes: ['id', 'name', 'color'] }]
    });
    
    res.status(200).json(budgets);
  } catch (error) {
    console.error('Erro ao buscar orçamentos:', error);
    res.status(500).json({ message: error.message });
  }
};

// Obter orçamento por ID
exports.getBudgetById = async (req, res) => {
  try {
    const userId = req.user.id; // Obtido do middleware de autenticação
    
    const budget = await Budget.findOne({
      where: { 
        id: req.params.id,
        userId: userId, // CORREÇÃO: Adicionar userId para garantir acesso apenas aos próprios orçamentos
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
    const userId = req.user.id; // Obtido do middleware de autenticação

    // Verificar se o orçamento existe e não é do tipo 'goal'
    const budgetExists = await Budget.findOne({
      where: { 
        id: req.params.id,
        userId: userId,
        type: ['expense', 'income']
      }
    });
    
    if (!budgetExists) {
      return res.status(404).json({ message: 'Orçamento não encontrado' });
    }

    // Não permitir alterar o userId
    delete req.body.userId;
    
    // Garantir que o tipo não seja alterado para 'goal'
    const budgetData = {
      ...req.body,
      type: req.body.type === 'income' ? 'income' : 'expense'
    };
    
    // Atualizar o orçamento garantindo que apenas o próprio usuário possa modificá-lo
    await Budget.update(budgetData, {
      where: { 
        id: req.params.id,
        userId: userId
      }
    });
    
    const updatedBudget = await Budget.findOne({
      where: { 
        id: req.params.id,
        userId: userId
      },
      include: [{ model: Category, attributes: ['id', 'name', 'color'] }]
    });
    
    res.status(200).json(updatedBudget);
  } catch (error) {
    console.error('Erro ao atualizar orçamento:', error);
    res.status(400).json({ message: error.message });
  }
};

// Excluir um orçamento
exports.deleteBudget = async (req, res) => {
  try {
    const userId = req.user.id; // Obtido do middleware de autenticação
    
    // CORREÇÃO: Adicionar userId para garantir que o usuário só exclua seus próprios orçamentos
    const deleted = await Budget.destroy({
      where: { 
        id: req.params.id,
        userId: userId,
        type: ['expense', 'income']
      }
    });
    
    if (deleted === 0) {
      return res.status(404).json({ message: 'Orçamento não encontrado' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir orçamento:', error);
    res.status(500).json({ message: error.message });
  }
};

// Obter orçamentos por categoria
exports.getBudgetsByCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { categoryId } = req.params;
    
    const budgets = await Budget.findAll({
      where: { 
        categoryId: categoryId,
        userId: userId,
        type: ['expense', 'income']
      },
      include: [{ model: Category, attributes: ['id', 'name', 'color'] }]
    });
    
    res.status(200).json(budgets);
  } catch (error) {
    console.error('Erro ao buscar orçamentos por categoria:', error);
    res.status(500).json({ message: error.message });
  }
};

// Obter orçamentos por tipo (despesa ou receita)
exports.getBudgetsByType = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.params;
    
    if (type !== 'expense' && type !== 'income') {
      return res.status(400).json({ message: 'Tipo inválido. Use "expense" ou "income".' });
    }
    
    const budgets = await Budget.findAll({
      where: { 
        type: type,
        userId: userId
      },
      include: [{ model: Category, attributes: ['id', 'name', 'color'] }]
    });
    
    res.status(200).json(budgets);
  } catch (error) {
    console.error('Erro ao buscar orçamentos por tipo:', error);
    res.status(500).json({ message: error.message });
  }
};

// Obter resumo dos orçamentos
exports.getBudgetSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Obter todos os orçamentos do usuário
    const budgets = await Budget.findAll({
      where: { 
        userId: userId,
        type: ['expense', 'income']
      }
    });
    
    // Calcular totais
    let totalExpenseBudget = 0;
    let totalIncomeBudget = 0;
    let expenseCount = 0;
    let incomeCount = 0;
    
    budgets.forEach(budget => {
      if (budget.type === 'expense') {
        totalExpenseBudget += parseFloat(budget.amount || 0);
        expenseCount++;
      } else if (budget.type === 'income') {
        totalIncomeBudget += parseFloat(budget.amount || 0);
        incomeCount++;
      }
    });
    
    const summary = {
      totalExpenseBudget,
      totalIncomeBudget,
      balance: totalIncomeBudget - totalExpenseBudget,
      expenseCount,
      incomeCount,
      totalCount: expenseCount + incomeCount
    };
    
    res.status(200).json(summary);
  } catch (error) {
    console.error('Erro ao calcular resumo de orçamentos:', error);
    res.status(500).json({ message: error.message });
  }
};