const mysql = require('mysql2/promise');
const env = require('./env');

async function fixForeignKeyIssue() {
  console.log('Iniciando correção do banco de dados...');
  
  const connection = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME
  });
  
  try {
    // Desativar verificação de chaves estrangeiras temporariamente
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
    console.log('Verificação de chaves estrangeiras desativada temporariamente');
    
    // Verificar se a chave estrangeira existe
    const [keyExists] = await connection.query(`
      SELECT * FROM information_schema.TABLE_CONSTRAINTS 
      WHERE CONSTRAINT_SCHEMA = '${env.DB_NAME}' 
      AND CONSTRAINT_NAME = 'categories_ibfk_1' 
      AND TABLE_NAME = 'categories'
    `);
    
    // Se a chave existe, removê-la
    if (keyExists && keyExists.length > 0) {
      await connection.query('ALTER TABLE `categories` DROP FOREIGN KEY `categories_ibfk_1`;');
      console.log('Chave estrangeira categories_ibfk_1 removida com sucesso');
    } else {
      console.log('A chave estrangeira categories_ibfk_1 não existe, pulando remoção');
    }
    
    // Reativar verificação de chaves estrangeiras
    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('Verificação de chaves estrangeiras reativada');
    
    console.log('Correção do banco de dados concluída com sucesso');
  } catch (error) {
    console.error('Erro durante a correção do banco de dados:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

module.exports = { fixForeignKeyIssue };

// Executar a correção se este arquivo for executado diretamente
if (require.main === module) {
  fixForeignKeyIssue()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Falha na correção:', error);
      process.exit(1);
    });
}