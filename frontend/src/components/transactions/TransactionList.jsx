import React from 'react';
import { useNavigate } from 'react-router-dom';

const TransactionList = ({ transactions = [], onAddClick, showBalance, accounts = [], categories = [] }) => {
  const navigate = useNavigate();
  
  const handleViewAllClick = () => {
    navigate('/transactions');
  };
  
  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-300 p-6 h-full flex flex-col items-center justify-center transition-theme">
        <div className="mb-3 p-4 rounded-full bg-gray-50 dark:bg-dark-300 text-gray-400 dark:text-gray-500">
          <i className="fas fa-receipt text-4xl"></i>
        </div>
        <p className="text-gray-500 dark:text-gray-400">Nenhuma transação recente encontrada</p>
        <button 
          onClick={onAddClick}
          className="mt-3 bg-gray-100 dark:bg-dark-300 hover:bg-gray-200 dark:hover:bg-dark-400 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Adicionar primeira transação
        </button>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-300 p-4 transition-theme">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800 dark:text-white">Transações Recentes</h3>
        <button 
          onClick={onAddClick}
          className="bg-primary hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white px-3 py-1 rounded-lg text-sm flex items-center transition-colors"
        >
          <i className="fas fa-plus mr-1"></i>
          <span>Nova</span>
        </button>
      </div>
      
      <div className="divide-y divide-gray-100 dark:divide-dark-300">
        {transactions.map((transaction) => {
          const accountName = transaction.accountName || 
            accounts.find(acc => acc.id === transaction.accountId)?.name || 
            'Conta não especificada';
          
          const categoryName = transaction.categoryName ||
            categories.find(cat => cat.id === transaction.categoryId || cat.name === transaction.category)?.name || 
            transaction.category || 
            'Sem categoria';
          
          const categoryColor = transaction.categoryColor ||
            categories.find(cat => cat.id === transaction.categoryId || cat.name === transaction.category)?.color || 
            '#94a3b8';
          
          return (
            <div key={transaction.id} className="py-3 px-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                      transaction.type === 'income' ? 'bg-green-100 dark:bg-green-900 dark:bg-opacity-20' : 'bg-red-100 dark:bg-red-900 dark:bg-opacity-20'
                    }`}
                  >
                    {transaction.isContribution ? (
                      <i className={`fas fa-piggy-bank text-violet-600 dark:text-violet-400`}></i>
                    ) : (
                      <i className={`fas ${transaction.type === 'income' ? 'fa-arrow-down text-green-600 dark:text-green-400' : 'fa-arrow-up text-red-600 dark:text-red-400'}`}></i>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{transaction.description}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                      <span>{transaction.formattedDate || new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                      <span className="mx-1">•</span>
                      <span>{accountName}</span>
                      <span className="mx-1">•</span>
                      <span 
                        className="flex items-center" 
                        style={{ color: categoryColor }}
                      >
                        <span 
                          className="w-2 h-2 rounded-full mr-1"
                          style={{ backgroundColor: categoryColor }}
                        ></span>
                        {categoryName}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={`font-medium ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {transaction.type === 'income' ? '+' : '-'} {
                    showBalance ? 
                      (transaction.formattedAmount || `R$ ${parseFloat(transaction.amount).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`) : 
                      <span className="text-gray-400 dark:text-gray-500">•••••</span>
                  }
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 text-center">
        <button 
          onClick={handleViewAllClick}
          className="text-primary hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium transition-colors"
        >
          Ver todas as transações
        </button>
      </div>
    </div>
  );
};

export default TransactionList;