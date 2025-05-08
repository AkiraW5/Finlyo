const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'value' // Mapeia para o campo 'value' no banco de dados
  },
  type: {
    type: DataTypes.ENUM('income', 'expense'),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  account: {
    type: DataTypes.STRING,
    allowNull: false
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  accountId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'accounts',
      key: 'id'
    }
  },
  notes: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  // Adicionar campo userId para vincular ao usuário
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'transactions',
  timestamps: true
});

module.exports = Transaction;