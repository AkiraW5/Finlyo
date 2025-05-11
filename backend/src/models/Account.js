const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Account = sequelize.define('Account', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('checking', 'savings', 'credit', 'investment', 'wallet', 'other'),
    allowNull: false
  },
  balance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  bankName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  accountNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#3B82F6'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Novos campos para cartão de crédito
  creditLimit: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    defaultValue: 0
  },
  cardNumber: {
    type: DataTypes.STRING(16),
    allowNull: true
  },
  linkedAccountId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'accounts',
      key: 'id'
    }
  }
}, {
  tableName: 'accounts',
  timestamps: true
});

// Definir relacionamento com User
Account.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Account, { foreignKey: 'userId' });

// Relacionamento auto-referencial para vincular cartões de crédito a contas bancárias
Account.belongsTo(Account, { as: 'linkedAccount', foreignKey: 'linkedAccountId' });
Account.hasMany(Account, { as: 'linkedCards', foreignKey: 'linkedAccountId' });

module.exports = Account;