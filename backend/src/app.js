const express = require('express');
const cors = require('cors');
const { sequelize } = require('./config/database');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importando rotas
const transactionRoutes = require('./routes/transactionRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const goalRoutes = require('./routes/goalRoutes');
const accountRoutes = require('./routes/accountRoutes');
const contributionRoutes = require('./routes/ContributionsRoutes');
const authRoutes = require('./routes/authRoutes'); // Adicionar importação das rotas de autenticação
const settingsRoutes = require('./routes/settingsRoutes'); // Adicionar importação das rotas de configurações

// Sync sequelize models with database
(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Banco de dados sincronizado com sucesso');
  } catch (error) {
    console.error('Erro ao sincronizar o banco de dados:', error);
  }
})();

// Rotas de autenticação (adicionar antes das outras rotas)
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);

// Outras rotas
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/contributions', contributionRoutes);

// Rota básica para teste
app.get('/', (req, res) => {
    res.send('API do Controle Financeiro está funcionando!');
});

// Middleware de tratamento de erro
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || 'Erro no servidor',
    error: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
});

module.exports = app;