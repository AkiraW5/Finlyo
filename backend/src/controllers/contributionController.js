const Contribution = require('../models/Contribution');
const Budget = require('../models/Budget');
const Account = require('../models/Account');

// Obter todas as contribuições
exports.getAllContributions = async (req, res) => {
  try {
    const contributions = await Contribution.findAll();
    res.json(contributions);
  } catch (error) {
    console.error('Erro ao buscar contribuições:', error);
    res.status(500).json({ message: error.message });
  }
};

// Obter contribuições por orçamento
exports.getContributionsByBudget = async (req, res) => {
  try {
    const contributions = await Contribution.findAll({
      where: { budgetId: req.params.budgetId }
    });
    res.json(contributions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obter uma contribuição específica
exports.getContributionById = async (req, res) => {
  try {
    const contribution = await Contribution.findByPk(req.params.id, {
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
    const { amount, accountId, ...contributionData } = req.body;
    
    // Criar a contribuição
    const contribution = await Contribution.create({
      amount,
      accountId,
      ...contributionData
    });
    
    // Atualizar o saldo da conta (reduzir o valor)
    const account = await Account.findByPk(accountId);
    if (!account) {
      return res.status(404).json({ message: 'Conta não encontrada' });
    }
    
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
// Atualizar contribuição existente
exports.updateContribution = async (req, res) => {
  try {
    const contribution = await Contribution.findByPk(req.params.id);
    
    if (!contribution) {
      return res.status(404).json({ message: 'Contribuição não encontrada' });
    }
    
    await contribution.update(req.body);
    res.json(contribution);
  } catch (error) {
    console.error('Erro ao atualizar contribuição:', error);
    res.status(400).json({ message: error.message });
  }
};

// Excluir contribuição
exports.deleteContribution = async (req, res) => {
  try {
    const contribution = await Contribution.findByPk(req.params.id);
    
    if (!contribution) {
      return res.status(404).json({ message: 'Contribuição não encontrada' });
    }
    
    await contribution.destroy();
    res.json({ message: 'Contribuição excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir contribuição:', error);
    res.status(500).json({ message: error.message });
  }
};