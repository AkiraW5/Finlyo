const Account = require('../models/Account');

// Obter todas as contas do usuário autenticado
exports.getAccounts = async (req, res) => {
  try {
    const userId = req.user.id; // Obtido do token JWT
    const accounts = await Account.findAll({
      where: { userId },
      order: [['isDefault', 'DESC'], ['name', 'ASC']]
    });
    
    res.status(200).json(accounts);
  } catch (error) {
    console.error('Erro ao buscar contas:', error);
    res.status(500).json({ message: 'Erro ao buscar contas', error: error.message });
  }
};

// Obter uma conta específica
exports.getAccountById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const account = await Account.findOne({
      where: { id, userId }
    });
    
    if (!account) {
      return res.status(404).json({ message: 'Conta não encontrada' });
    }
    
    res.status(200).json(account);
  } catch (error) {
    console.error('Erro ao buscar conta:', error);
    res.status(500).json({ message: 'Erro ao buscar conta', error: error.message });
  }
};

// Criar uma nova conta
exports.createAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const accountData = { ...req.body, userId };
    
    // Se for cartão de crédito, garantir que o cardNumber seja processado corretamente
    if (accountData.type === 'credit') {
      // Remover espaços ou outros caracteres do número do cartão
      if (accountData.cardNumber) {
        accountData.cardNumber = accountData.cardNumber.replace(/\D/g, '');
      }
      
      // Verificar se a conta vinculada pertence ao mesmo usuário
      if (accountData.linkedAccountId) {
        const linkedAccount = await Account.findOne({
          where: { id: accountData.linkedAccountId, userId }
        });
        
        if (!linkedAccount) {
          return res.status(400).json({ 
            message: 'A conta vinculada não foi encontrada ou não pertence a você' 
          });
        }
      }
    } else {
      // Se não for cartão de crédito, limpar esses campos
      accountData.cardNumber = null;
      accountData.linkedAccountId = null;
      accountData.creditLimit = null;
    }
    
    // Se for marcada como padrão, desmarcar outras contas como padrão
    if (accountData.isDefault) {
      await Account.update({ isDefault: false }, { 
        where: { userId, isDefault: true } 
      });
    }
    
    const account = await Account.create(accountData);
    res.status(201).json(account);
  } catch (error) {
    console.error('Erro ao criar conta:', error);
    res.status(500).json({ message: 'Erro ao criar conta', error: error.message });
  }
};

// Atualizar uma conta existente
exports.updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const accountData = req.body;
    
    // Verificar se a conta existe e pertence ao usuário
    const account = await Account.findOne({
      where: { id, userId }
    });
    
    if (!account) {
      return res.status(404).json({ message: 'Conta não encontrada' });
    }
    
    // Se for cartão de crédito, processar os campos específicos
    if (accountData.type === 'credit') {
      // Remover espaços ou outros caracteres do número do cartão
      if (accountData.cardNumber) {
        accountData.cardNumber = accountData.cardNumber.replace(/\D/g, '');
      }
      
      // Verificar se a conta vinculada pertence ao mesmo usuário
      if (accountData.linkedAccountId) {
        const linkedAccount = await Account.findOne({
          where: { id: accountData.linkedAccountId, userId }
        });
        
        if (!linkedAccount) {
          return res.status(400).json({ 
            message: 'A conta vinculada não foi encontrada ou não pertence a você' 
          });
        }
      }
    } else {
      // Se não for cartão de crédito, limpar esses campos
      accountData.cardNumber = null;
      accountData.linkedAccountId = null;
      accountData.creditLimit = null;
    }
    
    // Se for marcada como padrão, desmarcar outras contas como padrão
    if (accountData.isDefault) {
      await Account.update({ isDefault: false }, { 
        where: { userId, isDefault: true, id: { [Op.ne]: id } } 
      });
    }
    
    await Account.update(accountData, {
      where: { id, userId }
    });
    
    // Buscar a conta atualizada
    const updatedAccount = await Account.findByPk(id);
    
    res.status(200).json(updatedAccount);
  } catch (error) {
    console.error('Erro ao atualizar conta:', error);
    res.status(500).json({ message: 'Erro ao atualizar conta', error: error.message });
  }
};

// Excluir uma conta
exports.deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Verificar se a conta existe e pertence ao usuário
    const account = await Account.findOne({
      where: { id, userId }
    });
    
    if (!account) {
      return res.status(404).json({ message: 'Conta não encontrada' });
    }
    
    // Excluir conta
    await Account.destroy({
      where: { id, userId }
    });
    
    res.status(200).json({ message: 'Conta excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir conta:', error);
    res.status(500).json({ message: 'Erro ao excluir conta', error: error.message });
  }
};