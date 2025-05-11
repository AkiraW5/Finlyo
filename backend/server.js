const app = require('./src/app');
const { sequelize } = require('./src/config/database');
const { initializeDatabase } = require('./src/config/dbInit');

const PORT = process.env.PORT || 5000;

// Iniciar o servidor após configurar o banco de dados
async function startServer() {
  try {
    // Inicializa o banco de dados (cria se não existir e configura tabelas)
    await initializeDatabase();
    
    // Verifica a conexão com o banco de dados
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida.');
    
    // Inicia o servidor
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (err) {
    console.error('Erro ao iniciar o servidor:', err);
    process.exit(1);
  }
}

startServer();