// backend/src/models/Budget.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Goal = sequelize.define('Goal', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  period: {
    type: DataTypes.STRING,
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  endDate: {
    type: DataTypes.DATE
  },
  notes: {
    type: DataTypes.TEXT,
    defaultValue: ''
  }
}, {
  tableName: 'goals',
  timestamps: true
});

module.exports = Goal;