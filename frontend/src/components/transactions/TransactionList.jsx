import React from 'react';

const TransactionList = ({ transactions, onAddClick, accounts, categories }) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-800">Transações Recentes</h3>
          <button 
            onClick={onAddClick}
            className="bg-primary hover:bg-indigo-700 text-white px-3 py-1 rounded-lg text-sm flex items-center"
          >
            <i className="fas fa-plus mr-1"></i>
            <span>Nova</span>
          </button>
        </div>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="text-gray-400 mb-2">
            <i className="fas fa-receipt text-4xl"></i>
          </div>
          <p className="text-gray-500">Nenhuma transação recente encontrada</p>
          <button 
            onClick={onAddClick}
            className="mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm"
          >
            Adicionar primeira transação
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">Transações Recentes</h3>
        <button 
          onClick={onAddClick}
          className="bg-primary hover:bg-indigo-700 text-white px-3 py-1 rounded-lg text-sm flex items-center"
        >
          <i className="fas fa-plus mr-1"></i>
          <span>Nova</span>
        </button>
      </div>
      <div className="divide-y divide-gray-100">
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
                      transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                    }`}
                  >
                    {transaction.isContribution ? (
                      <i className={`fas fa-piggy-bank text-violet-600`}></i>
                    ) : (
                      <i className={`fas ${transaction.type === 'income' ? 'fa-arrow-down text-green-600' : 'fa-arrow-up text-red-600'}`}></i>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{transaction.description}</div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center">
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
                <div className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'income' ? '+' : '-'} {transaction.formattedAmount || `R$ ${parseFloat(transaction.amount).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 text-center">
        <button className="text-primary hover:text-indigo-700 text-sm font-medium">
          Ver todas as transações
        </button>
      </div>
    </div>
  );
};

export default TransactionList;