const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
const env = require('./env');
const { sequelize } = require('./database');
const { fixForeignKeyIssue } = require('./fixDatabase');

// Importar todos os modelos para registrá-los no Sequelize
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const Account = require('../models/Account');
const Contribution = require('../models/Contribution');

// Função para criar o banco de dados se não existir
async function createDatabaseIfNotExists() {
  console.log('Verificando se o banco de dados existe...');
  
  const connection = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD
  });
  
  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${env.DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`Banco de dados '${env.DB_NAME}' verificado/criado com sucesso.`);
  } catch (error) {
    console.error('Erro ao criar o banco de dados:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Função para criar um usuário admin padrão se não existir
async function createDefaultAdminIfNotExists() {
  try {
    const adminCount = await User.count({ where: { role: 'admin' } });
    
    if (adminCount === 0) {
      console.log('Criando usuário administrador padrão...');
      await User.create({
        name: 'Administrador',
        email: 'admin@example.com',
        password: 'admin123', // Será criptografado pelo hook beforeCreate
        role: 'admin'
      });
      console.log('Usuário administrador padrão criado com sucesso.');
    } else {
      console.log('Usuário administrador já existe, pulando criação.');
    }
  } catch (error) {
    console.error('Erro ao criar usuário admin padrão:', error);
  }
}

// NOVA FUNÇÃO: Adicionar coluna userId em todas as tabelas relevantes
async function addUserIdToAllTables() {
  try {
    console.log('Verificando e adicionando coluna userId em todas as tabelas...');
    
    // Obter o admin para associar registros existentes
    const admin = await User.findOne({ where: { role: 'admin' } });
    
    if (!admin) {
      console.log('Usuário admin não encontrado. Execute createDefaultAdminIfNotExists primeiro.');
      return;
    }
    
    const adminId = admin.id;
    console.log(`ID do usuário admin: ${adminId}`);
    
    // Lista de tabelas que precisam de userId (exceto users)
    const tables = [
      { name: 'transactions', model: 'Transaction' },
      { name: 'categories', model: 'Category' },
      { name: 'budgets', model: 'Budget' },
      { name: 'accounts', model: 'Account' },
      { name: 'contributions', model: 'Contribution' }
    ];
    
    // Verificar cada tabela e adicionar userId se necessário
    for (const table of tables) {
      try {
        console.log(`Verificando tabela ${table.name}...`);
        
        // Verificar se a tabela existe
        const [tableExists] = await sequelize.query(`
          SELECT COUNT(*) as count 
          FROM information_schema.tables 
          WHERE table_schema = '${env.DB_NAME}' 
          AND table_name = '${table.name}'
        `);
        
        if (tableExists[0].count === 0) {
          console.log(`Tabela ${table.name} não existe ainda, será criada na sincronização.`);
          continue;
        }
        
        // Verificar se a coluna userId já existe na tabela
        const [columns] = await sequelize.query(`SHOW COLUMNS FROM ${table.name} LIKE 'userId'`);
        
        if (columns.length === 0) {
          console.log(`Adicionando coluna userId na tabela ${table.name}...`);
          
          // Adicionar coluna userId
          await sequelize.query(`
            ALTER TABLE ${table.name} 
            ADD COLUMN userId INT,
            ADD CONSTRAINT fk_${table.name}_user 
            FOREIGN KEY (userId) REFERENCES users(id)
          `);
          
          // Atualizar registros existentes para associar ao admin
          const [updateResult] = await sequelize.query(`
            UPDATE ${table.name} SET userId = ${adminId} 
            WHERE userId IS NULL
          `);
          
          console.log(`Coluna userId adicionada na tabela ${table.name}. ${updateResult.affectedRows || 0} registros atualizados.`);
          
          // Tornar userId NOT NULL após a atualização
          await sequelize.query(`
            ALTER TABLE ${table.name} 
            MODIFY userId INT NOT NULL
          `);
          
          console.log(`Coluna userId configurada como NOT NULL na tabela ${table.name}.`);
        } else {
          console.log(`Coluna userId já existe na tabela ${table.name}.`);
          
          // Verificar e atualizar registros sem userId
          const [updateResult] = await sequelize.query(`
            UPDATE ${table.name} SET userId = ${adminId} 
            WHERE userId IS NULL
          `);
          
          if (updateResult.affectedRows && updateResult.affectedRows > 0) {
            console.log(`${updateResult.affectedRows} registros atualizados na tabela ${table.name}.`);
          }
        }
      } catch (error) {
        console.error(`Erro ao processar tabela ${table.name}:`, error);
      }
    }
    
    console.log('Verificação e adição de userId concluída em todas as tabelas.');
  } catch (error) {
    console.error('Erro ao adicionar userId às tabelas:', error);
  }
}

// Função para criar categorias padrão se não existirem
async function createDefaultCategoriesIfNotExist() {
  try {
    const categoryCount = await Category.count();
    
    if (categoryCount === 0) {
      console.log('Criando categorias padrão...');
      
      const admin = await User.findOne({ where: { role: 'admin' } });
      
      if (!admin) {
        console.log('Usuário admin não encontrado, pulando criação de categorias padrão');
        return;
      }
      
      const defaultCategories = [
        { name: 'Alimentação', type: 'expense', icon: 'utensils', color: '#FF6B6B', userId: admin.id },
        { name: 'Moradia', type: 'expense', icon: 'home', color: '#4ECDC4', userId: admin.id },
        { name: 'Transporte', type: 'expense', icon: 'car', color: '#1A535C', userId: admin.id },
        { name: 'Saúde', type: 'expense', icon: 'heartbeat', color: '#FF6B6B', userId: admin.id },
        { name: 'Educação', type: 'expense', icon: 'graduation-cap', color: '#FFE66D', userId: admin.id },
        { name: 'Lazer', type: 'expense', icon: 'smile', color: '#6B48FF', userId: admin.id },
        { name: 'Salário', type: 'income', icon: 'money-bill-wave', color: '#4ECDC4', userId: admin.id },
        { name: 'Investimentos', type: 'income', icon: 'chart-line', color: '#1A535C', userId: admin.id },
        { name: 'Outros', type: 'expense', icon: 'receipt', color: '#7B8788', userId: admin.id },
        { name: 'Outras Receitas', type: 'income', icon: 'wallet', color: '#7B8788', userId: admin.id }
      ];
      
      await Category.bulkCreate(defaultCategories);
      console.log('Categorias padrão criadas com sucesso.');
    } else {
      console.log('Categorias já existem, pulando criação.');
    }
  } catch (error) {
    console.error('Erro ao criar categorias padrão:', error);
  }
}

// Função para criar contas padrão para o usuário admin
async function createDefaultAccountsForAdmin() {
  try {
    const admin = await User.findOne({ where: { role: 'admin' } });
    
    if (!admin) {
      console.log('Usuário admin não encontrado, pulando criação de contas padrão');
      return;
    }
    
    const accountCount = await Account.count({ where: { userId: admin.id } });
    
    if (accountCount === 0) {
      console.log('Criando contas padrão para o usuário admin...');
      
      const defaultAccounts = [
        { 
          userId: admin.id, 
          name: 'Conta Corrente', 
          type: 'checking', 
          balance: 1000.00, 
          bankName: 'Banco Demo', 
          accountNumber: '12345678', 
          isDefault: true,
          color: '#3B82F6'
        },
        { 
          userId: admin.id, 
          name: 'Poupança', 
          type: 'savings', 
          balance: 5000.00, 
          bankName: 'Banco Demo', 
          accountNumber: '87654321',
          color: '#10B981'
        },
        { 
          userId: admin.id, 
          name: 'Cartão de Crédito', 
          type: 'credit', 
          balance: 0.00, 
          bankName: 'Banco Demo', 
          accountNumber: '5555666677778888',
          color: '#F59E0B'
        },
        { 
          userId: admin.id, 
          name: 'Carteira', 
          type: 'wallet', 
          balance: 200.00,
          color: '#8B5CF6'
        }
      ];
      
      await Account.bulkCreate(defaultAccounts);
      console.log('Contas padrão criadas com sucesso para o admin.');
    } else {
      console.log('Admin já possui contas, pulando criação de contas padrão.');
    }
  } catch (error) {
    console.error('Erro ao criar contas padrão para o admin:', error);
  }
}

// Função para sincronizar modelos de forma segura
async function safeSyncModels() {
  try {
    console.log('Sincronizando modelos com o banco de dados de forma segura...');
    
    // Tenta sincronizar sem alterar tabelas existentes
    await sequelize.sync();
    console.log('Sincronização básica concluída com sucesso.');
    
  } catch (error) {
    console.error('Erro na sincronização básica:', error);
    console.log('Tentando corrigir problemas de chave estrangeira...');
    
    // Se falhar, tenta corrigir problemas de chave estrangeira
    await fixForeignKeyIssue();
    
    // Tenta novamente a sincronização
    console.log('Tentando sincronização novamente após correção...');
    await sequelize.sync();
    console.log('Sincronização concluída com sucesso após correção.');
  }
}

// Função principal de inicialização do banco de dados
async function initializeDatabase() {
  try {
    // Passo 1: Criar o banco de dados se não existir
    await createDatabaseIfNotExists();
    
    // Passo 2: Sincronizar os modelos com o banco de dados de forma segura
    await safeSyncModels();
    
    // Passo 3: Criar dados padrão se necessário
    await createDefaultAdminIfNotExists();
    
    // Passo 4: NOVO - Adicionar userId em todas as tabelas relevantes
    await addUserIdToAllTables();
    
    // Passo 5: Criar dados padrão adicionais
    await createDefaultCategoriesIfNotExist();
    await createDefaultAccountsForAdmin();
    
    console.log('Inicialização do banco de dados concluída com sucesso!');
  } catch (error) {
    console.error('Erro na inicialização do banco de dados:', error);
    process.exit(1);
  }
}

module.exports = { initializeDatabase };