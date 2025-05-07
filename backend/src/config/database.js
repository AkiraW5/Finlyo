// backend/src/config/database.js
const { Sequelize } = require('sequelize');
const env = require('./env');

const sequelize = new Sequelize(
  env.DB_NAME || 'controle_financeiro',
  env.DB_USER || 'root',
  env.DB_PASSWORD || '',
  {
    host: env.DB_HOST || 'localhost',
    dialect: 'mysql',
    port: env.DB_PORT || 3306,
    logging: env.NODE_ENV === 'development' ? console.log : false
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados MySQL estabelecida com sucesso.');
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };