const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Budget = require('./Budget');
const Account = require('./Account');

const Contribution = sequelize.define('Contribution', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  budgetId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'budgets',
      key: 'id'
    }
  },
  accountId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'accounts',
      key: 'id'
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  method: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'deposit'
  }
}, {
  tableName: 'contributions',
  timestamps: true
});

// Definir associações diretamente
Contribution.belongsTo(Budget, { foreignKey: 'budgetId' });
Contribution.belongsTo(Account, { foreignKey: 'accountId' });

module.exports = Contribution;