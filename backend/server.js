const app = require('./src/app');
const { sequelize } = require('./src/config/database');

const PORT = process.env.PORT || 5000;

// Iniciar o servidor após conectar ao banco de dados
sequelize.authenticate()
  .then(() => {
    console.log('Conexão com o banco de dados estabelecida.');
    
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Erro ao conectar ao banco de dados:', err);
    process.exit(1);
  });