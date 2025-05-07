import React, { useState, useEffect } from 'react';
import { getTransactions, getAccounts, getBudgets } from '../services/api';
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
    expenseProgress: 0
  });
  
  // Buscar dados quando o componente montar ou o mês selecionado mudar
  useEffect(() => {
    fetchData();
  }, [selectedMonth]);
  
  // Função para buscar todos os dados necessários
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados da API
      const transactionsData = await getTransactions();
      const accountsData = await getAccounts();
      const budgetsData = await getBudgets();
      
      setTransactions(transactionsData);
      setAccounts(accountsData);
      setBudgets(budgetsData);
      
      // Calcular saldos e resumos
      calculateCurrentBalances(accountsData, transactionsData);
      calculateSummary(accountsData, transactionsData, budgetsData);
      
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
  const calculateSummary = (accountsData, transactionsData = [], budgetsData = []) => {
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
    
    // Calcular receitas e despesas do mês selecionado
    const totalIncome = monthTransactions
      .filter(transaction => transaction.type === 'income')
      .reduce((sum, transaction) => sum + parseFloat(transaction.amount || 0), 0);
      
    const totalExpense = monthTransactions
      .filter(transaction => transaction.type === 'expense')
      .reduce((sum, transaction) => sum + parseFloat(transaction.amount || 0), 0);
    
    // Calcular metas e limites de orçamento para o mês atual
    let incomeTarget = 0;
    let budgetLimit = 0;
    
    // Soma de todas as metas de receita
    const incomeTargets = budgetsData
      .filter(budget => budget.type === 'income')
      .reduce((sum, budget) => sum + parseFloat(budget.amount || 0), 0);
      
    // Soma de todos os limites de despesa
    const expenseLimits = budgetsData
      .filter(budget => budget.type === 'expense')
      .reduce((sum, budget) => sum + parseFloat(budget.amount || 0), 0);
    
    // Se não houver orçamentos, usar valores padrão
    incomeTarget = incomeTargets > 0 ? incomeTargets : totalIncome * 1.1; // 10% acima da receita atual
    budgetLimit = expenseLimits > 0 ? expenseLimits : totalExpense * 1.2; // 20% acima da despesa atual
    
    // Calcular progresso
    const incomeProgress = incomeTarget > 0 ? (totalIncome / incomeTarget) * 100 : 0;
    const expenseProgress = budgetLimit > 0 ? (totalExpense / budgetLimit) * 100 : 0;
    
    setSummary({
      totalBalance,
      totalIncome,
      totalExpense,
      incomeTarget,
      budgetLimit,
      incomeProgress,
      expenseProgress
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
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
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
    
    const monthTransactions = transactions.filter(transaction => {
      const txDate = new Date(transaction.date);
      return txDate >= firstDayOfMonth && txDate <= lastDayOfMonth;
    });
    
    // Dados para gráfico de receitas e despesas
    const incomeExpenseData = [];
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), i);
      const dayTransactions = monthTransactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate.getDate() === i;
      });
      
      const dayIncome = dayTransactions
        .filter(tx => tx.type === 'income')
        .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
      
      const dayExpense = dayTransactions
        .filter(tx => tx.type === 'expense')
        .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
      
      incomeExpenseData.push({
        date: i,
        income: dayIncome,
        expense: dayExpense
      });
    }
    
    // Dados para gráfico de categorias de despesas
    const categoryMap = {};
    monthTransactions
      .filter(tx => tx.type === 'expense')
      .forEach(tx => {
        if (!categoryMap[tx.category]) {
          categoryMap[tx.category] = 0;
        }
        categoryMap[tx.category] += parseFloat(tx.amount || 0);
      });
    
    const categoryData = Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value
    }));
    
    return {
      incomeExpense: incomeExpenseData,
      categories: categoryData
    };
  };
  
  // Obter transações recentes
  const getRecentTransactions = () => {
    return transactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  };
  
  // Loading state
  if (loading && accounts.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Carregando...</span>
        </div>
      </div>
    );
  }
  
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

          {/* Summary cards - Agora usando dados reais */}
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
                      className="bg-red-500 h-2 rounded-full" 
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

          {/* Charts and transactions - Agora com dados reais */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <IncomeExpenseChart data={chartData.incomeExpense} />
            <CategoriesChart data={chartData.categories} />
          </div>

          {/* Recent transactions and budgets - Agora com dados reais */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <TransactionList 
              transactions={recentTransactions}
              onAddClick={() => setTransactionModalOpen(true)} 
            />
            <BudgetList 
              budgets={budgets.filter(b => b.type === 'expense')} 
              transactions={transactions} 
              selectedMonth={selectedMonth}
            />
          </div>
        </div>
      </div>
      
      <TransactionModal 
        isOpen={transactionModalOpen} 
        onClose={() => setTransactionModalOpen(false)}
        onSubmit={handleAddTransaction}
        accounts={accounts}
      />
    </div>
  );
};

export default Dashboard;