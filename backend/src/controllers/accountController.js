const Account = require('../models/Account');

// Obter todas as contas
exports.getAccounts = async (req, res) => {
  try {
    const accounts = await Account.findAll({
      order: [['name', 'ASC']]
    });
    
    res.status(200).json(accounts);
  } catch (error) {
    console.error('Error getting accounts:', error);
    res.status(500).json({ message: 'Erro ao buscar contas' });
  }
};

// Criar nova conta
exports.createAccount = async (req, res) => {
  try {
    const account = await Account.create(req.body);
    res.status(201).json(account);
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(400).json({ message: 'Erro ao criar conta' });
  }
};

// Atualizar conta
exports.updateAccount = async (req, res) => {
  try {
    const [updated] = await Account.update(req.body, {
      where: { id: req.params.id }
    });
    
    if (updated === 0) {
      return res.status(404).json({ message: 'Conta não encontrada' });
    }
    
    const updatedAccount = await Account.findByPk(req.params.id);
    res.status(200).json(updatedAccount);
  } catch (error) {
    console.error('Error updating account:', error);
    res.status(400).json({ message: 'Erro ao atualizar conta' });
  }
};

// Excluir conta
exports.deleteAccount = async (req, res) => {
  try {
    const deleted = await Account.destroy({
      where: { id: req.params.id }
    });
    
    if (deleted === 0) {
      return res.status(404).json({ message: 'Conta não encontrada' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Erro ao excluir conta' });
  }
};

// Buscar conta por ID
exports.getAccountById = async (req, res) => {
  try {
    const account = await Account.findByPk(req.params.id);
    
    if (!account) {
      return res.status(404).json({ message: 'Conta não encontrada' });
    }
    
    res.status(200).json(account);
  } catch (error) {
    console.error('Error getting account:', error);
    res.status(500).json({ message: 'Erro ao buscar conta' });
  }
};