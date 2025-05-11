import React from 'react';

const BudgetCard = ({ budget, onEdit, onDelete, showBalance }) => {
  // Renderização condicional para valores monetários
  const renderValue = (value) => {
    if (!showBalance) {
      return <span className="text-gray-400 dark:text-gray-500">•••••</span>;
    }
    return value;
  };

  return (
    <div className={`bg-white dark:bg-dark-200 border rounded-xl shadow-sm overflow-hidden transition-theme ${
      budget.type === 'expense' ? 
        (budget.status === 'exceeded' ? 'border-red-300 dark:border-red-700' : 
         budget.status === 'warning' ? 'border-yellow-300 dark:border-yellow-700' : 
         'border-gray-200 dark:border-dark-300') : 
        (budget.status === 'under' ? 'border-yellow-300 dark:border-yellow-700' : 
         'border-gray-200 dark:border-dark-300')
    }`}>
      {/* Cabeçalho */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-dark-300 border-b border-gray-200 dark:border-dark-400 flex justify-between items-center">
        <div className="flex items-center">
          <span 
            className="w-3 h-3 rounded-full mr-2" 
            style={{ backgroundColor: budget.categoryColor }}
          ></span>
          <h3 className="font-semibold text-gray-800 dark:text-white">{budget.categoryName}</h3>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${
          budget.type === 'expense' ? 
            'bg-red-100 text-red-700 dark:bg-red-900 dark:bg-opacity-50 dark:text-red-400' : 
            'bg-green-100 text-green-700 dark:bg-green-900 dark:bg-opacity-50 dark:text-green-400'
        }`}>
          {budget.type === 'expense' ? 'Despesa' : 'Receita'}
        </span>
      </div>

      {/* Descrição */}
      <div className="px-4 pt-3 pb-2 text-sm text-gray-600 dark:text-gray-300">
        <p>{budget.description || `Orçamento para ${budget.categoryName}`}</p>
      </div>

      {/* Barra de Progresso */}
      <div className="px-4 pt-1 pb-3">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>Progresso</span>
          <span>{budget.percentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-dark-300 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              budget.type === 'expense' ?
                (budget.status === 'exceeded' ? 'bg-red-500 dark:bg-red-600' : 
                 budget.status === 'warning' ? 'bg-yellow-500 dark:bg-yellow-600' : 
                 'bg-green-500 dark:bg-green-600') :
                (budget.status === 'under' ? 'bg-yellow-500 dark:bg-yellow-600' : 
                 'bg-green-500 dark:bg-green-600')
            }`}
            style={{ width: `${Math.min(budget.percentage, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Valores */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-dark-400">
        <div className="grid grid-cols-3 gap-2">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Orçado</p>
            <p className="font-semibold text-gray-800 dark:text-white">
              {renderValue(budget.formattedBudget)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {budget.type === 'expense' ? 'Gasto' : 'Recebido'}
            </p>
            <p className={`font-semibold ${
              budget.type === 'expense' ?
                (budget.status === 'exceeded' ? 'text-red-600 dark:text-red-400' : 
                 'text-gray-800 dark:text-white') :
                (budget.status === 'under' ? 'text-yellow-600 dark:text-yellow-400' : 
                 'text-green-600 dark:text-green-400')
            }`}>
              {renderValue(budget.formattedActual)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Restante</p>
            <p className={`font-semibold ${
              budget.type === 'expense' ?
                (budget.status === 'exceeded' ? 'text-red-600 dark:text-red-400' : 
                 'text-green-600 dark:text-green-400') :
                (budget.status === 'under' ? 'text-yellow-600 dark:text-yellow-400' : 
                 'text-green-600 dark:text-green-400')
            }`}>
              {renderValue(budget.formattedRemaining)}
            </p>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="flex border-t border-gray-200 dark:border-dark-400">
        <button 
          onClick={onEdit}
          className="flex-1 px-4 py-2 text-sm text-center text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors"
        >
          <i className="fas fa-edit mr-2"></i>Editar
        </button>
        <div className="border-r border-gray-200 dark:border-dark-400"></div>
        <button 
          onClick={onDelete}
          className="flex-1 px-4 py-2 text-sm text-center text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors"
        >
          <i className="fas fa-trash-alt mr-2"></i>Excluir
        </button>
      </div>
    </div>
  );
};

export default BudgetCard;