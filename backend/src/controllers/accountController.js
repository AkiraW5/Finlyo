const Account = require('../models/Account');

// Obter todas as contas (apenas do usuário autenticado)
exports.getAccounts = async (req, res) => {
  try {
    const userId = req.user.id; // Obtém o ID do usuário do token JWT
    
    const accounts = await Account.findAll({
      where: { userId }, // Filtra apenas as contas do usuário atual
      order: [['name', 'ASC']]
    });
    
    res.status(200).json(accounts);
  } catch (error) {
    console.error('Error getting accounts:', error);
    res.status(500).json({ message: 'Erro ao buscar contas' });
  }
};

// Criar nova conta (vinculada ao usuário)
exports.createAccount = async (req, res) => {
  try {
    const userId = req.user.id; // Obtém o ID do usuário do token JWT
    
    // Adiciona o userId aos dados da conta
    const accountData = {
      ...req.body,
      userId
    };
    
    const account = await Account.create(accountData);
    res.status(201).json(account);
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(400).json({ message: 'Erro ao criar conta' });
  }
};

// Atualizar conta (verificando propriedade)
exports.updateAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Primeiro verificamos se a conta pertence ao usuário
    const account = await Account.findOne({
      where: { 
        id: req.params.id,
        userId
      }
    });
    
    if (!account) {
      return res.status(404).json({ message: 'Conta não encontrada' });
    }
    
    // Fazemos o update garantindo que o userId não seja alterado
    const [updated] = await Account.update(req.body, {
      where: { 
        id: req.params.id,
        userId
      }
    });
    
    const updatedAccount = await Account.findByPk(req.params.id);
    res.status(200).json(updatedAccount);
  } catch (error) {
    console.error('Error updating account:', error);
    res.status(400).json({ message: 'Erro ao atualizar conta' });
  }
};

// Excluir conta (verificando propriedade)
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const deleted = await Account.destroy({
      where: { 
        id: req.params.id,
        userId 
      }
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

// Buscar conta por ID (verificando propriedade)
exports.getAccountById = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const account = await Account.findOne({
      where: {
        id: req.params.id,
        userId
      }
    });
    
    if (!account) {
      return res.status(404).json({ message: 'Conta não encontrada' });
    }
    
    res.status(200).json(account);
  } catch (error) {
    console.error('Error getting account:', error);
    res.status(500).json({ message: 'Erro ao buscar conta' });
  }
};