const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const User = require('../models/User');

// Obter configurações do usuário
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    res.status(200).json(user.settings || {});
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({ message: 'Erro ao buscar configurações', error: error.message });
  }
});

// Atualizar configurações do usuário
router.put('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const settingsData = req.body;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    user.settings = settingsData;
    await user.save();
    
    res.status(200).json({ message: 'Configurações atualizadas com sucesso', settings: user.settings });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({ message: 'Erro ao atualizar configurações', error: error.message });
  }
});

module.exports = router;