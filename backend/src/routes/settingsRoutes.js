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
    
    // Combinando configurações padrão com as do usuário
    const defaultSettings = {
      // Perfil
      name: user.name || '',
      email: user.email || '',
      
      // Preferências
      currency: 'BRL',
      dateFormat: 'DD/MM/YYYY',
      theme: 'light',
      language: 'pt-BR',
      
      // Notificações
      emailNotifications: true,
      budgetAlerts: true,
      weeklyReport: true,
      
      // Exportação
      exportFormat: 'csv',
      
      // Privacidade
      showBalance: true,
      hideAmounts: false
    };
    
    // Mesclar configurações padrão com as do usuário
    const userSettings = { 
      ...defaultSettings,
      ...user.settings
    };
    
    // Garantir que nome e email sempre venham do banco de dados
    userSettings.name = user.name;
    userSettings.email = user.email;
    
    res.status(200).json(userSettings);
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
    
    // Remover nome e email das configurações, pois eles têm campos próprios
    const { name, email, ...settings } = settingsData;
    
    // Se nome ou email foram fornecidos, atualizar esses campos específicos
    if (name !== undefined) {
      user.name = name;
    }
    
    if (email !== undefined && email !== user.email) {
      // Verificar se o email já existe
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ message: 'Este email já está em uso' });
      }
      user.email = email;
    }
    
    // Atualizar configurações
    user.settings = settings;
    await user.save();
    
    res.status(200).json({ 
      message: 'Configurações atualizadas com sucesso', 
      settings: { ...settings, name: user.name, email: user.email } 
    });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({ message: 'Erro ao atualizar configurações', error: error.message });
  }
});

module.exports = router;