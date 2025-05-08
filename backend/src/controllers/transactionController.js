// backend/src/controllers/transactionController.js
const Transaction = require('../models/Transaction');

// Create a new transaction
exports.createTransaction = async (req, res) => {
  try {
    // Obter o ID do usuário do token JWT
    const userId = req.user.id;
    
    // Incluir o userId nos dados da transação
    const transactionData = {
      ...req.body,
      userId
    };

    // Validação adicional se necessário
    if (!transactionData.amount) {
      return res.status(400).json({ message: 'O valor da transação é obrigatório' });
    }

    const transaction = await Transaction.create(transactionData);
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get all transactions (apenas do usuário atual)
exports.getTransactions = async (req, res) => {
  try {
    // Filtrar apenas as transações do usuário atual
    const userId = req.user.id;
    
    const transactions = await Transaction.findAll({
      where: { userId },
      order: [['date', 'DESC']] // Ordenar por data (mais recente primeiro)
    });
    
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get a transaction by ID (verificando propriedade)
exports.getTransactionById = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const transaction = await Transaction.findOne({
      where: { 
        id: req.params.id,
        userId
      }
    });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transação não encontrada' });
    }
    
    res.status(200).json(transaction);
  } catch (error) {
    console.error('Erro ao buscar transação:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update a transaction (verificando propriedade)
exports.updateTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Verificar se a transação pertence ao usuário atual
    const transaction = await Transaction.findOne({
      where: { 
        id: req.params.id,
        userId
      }
    });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transação não encontrada' });
    }
    
    // Não permitir a alteração do userId
    const updateData = { ...req.body };
    delete updateData.userId;
    
    await transaction.update(updateData);
    
    res.status(200).json(transaction);
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    res.status(400).json({ message: error.message });
  }
};

// Delete a transaction (verificando propriedade)
exports.deleteTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const deleted = await Transaction.destroy({
      where: { 
        id: req.params.id,
        userId
      }
    });
    
    if (deleted === 0) {
      return res.status(404).json({ message: 'Transação não encontrada' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir transação:', error);
    res.status(500).json({ message: error.message });
  }
};