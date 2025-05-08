import React from 'react';
import ActionDropdown from '../shared/ActionDropdown';

const BudgetCard = ({ budget, onEdit, onDelete }) => {
  // Verificar o tipo de orçamento
  const isExpense = budget.type === 'expense';
  const isIncome = budget.type === 'income';
  
  // Configurar as ações do dropdown
  const actions = [
    {
      label: 'Editar',
      onClick: () => onEdit(budget),
      icon: 'edit'
    },
    {
      label: 'Excluir',
      onClick: () => onDelete(budget.id),
      icon: 'trash-alt',
      color: 'text-red-600'
    }
  ];
  
  return (
    <div className={`budget-card bg-white border rounded-xl p-5 h-full transition-all duration-200 hover:shadow-md ${
      isIncome ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'
    }`}>
      {/* Cabeçalho com dropdown de ações */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <span 
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: budget.categoryColor }}
          ></span>
          <h4 className="font-semibold text-gray-800">{budget.categoryName}</h4>
        </div>
        <ActionDropdown actions={actions} />
      </div>
      
      {/* Tag de tipo */}
      <div className="mb-4">
        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-xl ${
          isIncome ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isIncome ? 'Receita' : 'Despesa'}
        </span>
      </div>
      
      {/* Descrição */}
      <p className="text-sm text-gray-500 mb-4">{budget.description || `Orçamento para ${budget.categoryName}`}</p>
      
      {/* Progresso */}
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Progresso</span>
          <span className="font-medium">{budget.percentage.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              isIncome 
                ? (budget.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500')
                : (budget.status === 'exceeded' ? 'bg-red-500' : budget.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500')
            }`} 
            style={{ width: `${Math.min(budget.percentage, 100)}%` }}
          ></div>
        </div>
      </div>
      
      {/* Detalhes do orçamento */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-600 text-sm">
          {isIncome ? "Previsto" : "Orçado"}
        </span>
        <span className="font-semibold">{budget.formattedBudget}</span>
      </div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-600 text-sm">
          {isIncome ? "Recebido" : "Gasto"}
        </span>
        <span className={`font-semibold ${
          isIncome 
            ? 'text-green-600'
            : (budget.status === 'exceeded' ? 'text-red-600' : 'text-gray-800')
        }`}>
          {budget.formattedActual}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-gray-600 text-sm">
          {isIncome ? "Diferença" : "Restante"}
        </span>
        <span className={`font-semibold ${
          isIncome
            ? (budget.status === 'warning' ? 'text-yellow-600' : 'text-green-600')
            : (budget.status === 'exceeded' ? 'text-red-600' : 'text-green-600')
        }`}>
          {isIncome 
            ? (budget.remaining >= 0 ? `+ ${budget.formattedRemaining}` : `- ${budget.formattedRemaining}`)
            : (budget.remaining >= 0 ? budget.formattedRemaining : `- ${budget.formattedRemaining}`)}
        </span>
      </div>
    </div>
  );
};

export default BudgetCard;