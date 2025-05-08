const User = require('../models/User');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

// Login de usuário
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Procurar o usuário pelo email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Verificar a senha
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Criar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email }, 
      process.env.JWT_SECRET || 'seu_segredo_temporario',
      { expiresIn: '7d' }
    );

    // Responder excluindo a senha
    const userWithoutPassword = { ...user.get() };
    delete userWithoutPassword.password;

    res.status(200).json({
      message: 'Login bem-sucedido',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno ao fazer login', error: error.message });
  }
};

// Registro de novo usuário
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Verificar se o email já está em uso
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email já está em uso' });
    }

    // Criar o usuário
    const user = await User.create({
      name,
      email,
      password
    });

    // Criar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email }, 
      process.env.JWT_SECRET || 'seu_segredo_temporario',
      { expiresIn: '7d' }
    );

    // Responder excluindo a senha
    const userWithoutPassword = { ...user.get() };
    delete userWithoutPassword.password;

    res.status(201).json({
      message: 'Usuário registrado com sucesso',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro interno ao registrar usuário', error: error.message });
  }
};

// Verificar token
exports.verify = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'seu_segredo_temporario');
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    res.status(403).json({ message: 'Token inválido ou expirado', error: error.message });
  }
};