import React from 'react';
import { Link } from 'react-router-dom';

const BudgetList = ({ budgets, transactions, selectedMonth, contributions, formatCurrency, showBalance }) => {
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
      formattedBudget: formatCurrency ? formatCurrency(budgetAmount) : `R$ ${budgetAmount.toFixed(2)}`,
      formattedActual: formatCurrency ? formatCurrency(spent) : `R$ ${spent.toFixed(2)}`,
      formattedRemaining: formatCurrency ? formatCurrency(remaining) : `R$ ${remaining.toFixed(2)}`,
      status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'ok'
    };
  });
  
  // Ordenar orçamentos por percentual de uso (decrescente)
  processedBudgets.sort((a, b) => b.percentage - a.percentage);
  
  // Função para renderizar valores monetários com respeito à preferência de privacidade
  const renderCurrency = (value) => {
    if (!showBalance) {
      return <span className="text-gray-400 dark:text-gray-500">•••••</span>;
    }
    return value;
  };

  return (
    <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-300 overflow-hidden transition-theme">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-dark-400 flex justify-between items-center">
        <h3 className="font-semibold text-gray-800 dark:text-white">Orçamentos</h3>
        <Link 
          to="/budget" 
          className="text-primary hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium flex items-center transition-colors"
        >
          Ver todos
          <i className="fas fa-chevron-right text-xs ml-1"></i>
        </Link>
      </div>
      
      <div className="divide-y divide-gray-100 dark:divide-dark-400">
        {processedBudgets.length > 0 ? (
          processedBudgets.map((budget, index) => (
            <div key={budget.id || index} className="px-6 py-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white">
                    {budget.budgetName || 'Orçamento sem nome'}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {budget.description || `Orçamento mensal para ${budget.budgetName || 'despesas'}`}
                  </p>
                </div>
                <span className={`font-medium ${
                  budget.status === 'exceeded' ? 'text-red-600 dark:text-red-400' : 
                  budget.status === 'warning' ? 'text-yellow-600 dark:text-yellow-400' : 
                  'text-green-600 dark:text-green-400'
                }`}>
                  {renderCurrency(`${budget.formattedActual} / ${budget.formattedBudget}`)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-dark-400 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    budget.status === 'exceeded' ? 'bg-red-500 dark:bg-red-600' : 
                    budget.status === 'warning' ? 'bg-yellow-500 dark:bg-yellow-600' : 
                    'bg-green-500 dark:bg-green-600'
                  }`}
                  style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                <span>{budget.percentage.toFixed(0)}% usado</span>
                <span>Restante: {renderCurrency(budget.formattedRemaining)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
            <p>Nenhum orçamento encontrado.</p>
            <button className="text-primary hover:underline mt-2 inline-block dark:text-indigo-400 dark:hover:text-indigo-300">
              Criar um orçamento
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetList;