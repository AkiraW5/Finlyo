const jwt = require('jsonwebtoken');
const env = require('../config/env');

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
  }
  
  try {
    // Usar a chave JWT definida no env.js
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded; // Inclui os dados do usuário na requisição
    next();
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return res.status(403).json({ message: 'Token inválido ou expirado.' });
  }
};