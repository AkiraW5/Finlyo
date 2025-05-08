import React, { useState, useEffect } from 'react';
import { getBudgets, getTransactions, getCategories, createBudget, updateBudget, deleteBudget } from '../services/api';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';
import MobileSidebar from './layout/MobileSidebar';
import BudgetCard from './budgets/BudgetCard';
import BudgetForm from './budgets/BudgetForm';

const Budget = () => {
  // Estados
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [budgetSummary, setBudgetSummary] = useState({
    totalBudgetedExpense: 0,
    totalSpentExpense: 0,
    totalBudgetedIncome: 0,
    totalReceivedIncome: 0,
    percentageUsedExpense: 0,
    percentageReceivedIncome: 0,
    categoriesWithBudget: 0,
    categoriesOverBudget: 0,
    categoriesUnderBudget: 0
  });

  // Buscar dados quando o componente montar ou o mês selecionado mudar
  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  // Função para buscar todos os dados necessários
  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [budgetsData, transactionsData, categoriesData] = await Promise.all([
        getBudgets(),
        getTransactions(),
        getCategories()
      ]);
      
      // Filtrar apenas orçamentos (excluir metas)
      const onlyBudgets = budgetsData.filter(budget => budget.type === 'expense' || budget.type === 'income');
      
      setBudgets(onlyBudgets);
      setTransactions(transactionsData);
      setCategories(categoriesData);
      
      // Calcular resumo de orçamentos
      calculateBudgetSummary(onlyBudgets, transactionsData);
      
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      showNotification('Erro ao carregar dados de orçamento', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Calcular resumo de orçamentos
  const calculateBudgetSummary = (budgetsData, transactionsData) => {
    const firstDayOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
    
    // Filtrar transações do mês selecionado e separá-las por tipo
    const monthTransactions = transactionsData.filter(transaction => {
      const txDate = new Date(transaction.date);
      return txDate >= firstDayOfMonth && txDate <= lastDayOfMonth;
    });
    
    // Calcular gastos e receitas por categoria
    const expensesByCategory = {};
    const incomesByCategory = {};
    
    monthTransactions.forEach(tx => {
      const categoryId = tx.categoryId;
      if (!categoryId) return;
      
      if (tx.type === 'expense') {
        if (!expensesByCategory[categoryId]) {
          expensesByCategory[categoryId] = 0;
        }
        expensesByCategory[categoryId] += parseFloat(tx.amount || 0);
      } else if (tx.type === 'income') {
        if (!incomesByCategory[categoryId]) {
          incomesByCategory[categoryId] = 0;
        }
        incomesByCategory[categoryId] += parseFloat(tx.amount || 0);
      }
    });
    
    let totalBudgetedExpense = 0;
    let totalSpentExpense = 0;
    let totalBudgetedIncome = 0;
    let totalReceivedIncome = 0;
    let categoriesWithBudget = 0;
    let categoriesOverBudget = 0;
    let categoriesUnderBudget = 0;
    
    // Calcular totais e contagens
    budgetsData.forEach(budget => {
      const budgetAmount = parseFloat(budget.amount || 0);
      categoriesWithBudget++;
      
      if (budget.type === 'expense') {
        const spent = expensesByCategory[budget.categoryId] || 0;
        totalBudgetedExpense += budgetAmount;
        totalSpentExpense += spent;
        
        if (spent > budgetAmount) {
          categoriesOverBudget++;
        }
      } else if (budget.type === 'income') {
        const received = incomesByCategory[budget.categoryId] || 0;
        totalBudgetedIncome += budgetAmount;
        totalReceivedIncome += received;
        
        if (received < budgetAmount) {
          categoriesUnderBudget++;
        }
      }
    });
    
    const percentageUsedExpense = totalBudgetedExpense > 0 ? (totalSpentExpense / totalBudgetedExpense) * 100 : 0;
    const percentageReceivedIncome = totalBudgetedIncome > 0 ? (totalReceivedIncome / totalBudgetedIncome) * 100 : 0;
    
    setBudgetSummary({
      totalBudgetedExpense,
      totalSpentExpense,
      totalBudgetedIncome,
      totalReceivedIncome,
      percentageUsedExpense,
      percentageReceivedIncome,
      categoriesWithBudget,
      categoriesOverBudget,
      categoriesUnderBudget
    });
  };

  // Salvar orçamento (criar ou atualizar)
  const handleSaveBudget = async (formData) => {
    try {
      // Buscar o nome da categoria a partir do ID
      const category = categories.find(c => c.id === parseInt(formData.categoryId));
      
      // Incluir todos os campos obrigatórios
      const budgetData = {
        ...formData,
        category: category ? category.name : 'Categoria', // Adicionar o nome da categoria
        type: formData.type || 'expense', // Preservar o tipo selecionado ou usar 'expense' como padrão
        period: 'monthly'
      };
      
      if (editingBudget && editingBudget.id) {
        await updateBudget(editingBudget.id, budgetData);
        showNotification('Orçamento atualizado com sucesso!');
      } else {
        await createBudget(budgetData);
        showNotification('Orçamento criado com sucesso!');
      }
      
      // Resetar formulário e recarregar dados
      setShowBudgetForm(false);
      setEditingBudget(null);
      fetchData();
      
    } catch (error) {
      console.error("Erro ao salvar orçamento:", error);
      const errorMessage = error.response?.data?.message || 'Erro ao salvar orçamento';
      showNotification(errorMessage, 'error');
    }
  };

  // Excluir orçamento
  const handleDeleteBudget = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita.")) {
      return;
    }
    
    try {
      await deleteBudget(id);
      showNotification('Orçamento excluído com sucesso!');
      fetchData();
    } catch (error) {
      console.error("Erro ao excluir orçamento:", error);
      showNotification('Erro ao excluir orçamento', 'error');
    }
  };

  // Editar orçamento
  const handleEditBudget = (budget) => {
    // Verifique se o orçamento tem um ID válido
    if (budget && budget.id) {
      setEditingBudget(budget);
      setShowBudgetForm(true);
    } else {
      console.error("Tentativa de editar orçamento sem ID válido:", budget);
      showNotification('Erro ao editar orçamento', 'error');
    }
  };

  // Mudar o mês selecionado
  const handleMonthChange = (e) => {
    const [year, month] = e.target.value.split('-');
    setSelectedMonth(new Date(parseInt(year), parseInt(month) - 1, 1));
  };

  // Obter lista de meses para o dropdown
  const getMonthOptions = () => {
    const options = [];
    const today = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      options.push({
        value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        label: date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      });
    }
    
    return options;
  };

  // Função para formatar valores monetários
  const formatCurrency = (value) => {
    if (typeof value !== 'number') {
      value = parseFloat(value) || 0;
    }
    return `R$ ${value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Processar orçamentos com gastos
  const getBudgetsWithData = () => {
    const firstDayOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
    
    // Filtrar transações do mês selecionado
    const monthTransactions = transactions.filter(transaction => {
      const txDate = new Date(transaction.date);
      return txDate >= firstDayOfMonth && txDate <= lastDayOfMonth;
    });
    
    // Calcular gastos e receitas por categoria
    const expensesByCategory = {};
    const incomesByCategory = {};
    
    monthTransactions.forEach(tx => {
      const categoryId = tx.categoryId;
      if (!categoryId) return;
      
      if (tx.type === 'expense') {
        if (!expensesByCategory[categoryId]) {
          expensesByCategory[categoryId] = 0;
        }
        expensesByCategory[categoryId] += parseFloat(tx.amount || 0);
      } else if (tx.type === 'income') {
        if (!incomesByCategory[categoryId]) {
          incomesByCategory[categoryId] = 0;
        }
        incomesByCategory[categoryId] += parseFloat(tx.amount || 0);
      }
    });
    
    // Processar orçamentos com gastos/receitas
    return budgets.map(budget => {
      const category = categories.find(c => c.id === budget.categoryId) || {};
      const budgetAmount = parseFloat(budget.amount || 0);
      let actual = 0;
      let percentage = 0;
      let status = 'good';
      
      if (budget.type === 'expense') {
        actual = expensesByCategory[budget.categoryId] || 0;
        percentage = budgetAmount > 0 ? (actual / budgetAmount) * 100 : 0;
        status = actual > budgetAmount ? 'exceeded' : actual > budgetAmount * 0.9 ? 'warning' : 'good';
      } else if (budget.type === 'income') {
        actual = incomesByCategory[budget.categoryId] || 0;
        percentage = budgetAmount > 0 ? (actual / budgetAmount) * 100 : 0;
        status = actual < budgetAmount * 0.9 ? 'warning' : actual >= budgetAmount ? 'good' : 'under';
      }
      
      return {
        ...budget,
        categoryName: category.name || 'Categoria desconhecida',
        categoryColor: category.color || '#94a3b8',
        spent: budget.type === 'expense' ? actual : undefined,
        received: budget.type === 'income' ? actual : undefined,
        actual, // Valor real (gasto ou recebido)
        percentage,
        formattedBudget: formatCurrency(budgetAmount),
        formattedActual: formatCurrency(actual),
        remaining: budget.type === 'expense' ? budgetAmount - actual : actual - budgetAmount,
        formattedRemaining: formatCurrency(Math.abs(budget.type === 'expense' ? budgetAmount - actual : actual - budgetAmount)),
        status
      };
    }).sort((a, b) => {
      // Primeiro agrupar por tipo (despesas e depois receitas)
      if (a.type !== b.type) {
        return a.type === 'expense' ? -1 : 1;
      }
      // Dentro de cada tipo, ordenar por porcentagem
      return b.percentage - a.percentage;
    });
  };

  // Mostrar notificação
  const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white px-4 py-2 rounded-lg shadow-lg flex items-center fade-in`;
    notification.innerHTML = `
      <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2"></i>
      <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('opacity-0', 'transition-opacity', 'duration-300');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  };

  // Categorias sem orçamento
  const getCategoriesWithoutBudget = () => {
    const categoriesWithBudget = budgets.map(budget => budget.categoryId);
    return categories.filter(category => !categoriesWithBudget.includes(category.id));
  };

  const processedBudgets = getBudgetsWithData();

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar />
      <Header onMenuClick={() => setMobileMenuOpen(true)} />
      <MobileSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      
      <div className="md:ml-64">
        <div className="p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Orçamentos</h2>
              <p className="text-gray-600">Gerencie seus limites de gastos e receitas por categoria</p>
            </div>
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <div className="relative">
                <select 
                  className="appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  onChange={handleMonthChange}
                  value={`${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}`}
                >
                  {getMonthOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <i className="fas fa-chevron-down text-xs"></i>
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    setEditingBudget({type: 'expense'});
                    setShowBudgetForm(true);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm flex items-center"
                >
                  <i className="fas fa-minus-circle mr-2"></i>
                  <span>Nova Despesa</span>
                </button>
                
                <button 
                  onClick={() => {
                    setEditingBudget({type: 'income'});
                    setShowBudgetForm(true);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center"
                >
                  <i className="fas fa-plus-circle mr-2"></i>
                  <span>Nova Receita</span>
                </button>
              </div>
            </div>
          </div>

          {/* Resumo do Orçamento */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Despesas */}
              <div className="border-b md:border-b-0 md:border-r border-gray-200 pb-4 md:pb-0 md:pr-4">
                <div className="flex flex-col">
                  <h3 className="font-semibold text-gray-800 mb-3">Despesas</h3>
                  <div className="flex items-end">
                    <span className="text-2xl font-bold text-gray-900">
                      {formatCurrency(budgetSummary.totalBudgetedExpense)}
                    </span>
                    <span className="text-gray-500 ml-2 mb-1">orçado</span>
                  </div>
                  <div className="flex items-end mt-2">
                    <span className={`font-semibold ${
                      budgetSummary.totalSpentExpense > budgetSummary.totalBudgetedExpense 
                        ? 'text-red-600' 
                        : 'text-green-600'
                    }`}>
                      {formatCurrency(budgetSummary.totalSpentExpense)}
                    </span>
                    <span className="text-gray-500 text-sm ml-2">gasto</span>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          budgetSummary.percentageUsedExpense > 100 ? 'bg-red-600' : 
                          budgetSummary.percentageUsedExpense > 90 ? 'bg-yellow-500' : 
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(budgetSummary.percentageUsedExpense, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0%</span>
                      <span>{budgetSummary.percentageUsedExpense.toFixed(1)}% utilizado</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Receitas */}
              <div className="pt-4 md:pt-0 md:pl-4">
                <div className="flex flex-col">
                  <h3 className="font-semibold text-gray-800 mb-3">Receitas</h3>
                  <div className="flex items-end">
                    <span className="text-2xl font-bold text-gray-900">
                      {formatCurrency(budgetSummary.totalBudgetedIncome)}
                    </span>
                    <span className="text-gray-500 ml-2 mb-1">previsto</span>
                  </div>
                  <div className="flex items-end mt-2">
                    <span className={`font-semibold ${
                      budgetSummary.totalReceivedIncome >= budgetSummary.totalBudgetedIncome 
                        ? 'text-green-600' 
                        : 'text-yellow-600'
                    }`}>
                      {formatCurrency(budgetSummary.totalReceivedIncome)}
                    </span>
                    <span className="text-gray-500 text-sm ml-2">recebido</span>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          budgetSummary.percentageReceivedIncome >= 100 
                            ? 'bg-green-500' 
                            : budgetSummary.percentageReceivedIncome < 85 
                              ? 'bg-yellow-500' 
                              : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(budgetSummary.percentageReceivedIncome, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0%</span>
                      <span>{budgetSummary.percentageReceivedIncome.toFixed(1)}% recebido</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grade de Orçamentos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {loading ? (
              <div className="col-span-3 text-center py-10">
                <div className="spinner-border text-primary" role="status">
                  <span className="sr-only">Carregando...</span>
                </div>
              </div>
            ) : processedBudgets.length > 0 ? (
              processedBudgets.map(budget => (
                <BudgetCard 
                  key={budget.id} 
                  budget={budget}
                  onEdit={() => handleEditBudget(budget)}
                  onDelete={() => handleDeleteBudget(budget.id)}
                />
              ))
            ) : (
              <div className="col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="text-gray-400 mb-3">
                  <i className="fas fa-calculator text-5xl"></i>
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">Nenhum orçamento definido</h3>
                <p className="text-gray-500 mb-4">
                  Crie orçamentos para controlar seus gastos e receitas por categoria.
                </p>
                <div className="flex justify-center space-x-3">
                  <button 
                    onClick={() => {
                      setEditingBudget({type: 'expense'});
                      setShowBudgetForm(true);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                  >
                    Nova Despesa
                  </button>
                  <button 
                    onClick={() => {
                      setEditingBudget({type: 'income'});
                      setShowBudgetForm(true);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                  >
                    Nova Receita
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Categorias sem orçamento */}
          {getCategoriesWithoutBudget().length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-4">Categorias sem orçamento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {getCategoriesWithoutBudget().map(category => (
                  <div 
                    key={category.id}
                    className="border border-dashed border-gray-300 rounded-lg p-3 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setEditingBudget({
                        categoryId: category.id,
                        amount: 0,
                        description: `Orçamento para ${category.name}`,
                        type: category.type || 'expense'
                      });
                      setShowBudgetForm(true);
                    }}
                  >
                    <div className="flex items-center">
                      <span 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: category.color || '#94a3b8' }}
                      ></span>
                      <span className="font-medium text-gray-700">{category.name}</span>
                    </div>
                    <i className="fas fa-plus-circle text-gray-400 hover:text-indigo-600"></i>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal para adicionar ou editar orçamento */}
      {showBudgetForm && (
        <BudgetForm 
          isOpen={showBudgetForm}
          onClose={() => {
            setShowBudgetForm(false);
            setEditingBudget(null);
          }}
          onSubmit={handleSaveBudget}
          budget={editingBudget}
          categories={categories}
        />
      )}
    </div>
  );
};

export default Budget;