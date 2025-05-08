import React, { useState, useEffect } from 'react';
import { getTransactions, getAccounts, getBudgets, getCategories, getContributions } from '../services/api';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';
import MobileSidebar from './layout/MobileSidebar';
import SummaryCard from './dashBoard/SummaryCard';
import IncomeExpenseChart from './dashBoard/IncomeExpenseChart';
import CategoriesChart from './dashBoard/CategoriesChart';
import TransactionList from './transactions/TransactionList';
import BudgetList from './budgets/BudgetList';
import TransactionModal from './modals/TransactionModal';

const Dashboard = () => {
  // Estados
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [contributions, setContributions] = useState([]); // Novo estado para contribuições
  const [loading, setLoading] = useState(true);
  const [currentBalances, setCurrentBalances] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [summary, setSummary] = useState({
    totalBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
    incomeTarget: 0,
    budgetLimit: 0,
    incomeProgress: 0,
    expenseProgress: 0,
    savingsRate: 0 // Nova propriedade para taxa de poupança
  });
  
  // Buscar dados quando o componente montar ou o mês selecionado mudar
  useEffect(() => {
    fetchData();
  }, [selectedMonth]);
  
  // Função para buscar todos os dados necessários
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados da API com Promise.all para melhor performance
      const [transactionsData, accountsData, budgetsData, categoriesData, contributionsData] = await Promise.all([
        getTransactions(),
        getAccounts(),
        getBudgets(),
        getCategories(),
        getContributions()
      ]);
      
      // Garantir que valores são numéricos
      const processedTransactions = transactionsData.map(tx => ({
        ...tx,
        amount: parseFloat(tx.amount || 0)
      }));
      
      const processedContributions = contributionsData.map(contrib => ({
        ...contrib,
        amount: parseFloat(contrib.amount || 0)
      }));
      
      setTransactions(processedTransactions);
      setAccounts(accountsData);
      setBudgets(budgetsData);
      setCategories(categoriesData);
      setContributions(processedContributions);
      
      // Calcular saldos e resumos
      calculateCurrentBalances(accountsData, processedTransactions);
      calculateSummary(
        accountsData, 
        processedTransactions, 
        budgetsData, 
        processedContributions
      );
      
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Calcular saldos atuais das contas
  const calculateCurrentBalances = (accountsData, transactionsData = []) => {
    if (!accountsData || accountsData.length === 0) return {};
    
    // Inicializar objeto de saldos com os valores iniciais das contas
    const balances = {};
    accountsData.forEach(account => {
      balances[account.id] = parseFloat(account.balance) || 0;
    });
    
    // Processar todas as transações para atualizar os saldos
    if (transactionsData && transactionsData.length > 0) {
      transactionsData.forEach(transaction => {
        const accountId = transaction.accountId;
        if (accountId && balances.hasOwnProperty(accountId)) {
          const amount = parseFloat(transaction.amount) || 0;
          
          if (transaction.type === 'income') {
            // Receitas aumentam o saldo da conta
            balances[accountId] += amount;
          } else if (transaction.type === 'expense') {
            // Despesas diminuem o saldo da conta
            balances[accountId] -= amount;
          }
        }
      });
    }
    
    setCurrentBalances(balances);
    return balances;
  };
  
  // Calcular sumário financeiro
  const calculateSummary = (accountsData, transactionsData = [], budgetsData = [], contributionsData = []) => {
    // Calcular saldo total considerando os saldos atualizados
    const updatedBalances = calculateCurrentBalances(accountsData, transactionsData);
    let totalBalance = 0;
    
    if (accountsData && accountsData.length > 0) {
      accountsData.forEach(account => {
        const currentBalance = updatedBalances[account.id] || 0;
        
        if (account.type === 'credit') {
          totalBalance -= Math.abs(currentBalance);
        } else {
          totalBalance += currentBalance;
        }
      });
    }
    
    // Filtrar transações do mês selecionado
    const firstDayOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
    
    const monthTransactions = transactionsData.filter(transaction => {
      const txDate = new Date(transaction.date);
      return txDate >= firstDayOfMonth && txDate <= lastDayOfMonth;
    });
    
    const monthContributions = contributionsData.filter(contrib => {
      const contribDate = new Date(contrib.date);
      return contribDate >= firstDayOfMonth && contribDate <= lastDayOfMonth;
    });
    
    // Calcular receitas e despesas do mês selecionado
    const totalIncome = monthTransactions
      .filter(transaction => transaction.type === 'income')
      .reduce((sum, transaction) => sum + parseFloat(transaction.amount || 0), 0);
      
    let totalExpense = monthTransactions
      .filter(transaction => transaction.type === 'expense')
      .reduce((sum, transaction) => sum + parseFloat(transaction.amount || 0), 0);
      
    // Adicionar contribuições às despesas
    const totalContributions = monthContributions
      .reduce((sum, contrib) => sum + parseFloat(contrib.amount || 0), 0);
    
    totalExpense += totalContributions;
    
    // Calcular metas e limites de orçamento para o mês atual
    const relevantBudgets = budgetsData.filter(budget => budget.type !== 'goal');
    
    // Soma de todas as metas de receita
    const incomeTargets = relevantBudgets
      .filter(budget => budget.type === 'income')
      .reduce((sum, budget) => sum + parseFloat(budget.amount || 0), 0);
      
    // Soma de todos os limites de despesa
    const expenseLimits = relevantBudgets
      .filter(budget => budget.type === 'expense')
      .reduce((sum, budget) => sum + parseFloat(budget.amount || 0), 0);
    
    // Se não houver orçamentos, usar valores padrão
    const incomeTarget = incomeTargets > 0 ? incomeTargets : totalIncome * 1.1; // 10% acima da receita atual
    const budgetLimit = expenseLimits > 0 ? expenseLimits : totalExpense * 1.2; // 20% acima da despesa atual
    
    // Calcular progresso
    const incomeProgress = incomeTarget > 0 ? (totalIncome / incomeTarget) * 100 : 0;
    const expenseProgress = budgetLimit > 0 ? (totalExpense / budgetLimit) * 100 : 0;
    
    // Calcular taxa de poupança (Receita - Despesa) / Receita
    const savingsRate = totalIncome > 0 
      ? Math.max(0, ((totalIncome - totalExpense) / totalIncome) * 100) 
      : 0;
    
    setSummary({
      totalBalance,
      totalIncome,
      totalExpense,
      incomeTarget,
      budgetLimit,
      incomeProgress,
      expenseProgress,
      savingsRate
    });
  };
  
  // Mudar o mês selecionado
  const handleMonthChange = (e) => {
    const [year, month] = e.target.value.split('-');
    setSelectedMonth(new Date(parseInt(year), parseInt(month) - 1, 1));
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
  
  // Função para adicionar uma nova transação
  const handleAddTransaction = async (formData) => {
    try {
      await createTransaction(formData);
      setTransactionModalOpen(false);
      showNotification('Transação adicionada com sucesso!');
      fetchData(); // Recarregar dados
    } catch (error) {
      console.error("Erro ao adicionar transação:", error);
      showNotification('Erro ao adicionar transação.', 'error');
    }
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
  
  // Obter transações para os gráficos
  const getChartData = () => {
    if (!transactions.length) return { incomeExpense: [], categories: [] };
    
    const firstDayOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
    
    // Filtrar transações do mês selecionado
    const monthTransactions = transactions.filter(transaction => {
      const txDate = new Date(transaction.date);
      return txDate >= firstDayOfMonth && txDate <= lastDayOfMonth;
    });
    
    const monthContributions = contributions.filter(contrib => {
      const contribDate = new Date(contrib.date);
      return contribDate >= firstDayOfMonth && contribDate <= lastDayOfMonth;
    });
    
    // Dados para gráfico de receitas e despesas por dia
    const incomeExpenseData = [];
    
    // Inicializa array com todos os dias do mês
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const dayTransactions = monthTransactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate.getDate() === i;
      });
      
      const dayContributions = monthContributions.filter(contrib => {
        const contribDate = new Date(contrib.date);
        return contribDate.getDate() === i;
      });
      
      const dayIncome = dayTransactions
        .filter(tx => tx.type === 'income')
        .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
      
      const dayExpense = dayTransactions
        .filter(tx => tx.type === 'expense')
        .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0) +
        dayContributions.reduce((sum, contrib) => sum + parseFloat(contrib.amount || 0), 0);
      
      const dayBalance = dayIncome - dayExpense;
      
      incomeExpenseData.push({
        date: i,
        income: dayIncome,
        expense: dayExpense,
        balance: dayBalance,
        formattedIncome: formatCurrency(dayIncome),
        formattedExpense: formatCurrency(dayExpense),
        formattedBalance: formatCurrency(dayBalance)
      });
    }
    
    // Dados para gráfico de categorias de despesas
    const categoryMap = {};
    const totalExpense = monthTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0) +
      monthContributions.reduce((sum, contrib) => sum + parseFloat(contrib.amount || 0), 0);
    
    // Adicionar despesas regulares
    monthTransactions
      .filter(tx => tx.type === 'expense')
      .forEach(tx => {
        // Primeiro tentar encontrar pelo ID da categoria, depois pelo nome, ou usar 'Outros'
        const categoryName = categories.find(c => c.id === tx.categoryId)?.name || tx.category || 'Outros';
        
        if (!categoryMap[categoryName]) {
          categoryMap[categoryName] = 0;
        }
        categoryMap[categoryName] += parseFloat(tx.amount || 0);
      });
    
    // Adicionar contribuições para metas na categoria "Metas"
    if (monthContributions.length > 0) {
      if (!categoryMap['Metas']) {
        categoryMap['Metas'] = 0;
      }
      
      monthContributions.forEach(contrib => {
        categoryMap['Metas'] += parseFloat(contrib.amount || 0);
      });
    }
    
    const categoryData = Object.entries(categoryMap).map(([name, value]) => {
      // Buscar cor da categoria se disponível
      const categoryObj = categories.find(c => c.name === name);
      const color = categoryObj?.color || getCategoryDefaultColor(name);
      const percentage = totalExpense > 0 ? (value / totalExpense) * 100 : 0;
      
      return {
        name,
        value,
        color,
        formattedValue: formatCurrency(value),
        percentage: percentage.toFixed(1),
        formattedPercentage: `${percentage.toFixed(1)}%`
      };
    });
    
    // Ordenar categorias por valor (decrescente)
    categoryData.sort((a, b) => b.value - a.value);
    
    return {
      incomeExpense: incomeExpenseData,
      categories: categoryData
    };
  };

  // Obter cor padrão para categorias
  const getCategoryDefaultColor = (categoryName) => {
    const colorMap = {
      'Moradia': '#ef4444', // red
      'Alimentação': '#f97316', // orange
      'Transporte': '#f59e0b', // amber
      'Lazer': '#10b981', // green
      'Saúde': '#3b82f6', // blue
      'Educação': '#6366f1', // indigo
      'Metas': '#8b5cf6', // violet
      'Investimentos': '#a855f7', // purple
      'Outros': '#94a3b8' // gray
    };
    
    return colorMap[categoryName] || '#94a3b8'; // gray padrão
  };
  
  // Obter transações recentes
  const getRecentTransactions = () => {
    if (!transactions.length && !contributions.length) return [];
    
    // Combinar transações e contribuições em um único array
    const combined = [
      // Transações regulares
      ...transactions.map(tx => {
        const account = accounts.find(acc => acc.id === tx.accountId);
        const category = categories.find(cat => cat.id === tx.categoryId || cat.name === tx.category);
        
        return {
          ...tx,
          isTransaction: true,
          accountName: account?.name || 'Conta não encontrada',
          categoryName: category?.name || tx.category || 'Sem categoria',
          categoryColor: category?.color || getCategoryDefaultColor(tx.category || 'Outros'),
          formattedAmount: formatCurrency(tx.amount),
          formattedDate: new Date(tx.date).toLocaleDateString('pt-BR')
        };
      }),
      
      // Contribuições para metas
      ...contributions.map(contrib => {
        const account = accounts.find(acc => acc.id === contrib.accountId);
        const goal = budgets.find(b => b.id === contrib.goalId);
        
        return {
          id: `contrib-${contrib.id}`,
          description: goal?.name || contrib.notes || 'Contribuição para meta',
          amount: contrib.amount,
          date: contrib.date,
          type: 'expense',
          category: 'Metas',
          accountId: contrib.accountId,
          isContribution: true,
          accountName: account?.name || 'Conta não encontrada',
          categoryName: 'Metas',
          categoryColor: getCategoryDefaultColor('Metas'),
          formattedAmount: formatCurrency(contrib.amount),
          formattedDate: new Date(contrib.date).toLocaleDateString('pt-BR')
        };
      })
    ];
    
    // Ordenar por data (mais recente primeiro) e limitar a 5 transações
    return combined
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  };
  
  const chartData = getChartData();
  const recentTransactions = getRecentTransactions();
  
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
              <h2 className="text-2xl font-bold text-gray-800">Visão Geral</h2>
              <p className="text-gray-600">Resumo completo das suas finanças pessoais</p>
            </div>
            <div className="mt-4 md:mt-0">
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
            </div>
          </div>

          {/* Summary cards - Com dados reais melhorados */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <SummaryCard
              title="Saldo Total"
              amount={formatCurrency(summary.totalBalance)}
              icon="fa-wallet"
              color="text-indigo-600"
              details={
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Receitas</span>
                    <span className="text-green-600 font-medium">+ {formatCurrency(summary.totalIncome)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-500">Despesas</span>
                    <span className="text-red-600 font-medium">- {formatCurrency(summary.totalExpense)}</span>
                  </div>
                </div>
              }
            />
            
            <SummaryCard
              title="Receitas"
              amount={formatCurrency(summary.totalIncome)}
              icon="fa-arrow-up"
              color="text-green-600"
              details={
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(summary.incomeProgress, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 ml-2">
                    {summary.incomeProgress.toFixed(1)}% da meta
                  </span>
                </div>
              }
            />
            
            <SummaryCard
              title="Despesas"
              amount={formatCurrency(summary.totalExpense)}
              icon="fa-arrow-down"
              color="text-red-600"
              details={
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        summary.expenseProgress > 100 ? 'bg-red-500' : 
                        summary.expenseProgress > 80 ? 'bg-yellow-500' : 
                        'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(summary.expenseProgress, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 ml-2">
                    {summary.expenseProgress.toFixed(1)}% do orçamento
                  </span>
                </div>
              }
            />
          </div>

          {/* Taxa de poupança e estatísticas adicionais */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Taxa de Poupança</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                summary.savingsRate > 30 ? 'bg-green-100 text-green-800' :
                summary.savingsRate > 10 ? 'bg-blue-100 text-blue-800' :
                'bg-red-100 text-red-800'
              }`}>
                {summary.savingsRate.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className={`rounded-full h-2 ${
                  summary.savingsRate > 30 ? 'bg-green-500' :
                  summary.savingsRate > 10 ? 'bg-blue-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${Math.min(Math.max(summary.savingsRate, 0), 100)}%` }}
              ></div>
            </div>
            <div className="flex text-xs text-gray-500 justify-between">
              <span>0%</span>
              <span className="text-blue-600 font-medium">Meta: 20%</span>
              <span>50%</span>
            </div>
          </div>

          {/* Charts and transactions - Com dados reais melhorados */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Gráfico de Receitas vs Despesas */}
            <div className="lg:col-span-2">
              <IncomeExpenseChart data={chartData.incomeExpense} />
            </div>
            
            {/* Gráfico de Categorias */}
            <div className="lg:col-span-1">
              <CategoriesChart data={chartData.categories} />
            </div>
          </div>

          {/* Recent transactions and budgets - Com dados reais melhorados */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de transações recentes */}
            <div className="lg:col-span-2">
              <TransactionList 
                transactions={recentTransactions}
                onAddClick={() => setTransactionModalOpen(true)} 
                accounts={accounts}
                categories={categories}
              />
            </div>
            
            {/* Lista de orçamentos */}
            <div className="lg:col-span-1">
              <BudgetList 
                budgets={budgets.filter(b => b.type === 'expense')} 
                transactions={transactions} 
                selectedMonth={selectedMonth}
                contributions={contributions}
              />
            </div>
          </div>
        </div>
      </div>
      
      <TransactionModal 
        isOpen={transactionModalOpen} 
        onClose={() => setTransactionModalOpen(false)}
        onSubmit={handleAddTransaction}
        accounts={accounts}
        categories={categories}
      />
    </div>
  );
};

export default Dashboard;