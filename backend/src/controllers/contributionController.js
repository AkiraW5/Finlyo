const Contribution = require('../models/Contribution');
const Budget = require('../models/Budget');
const Account = require('../models/Account');

// Obter todas as contribuições do usuário atual
exports.getAllContributions = async (req, res) => {
  try {
    const userId = req.user.id;  // Obtém o ID do usuário a partir do token JWT
    
    const contributions = await Contribution.findAll({
      where: { userId: userId },
      include: [
        { model: Budget },
        { model: Account }
      ]
    });
    res.json(contributions);
  } catch (error) {
    console.error('Erro ao buscar contribuições:', error);
    res.status(500).json({ message: error.message });
  }
};

// Obter contribuições por orçamento (somente se pertencerem ao usuário atual)
exports.getContributionsByBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const budgetId = req.params.budgetId;
    
    // Primeiro verificar se o orçamento pertence ao usuário
    const budget = await Budget.findOne({
      where: { 
        id: budgetId,
        userId: userId
      }
    });
    
    if (!budget) {
      return res.status(404).json({ message: 'Meta não encontrada' });
    }
    
    const contributions = await Contribution.findAll({
      where: { 
        budgetId: budgetId,
        userId: userId
      }
    });
    res.json(contributions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obter uma contribuição específica (somente se pertencer ao usuário atual)
exports.getContributionById = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const contribution = await Contribution.findOne({
      where: {
        id: req.params.id,
        userId: userId
      },
      include: [
        { model: Budget },
        { model: Account }
      ]
    });
    
    if (!contribution) {
      return res.status(404).json({ message: 'Contribuição não encontrada' });
    }
    
    res.json(contribution);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Criar nova contribuição
exports.createContribution = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, accountId, budgetId, ...contributionData } = req.body;
    
    // Verificar se o orçamento pertence ao usuário
    const budget = await Budget.findOne({
      where: { 
        id: budgetId,
        userId: userId
      }
    });
    
    if (!budget) {
      return res.status(404).json({ message: 'Meta não encontrada' });
    }
    
    // Verificar se a conta pertence ao usuário
    const account = await Account.findOne({
      where: {
        id: accountId,
        userId: userId
      }
    });
    
    if (!account) {
      return res.status(404).json({ message: 'Conta não encontrada' });
    }
    
    // Criar a contribuição
    const contribution = await Contribution.create({
      amount,
      accountId,
      budgetId,
      userId,  // Salvar o userId
      ...contributionData
    });
    
    // Diminuir o valor da contribuição do saldo da conta
    const currentBalance = parseFloat(account.balance);
    const contributionAmount = parseFloat(amount);
    account.balance = currentBalance - contributionAmount;
    
    // Salvar a alteração na conta
    await account.save();
    
    res.status(201).json(contribution);
  } catch (error) {
    console.error('Erro ao criar contribuição:', error);
    res.status(400).json({ message: error.message });
  }
};

// Atualizar contribuição existente (somente se pertencer ao usuário atual)
exports.updateContribution = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const contribution = await Contribution.findOne({
      where: {
        id: req.params.id,
        userId: userId
      }
    });
    
    if (!contribution) {
      return res.status(404).json({ message: 'Contribuição não encontrada' });
    }
    
    // Não permitir alterar o userId
    delete req.body.userId;
    
    await contribution.update(req.body);
    res.json(contribution);
  } catch (error) {
    console.error('Erro ao atualizar contribuição:', error);
    res.status(400).json({ message: error.message });
  }
};

// Excluir contribuição (somente se pertencer ao usuário atual)
exports.deleteContribution = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const contribution = await Contribution.findOne({
      where: {
        id: req.params.id,
        userId: userId
      }
    });
    
    if (!contribution) {
      return res.status(404).json({ message: 'Contribuição não encontrada' });
    }
    
    // Devolver o valor da contribuição ao saldo da conta
    const account = await Account.findByPk(contribution.accountId);
    if (account && account.userId === userId) {
      account.balance = parseFloat(account.balance) + parseFloat(contribution.amount);
      await account.save();
    }
    
    await contribution.destroy();
    res.json({ message: 'Contribuição excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir contribuição:', error);
    res.status(500).json({ message: error.message });
  }
};