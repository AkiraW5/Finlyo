import React from 'react';

const BudgetList = ({ budgets, transactions, selectedMonth, contributions }) => {
  // Processar orçamentos antes de exibir
  const processedBudgets = budgets.map(budget => {
    // Garantir que o orçamento tenha uma categoria ou nome válido
    const budgetName = budget.category || budget.name || 'Sem categoria';
    
    // Buscar transações relacionadas a este orçamento
    const budgetTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      const isCurrentMonth = txDate.getMonth() === selectedMonth.getMonth() 
        && txDate.getFullYear() === selectedMonth.getFullYear();
      
      return isCurrentMonth && (
        tx.category === budget.category || 
        tx.categoryId === budget.categoryId
      );
    });
    
    // Calcular valor gasto neste orçamento
    const spent = budgetTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
    
    const budgetAmount = parseFloat(budget.amount || 0);
    const remaining = Math.max(0, budgetAmount - spent);
    const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
    
    return {
      ...budget,
      budgetName,
      spent,
      remaining,
      percentage,
      status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'ok'
    };
  });

  // Ordenar orçamentos por percentual de uso (decrescente)
  processedBudgets.sort((a, b) => b.percentage - a.percentage);
  
  const formatCurrency = (value) => {
    return `R$ ${parseFloat(value).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">Orçamentos</h3>
        <button className="text-primary hover:text-indigo-700 text-sm font-medium">
          Ver todos
        </button>
      </div>
      
      <div className="divide-y divide-gray-100">
        {processedBudgets.length > 0 ? (
          processedBudgets.map((budget, index) => (
            <div key={budget.id || index} className="px-6 py-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-gray-800">
                    {budget.budgetName || 'Orçamento sem nome'}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {budget.description || `Orçamento mensal para ${budget.budgetName || 'despesas'}`}
                  </p>
                </div>
                <span className={`font-medium ${
                  budget.status === 'exceeded' ? 'text-red-600' : 
                  budget.status === 'warning' ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    budget.status === 'exceeded' ? 'bg-red-500' : 
                    budget.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>{budget.percentage.toFixed(0)}% usado</span>
                <span>Restante: {formatCurrency(budget.remaining)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="px-6 py-8 text-center text-gray-500">
            <p>Nenhum orçamento encontrado.</p>
            <button className="text-primary hover:underline mt-2 inline-block">
              Criar um orçamento
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetList;