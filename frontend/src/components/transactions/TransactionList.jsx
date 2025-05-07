import React from 'react';
import TransactionItem from './TransactionItem';

const transactionData = [
  {
    id: 1,
    type: 'expense',
    description: 'Compras Supermercado',
    amount: 248.90,
    category: 'Alimentação',
    date: '15/06',
    place: 'Mercado Central',
    icon: 'fa-shopping-bag',
    iconBg: 'bg-red-100',
    categoryBg: 'bg-red-50 text-red-600'
  },
  {
    id: 2,
    type: 'income',
    description: 'Salário',
    amount: 5200.00,
    category: 'Rendimento',
    date: '05/06',
    place: 'Empresa XYZ',
    icon: 'fa-money-bill-wave',
    iconBg: 'bg-green-100',
    categoryBg: 'bg-green-50 text-green-600'
  },
  {
    id: 3,
    type: 'expense',
    description: 'Aluguel',
    amount: 1800.00,
    category: 'Moradia',
    date: '01/06',
    place: 'Apartamento',
    icon: 'fa-home',
    iconBg: 'bg-blue-100',
    categoryBg: 'bg-blue-50 text-blue-600'
  },
  {
    id: 4,
    type: 'expense',
    description: 'Combustível',
    amount: 180.00,
    category: 'Transporte',
    date: '30/05',
    place: 'Posto Shell',
    icon: 'fa-car',
    iconBg: 'bg-purple-100',
    categoryBg: 'bg-purple-50 text-purple-600'
  },
  {
    id: 5,
    type: 'expense',
    description: 'Jantar',
    amount: 120.50,
    category: 'Lazer',
    date: '28/05',
    place: 'Restaurante',
    icon: 'fa-utensils',
    iconBg: 'bg-yellow-100',
    categoryBg: 'bg-yellow-50 text-yellow-600'
  }
];

const TransactionList = ({ onAddClick }) => {
  return (
    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">Transações Recentes</h3>
        <button 
          onClick={onAddClick}
          className="bg-primary hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center text-sm"
        >
          <i className="fas fa-plus mr-2"></i>
          <span>Adicionar</span>
        </button>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
        {transactionData.map(transaction => (
          <TransactionItem key={transaction.id} transaction={transaction} />
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <button className="text-primary font-medium text-sm hover:underline">Ver todas as transações</button>
      </div>
    </div>
  );
};

export default TransactionList;