import React, { useState, useEffect } from 'react';
import { 
  getAccounts, 
  createAccount, 
  deleteAccount, 
  updateAccount, 
  getTransactions, 
  createTransaction,
  getContributions,
  payCreditCardBill
} from '../services/api';
import { useUserSettingsContext } from '../contexts/UserSettingsContext';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';
import MobileSidebar from './layout/MobileSidebar';
import AccountModal from './modals/AccountModal';
import PayCreditCardModal from './modals/PayCreditCardModal';

const Accounts = () => {
  // Estados
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [currentBalances, setCurrentBalances] = useState({});
  const [summary, setSummary] = useState({
    totalBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
    incomeChange: 0,
    expenseChange: 0
  });
  
  // NOVO: Obter preferências do usuário através do contexto
  const { 
    settings, 
    formatCurrency, 
    formatDate, 
    showBalance 
  } = useUserSettingsContext();

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedCreditCard, setSelectedCreditCard] = useState(null);

  // Adicionar função para abrir o modal de pagamento
  const handleOpenPaymentModal = (creditCard) => {
    setSelectedCreditCard(creditCard);
    setPaymentModalOpen(true);
  };

  // Adicionar função para processar o pagamento
  const handlePayCreditCard = async (paymentData) => {
    try {
      await payCreditCardBill(paymentData);
      
      // Recarregar contas e transações
      const [accountsData, transactionsData] = await Promise.all([
        getAccounts(),
        getTransactions()
      ]);
      
      setAccounts(accountsData);
      setTransactions(transactionsData);
      calculateCurrentBalances(accountsData, transactionsData);
      
      setPaymentModalOpen(false);
      showNotification('Fatura paga com sucesso!');
    } catch (error) {
      console.error('Erro ao pagar fatura:', error);
      showNotification('Erro ao pagar fatura!', 'error');
    }
  };

  // Buscar contas, transações e contribuições
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Buscar contas
        const accountsData = await getAccounts();
        setAccounts(accountsData);
        
        // Buscar transações
        const transactionsData = await getTransactions();
        setTransactions(transactionsData);
        
        // Buscar contribuições
        const contributionsData = await getContributions();
        setContributions(contributionsData);
        
        // Calcular saldos correntes das contas e sumários
        calculateCurrentBalances(accountsData, transactionsData, contributionsData);
        calculateSummary(accountsData, transactionsData, contributionsData);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calcular saldos atuais das contas considerando transações e contribuições
  const calculateCurrentBalances = (accountsData, transactionsData = [], contributionsData = []) => {
    if (!accountsData || accountsData.length === 0) return {};
    
    // Inicializar objeto de saldos com os valores iniciais das contas
    const balances = {};
    accountsData.forEach(account => {
      // Para contas de cartão de crédito, inicializar com zero e calcular com base nas transações
      if (account.type === 'credit') {
        balances[account.id] = 0;
      } else {
        // Para outras contas, usar o saldo inicial
        balances[account.id] = parseFloat(account.balance) || 0;
      }
    });
  
    // Processar todas as transações para atualizar os saldos
    if (transactionsData && transactionsData.length > 0) {
      transactionsData.forEach(transaction => {
        const accountId = transaction.accountId;
        if (accountId && balances.hasOwnProperty(accountId)) {
          const amount = parseFloat(transaction.amount) || 0;
          
          // Cartões de crédito têm lógica inversa: despesas aumentam a fatura (positivo)
          const account = accountsData.find(acc => acc.id === accountId);
          if (account && account.type === 'credit') {
            if (transaction.type === 'expense') {
              balances[accountId] += amount; // Compras aumentam o saldo negativo
            } else {
              balances[accountId] -= amount; // Pagamentos diminuem o saldo negativo
            }
          } else {
            // Lógica normal para outras contas
            if (transaction.type === 'income') {
              balances[accountId] += amount;
            } else {
              balances[accountId] -= amount;
            }
          }
        }
      });
    }

    // Processar todas as contribuições como saídas de dinheiro
    if (contributionsData && contributionsData.length > 0) {
      contributionsData.forEach(contribution => {
        const accountId = contribution.accountId;
        if (accountId && balances.hasOwnProperty(accountId)) {
          const amount = parseFloat(contribution.amount) || 0;
          // Contribuições diminuem o saldo da conta
          balances[accountId] -= amount;
        }
      });
    }
    // Para cartões de crédito, garantir que o saldo seja representado como um valor negativo
    accountsData.forEach(account => {
      if (account.type === 'credit' && balances[account.id] < 0) {
        balances[account.id] = Math.abs(balances[account.id]);
      }
    });
    
    setCurrentBalances(balances);
    return balances;
  };

  // Calcular sumário de contas, transações e contribuições
  const calculateSummary = (accountsData, transactionsData = [], contributionsData = []) => {
    // Calcular saldo total considerando os saldos atualizados
    const updatedBalances = calculateCurrentBalances(accountsData, transactionsData, contributionsData);
    let balance = 0;
    
    if (accountsData && accountsData.length > 0) {
      accountsData.forEach(account => {
        const currentBalance = updatedBalances[account.id] || 0;
        
        if (account.type === 'credit') {
          balance -= Math.abs(currentBalance);
        } else {
          balance += currentBalance;
        }
      });
    }
    
    // Obter data do primeiro dia do mês atual e do mês anterior
    const now = new Date();
    const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    // Inicializar valores
    let currentMonthIncome = 0;
    let previousMonthIncome = 0;
    let currentMonthExpense = 0;
    let previousMonthExpense = 0;
    
    if (transactionsData && transactionsData.length > 0) {
      // Filtrar transações do mês atual
      const currentMonthTransactions = transactionsData.filter(transaction => {
        const txDate = new Date(transaction.date);
        return txDate >= firstDayCurrentMonth;
      });
      
      // Filtrar transações do mês anterior
      const previousMonthTransactions = transactionsData.filter(transaction => {
        const txDate = new Date(transaction.date);
        return txDate >= firstDayPreviousMonth && txDate <= lastDayPreviousMonth;
      });
      
      // Calcular receitas e despesas do mês atual
      currentMonthIncome = currentMonthTransactions
        .filter(transaction => transaction.type === 'income')
        .reduce((sum, transaction) => sum + parseFloat(transaction.amount || 0), 0);
        
      currentMonthExpense = currentMonthTransactions
        .filter(transaction => transaction.type === 'expense')
        .reduce((sum, transaction) => sum + parseFloat(transaction.amount || 0), 0);
      
      // Calcular receitas e despesas do mês anterior
      previousMonthIncome = previousMonthTransactions
        .filter(transaction => transaction.type === 'income')
        .reduce((sum, transaction) => sum + parseFloat(transaction.amount || 0), 0);
        
      previousMonthExpense = previousMonthTransactions
        .filter(transaction => transaction.type === 'expense')
        .reduce((sum, transaction) => sum + parseFloat(transaction.amount || 0), 0);
    }
    
    // Adicionar contribuições às despesas
    if (contributionsData && contributionsData.length > 0) {
      // Contribuições do mês atual
      const currentMonthContributions = contributionsData.filter(contribution => {
        const contribDate = new Date(contribution.date);
        return contribDate >= firstDayCurrentMonth;
      });
      
      // Contribuições do mês anterior
      const previousMonthContributions = contributionsData.filter(contribution => {
        const contribDate = new Date(contribution.date);
        return contribDate >= firstDayPreviousMonth && contribDate <= lastDayPreviousMonth;
      });
      
      // Adicionar às despesas do mês atual
      currentMonthExpense += currentMonthContributions
        .reduce((sum, contribution) => sum + parseFloat(contribution.amount || 0), 0);
        
      // Adicionar às despesas do mês anterior
      previousMonthExpense += previousMonthContributions
        .reduce((sum, contribution) => sum + parseFloat(contribution.amount || 0), 0);
    }
    
    // Calcular variações percentuais
    const incomeChange = previousMonthIncome === 0 
      ? 100 
      : ((currentMonthIncome - previousMonthIncome) / previousMonthIncome) * 100;
      
    const expenseChange = previousMonthExpense === 0 
      ? 100 
      : ((currentMonthExpense - previousMonthExpense) / previousMonthExpense) * 100;
    
    setSummary({
      totalBalance: balance,
      totalIncome: currentMonthIncome,
      totalExpense: currentMonthExpense,
      incomeChange: incomeChange,
      expenseChange: expenseChange
    });
  };

  // Obter saldo atual de uma conta considerando as transações
  const getCurrentBalance = (accountId) => {
    return currentBalances[accountId] !== undefined 
      ? currentBalances[accountId] 
      : parseFloat(accounts.find(acc => acc.id === accountId)?.balance || 0);
  };

  // Obter transações recentes (apenas as 5 mais recentes)
  const getRecentTransactions = () => {
    if (!transactions || !transactions.length) {
      if (!contributions || !contributions.length) return [];
      
      // Se não há transações mas há contribuições, retornar apenas contribuições transformadas
      return contributions
        .map(c => ({
          id: `contrib-${c.id}`,
          description: c.notes || 'Contribuição para meta',
          amount: parseFloat(c.amount) || 0,
          date: c.date,
          type: 'expense',
          category: 'Metas',
          accountId: c.accountId,
          budgetId: c.budgetId,
          isContribution: true
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    }
    
    // Se não há contribuições, retornar apenas transações
    if (!contributions || !contributions.length) {
      return transactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    }
    
    // Caso haja ambos, combinar e ordenar por data
    const transactionsFormatted = transactions.map(t => ({
      ...t,
      isTransaction: true
    }));
    
    const contributionsFormatted = contributions.map(c => ({
      id: `contrib-${c.id}`,
      description: c.notes || 'Contribuição para meta',
      amount: parseFloat(c.amount) || 0,
      date: c.date,
      type: 'expense',
      category: 'Metas',
      accountId: c.accountId,
      budgetId: c.budgetId,
      isContribution: true
    }));
    
    return [...transactionsFormatted, ...contributionsFormatted]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5); // Pegar apenas as 5 mais recentes
  };
    
  // Função para encontrar o nome da conta pelo ID
  const getAccountNameById = (accountId) => {
    const account = accounts.find(acc => acc.id.toString() === accountId?.toString());
    return account ? account.name : 'Conta não encontrada';
  };

  // Função para obter ícone baseado na categoria
  const getCategoryIcon = (category) => {
    const iconMap = {
      'Alimentação': 'utensils',
      'Moradia': 'home',
      'Transporte': 'car',
      'Saúde': 'heartbeat',
      'Educação': 'graduation-cap',
      'Lazer': 'smile',
      'Rendimento': 'money-bill-wave',
      'Investimento': 'chart-line',
      'Salário': 'money-bill-wave',
      'Transferência': 'exchange-alt'
    };
    
    return iconMap[category] || (category?.toLowerCase().includes('salário') ? 'money-bill-wave' : 'receipt');
  };

  const toggleDropdown = (accountId) => {
    if (activeDropdown === accountId) {
      setActiveDropdown(null); // Fecha o dropdown se já estiver aberto
    } else {
      setActiveDropdown(accountId); // Abre o dropdown específico da conta
    }
  };
  
  // Adicione um event listener para fechar o dropdown quando clicar fora
  useEffect(() => {
    const closeDropdowns = (e) => {
      if (!e.target.closest('.dropdown')) {
        setActiveDropdown(null);
      }
    };
    
    document.addEventListener('click', closeDropdowns);
    return () => document.removeEventListener('click', closeDropdowns);
  }, []);

  // Adicionar ou editar uma conta
  const handleSaveAccount = async (accountData) => {
    try {
      let newAccount;
      let initialFatureValue = 0;
      let updatedAccounts;
      
      // Se for cartão de crédito, capturar o valor da fatura e zerar o balance
      if (accountData.type === 'credit') {
        initialFatureValue = accountData.balance || 0;
        accountData.balance = 0; // Zeramos o balance para cartões de crédito
      }

      if (editingAccount) {
        // Atualizar conta existente
        await updateAccount(editingAccount.id, accountData);
        newAccount = {...accountData, id: editingAccount.id};
        updatedAccounts = accounts.map(account => 
          account.id === editingAccount.id ? newAccount : account
        );
      } else {
        // Criar nova conta
        newAccount = await createAccount(accountData);
        updatedAccounts = [...accounts, newAccount];

        // Se for um novo cartão de crédito e tiver valor inicial de fatura, criar transação
        if (accountData.type === 'credit' && initialFatureValue > 0) {
          // Criar transação para representar a fatura inicial
          const transactionData = {
            amount: initialFatureValue,
            type: 'expense',
            description: `Fatura inicial - ${accountData.name}`,
            date: new Date().toISOString().split('T')[0], // Data atual formato YYYY-MM-DD
            accountId: newAccount.id,
            categoryId: null, // Sem categoria específica
            category: 'Cartão de Crédito',
            account: newAccount.name,
            notes: 'Fatura inicial do cartão'
          };

          // Chamar API para criar a transação
          await createTransaction(transactionData);
          
          // Atualizar lista de transações
          const transactionsList = await getTransactions();
          setTransactions(transactionsList);
          
          showNotification('Cartão de crédito e fatura inicial criados com sucesso!');
        } else {
          showNotification('Conta salva com sucesso!');
        }
      }
        
      setAccounts(updatedAccounts);
      calculateCurrentBalances(updatedAccounts, transactions);
      calculateSummary(updatedAccounts, transactions);
      setAccountModalOpen(false);
      setEditingAccount(null);
      showNotification('Conta salva com sucesso!');
    } catch (error) {
      console.error("Erro ao salvar conta:", error);
      showNotification('Erro ao salvar conta!', 'error');
    }
  };

  // Excluir conta
  const handleDeleteAccount = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.")) {
      try {
        await deleteAccount(id);
        const updatedAccounts = accounts.filter(account => account.id !== id);
        setAccounts(updatedAccounts);
        calculateCurrentBalances(updatedAccounts, transactions);
        calculateSummary(updatedAccounts, transactions);
        showNotification('Conta excluída com sucesso!');
      } catch (error) {
        console.error("Erro ao excluir conta:", error);
        showNotification('Erro ao excluir conta!', 'error');
      }
    }
  };
  
  // Editar conta
  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setAccountModalOpen(true);
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

  // Determinar tipo de ícone para a conta
  const getAccountIcon = (type) => {
    switch (type) {
      case 'checking': return 'landmark';
      case 'savings': return 'piggy-bank';
      case 'credit': return 'credit-card';
      case 'investment': return 'chart-line';
      case 'wallet': return 'money-bill-wave';
      default: return 'wallet';
    }
  };

  // Determinar cor de fundo para o ícone da conta
  const getAccountBgColorClass = (type) => {
    switch (type) {
      case 'checking': return 'account-type-bg';
      case 'savings': return 'savings-type-bg';
      case 'credit': return 'credit-type-bg';
      case 'investment': return 'account-type-bg';
      case 'wallet': return 'wallet-type-bg';
      default: return 'account-type-bg';
    }
  };

  // Determinar cor do texto para o saldo da conta
  const getBalanceColorClass = (type, balance) => {
    if (type === 'credit' || balance < 0) {
      return 'text-red-600 dark:text-red-400';
    }
    return balance > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-800 dark:text-white';
  };

  // Renderização condicional de saldos com base nas preferências
  const renderBalance = (balance, type) => {
    // Se usuário não quer ver saldos
    if (!showBalance) {
      return <span className="font-semibold text-gray-400 dark:text-gray-500">•••••</span>;
    }
    
    return (
      <span className={`font-semibold ${getBalanceColorClass(type, balance)}`}>
        {type === 'credit' && balance > 0 ? '- ' : ''}
        {formatCurrency(Math.abs(balance))}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-dark-100">
        <div className="spinner-border text-primary dark:text-indigo-400" role="status">
          <span className="sr-only">Carregando...</span>
        </div>
      </div>
    );
  }

  // Obter transações recentes para exibir
  const recentTransactions = getRecentTransactions();

  return (
    <div className="bg-gray-50 dark:bg-dark-100 min-h-screen transition-theme">
      <Sidebar />
      <Header title="Contas" onMenuClick={() => setMobileMenuOpen(true)} />
      <MobileSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <div className="md:ml-64">
        <div className="p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Contas</h2>
              <p className="text-gray-600 dark:text-gray-300">Gerencie todas as suas contas bancárias e carteiras</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button 
                onClick={() => {setEditingAccount(null); setAccountModalOpen(true);}}
                className="bg-primary hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
              >
                <i className="fas fa-plus mr-2"></i>
                <span>Adicionar Conta</span>
              </button>
            </div>
          </div>

          {/* Summary cards - Usando saldos atualizados */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Total balance */}
            <div className="bg-white dark:bg-dark-200 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-dark-300 transition-theme">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Saldo Total</p>
                  <h3 className="text-2xl font-bold mt-1 text-gray-800 dark:text-white">
                    {showBalance 
                      ? formatCurrency(summary.totalBalance)
                      : <span className="text-gray-400 dark:text-gray-500">•••••</span>}
                  </h3>
                </div>
                <div className="bg-indigo-100 dark:bg-indigo-900 dark:bg-opacity-30 p-3 rounded-lg">
                  <i className="fas fa-wallet text-indigo-600 dark:text-indigo-400"></i>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-dark-300">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Última atualização</span>
                  <span className="text-primary dark:text-indigo-400 font-medium">{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
            
            {/* Income summary */}
            <div className="bg-white dark:bg-dark-200 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-dark-300 transition-theme">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receitas (30 dias)</p>
                  <h3 className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">
                    {showBalance 
                      ? formatCurrency(summary.totalIncome)
                      : <span className="text-gray-400 dark:text-gray-500">•••••</span>}
                  </h3>
                </div>
                <div className="bg-green-100 dark:bg-green-900 dark:bg-opacity-30 p-3 rounded-lg">
                  <i className="fas fa-arrow-up text-green-600 dark:text-green-400"></i>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-dark-300">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Comparado ao mês passado</span>
                  <span className={`font-medium ${summary.incomeChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {summary.incomeChange >= 0 ? '+ ' : '- '}
                    {Math.abs(summary.incomeChange).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
            
            {/* Expense summary */}
            <div className="bg-white dark:bg-dark-200 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-dark-300 transition-theme">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Despesas (30 dias)</p>
                  <h3 className="text-2xl font-bold mt-1 text-red-600 dark:text-red-400">
                    {showBalance 
                      ? formatCurrency(summary.totalExpense)
                      : <span className="text-gray-400 dark:text-gray-500">•••••</span>}
                  </h3>
                </div>
                <div className="bg-red-100 dark:bg-red-900 dark:bg-opacity-30 p-3 rounded-lg">
                  <i className="fas fa-arrow-down text-red-600 dark:text-red-400"></i>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-dark-300">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Comparado ao mês passado</span>
                  <span className={`font-medium ${summary.expenseChange <= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {summary.expenseChange <= 0 ? '+ ' : '- '}
                    {Math.abs(summary.expenseChange).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Accounts list */}
          <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-300 overflow-hidden mb-6 transition-theme">
            {/* Table header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-dark-300 flex flex-col md:flex-row justify-between items-start md:items-center">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2 md:mb-0">Minhas Contas</h3>
              
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <select className="appearance-none bg-white dark:bg-dark-300 border border-gray-300 dark:border-dark-400 rounded-lg pl-3 pr-8 py-2 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-indigo-600 focus:border-transparent transition-theme">
                    <option>Ordenar por: Saldo</option>
                    <option>Ordenar por: Nome</option>
                    <option>Ordenar por: Tipo</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                    <i className="fas fa-chevron-down text-xs"></i>
                  </div>
                </div>
                
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors">
                  <i className="fas fa-download text-gray-500 dark:text-gray-400"></i>
                </button>
              </div>
            </div>
            
            {/* Accounts grid - Com saldos atualizados */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {/* Render all accounts */}
              {accounts.length > 0 ? accounts.map(account => {
                // Obter o saldo atualizado da conta
                const currentBalance = getCurrentBalance(account.id);

                // Calcular limite disponível para cartões de crédito
                let availableLimit = 0;
                let percentUsed = 0;
                
                if (account.type === 'credit' && account.creditLimit) {
                  availableLimit = parseFloat(account.creditLimit) - currentBalance;
                  percentUsed = (currentBalance / parseFloat(account.creditLimit)) * 100;
                  if (percentUsed < 0) percentUsed = 0;
                  if (percentUsed > 100) percentUsed = 100;
                }
                
                return (
                  <div key={account.id} 
                       className={`account-card bg-white dark:bg-dark-300 border ${account.isDefault ? 'border-primary dark:border-indigo-500' : 'border-gray-200 dark:border-dark-400'} rounded-xl p-5 transition-all duration-200 cursor-pointer hover:shadow-md dark:hover:border-dark-200`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className={`${getAccountBgColorClass(account.type)} p-3 rounded-lg dark:bg-opacity-30`} 
                           style={account.color ? {backgroundColor: `${account.color}20`} : {}}>
                        <i className={`fas fa-${getAccountIcon(account.type)} ${account.type === 'credit' ? 'text-red-600 dark:text-red-400' : 'text-primary dark:text-indigo-400'} text-xl`}
                           style={account.color ? {color: account.color} : {}}></i>
                      </div>
                      
                      {/* Indicador de conta padrão */}
                      {account.isDefault && (
                        <span className="bg-primary bg-opacity-10 dark:bg-indigo-900 dark:bg-opacity-30 text-primary dark:text-indigo-400 text-xs font-medium px-2 py-1 rounded-full">
                          Padrão
                        </span>
                      )}
                      
                      <div className="dropdown relative">
                        <button 
                          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none transition-colors" 
                          onClick={(e) => {
                            e.stopPropagation(); // Evita que o evento de clique propague
                            toggleDropdown(account.id);
                          }}
                        >
                          <i className="fas fa-ellipsis-v"></i>
                        </button>
                        <div className={`dropdown-menu absolute right-0 mt-2 w-40 bg-white dark:bg-dark-200 rounded-md shadow-lg z-10 ${activeDropdown === account.id ? 'block' : 'hidden'}`}>
                          <button onClick={() => handleEditAccount(account)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors">
                            Editar
                          </button>
                          <a href={`/transactions?account=${account.id}`} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors">
                            Transações
                          </a>
                            {account.type === 'credit' && (
                              <button 
                                onClick={() => handleOpenPaymentModal(account)} 
                                className="block w-full text-left px-4 py-2 text-sm text-primary dark:text-indigo-400 hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors"
                              >
                                Pagar Fatura
                              </button>
                            )}
                          <button onClick={() => handleDeleteAccount(account.id)} className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors">
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-800 dark:text-white mb-1">{account.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      {account.bankName && `${account.bankName} `}
                      {account.accountNumber && `•••• ${account.accountNumber.slice(-4)}`}
                      {account.type === 'credit' && account.cardNumber && `•••• ${account.cardNumber.slice(-4)}`}
                    </p>
                    
                    {/* Informações de saldo para contas normais */}
                    {account.type !== 'credit' && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-300 text-sm">
                          Saldo atual
                        </span>
                        {renderBalance(currentBalance, account.type)}
                      </div>
                    )}
                    
                    {/* Informações detalhadas para cartões de crédito */}
                    {account.type === 'credit' && (
                      <div className="space-y-2">
                        {/* Fatura atual */}
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-300 text-sm">
                            Fatura atual
                          </span>
                          {renderBalance(currentBalance, account.type)}
                        </div>
                        
                        {/* Limite do cartão */}
                        {account.creditLimit && (
                          <>
                            {/* Barra de progresso do limite */}
                            <div className="w-full bg-gray-200 dark:bg-dark-400 rounded-full h-2 mt-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  percentUsed > 90 ? 'bg-red-500 dark:bg-red-600' : 
                                  percentUsed > 70 ? 'bg-yellow-500 dark:bg-yellow-600' : 
                                  'bg-green-500 dark:bg-green-600'
                                }`}
                                style={{ width: `${percentUsed}%` }}
                              ></div>
                            </div>
                            
                            {/* Texto de limite */}
                            <div className="flex justify-between items-center text-sm mt-1">
                              <span className="text-gray-600 dark:text-gray-300">
                                Limite disponível
                              </span>
                              <span className="font-medium text-green-600 dark:text-green-400">
                                {showBalance ? formatCurrency(availableLimit) : <span className="text-gray-400 dark:text-gray-500">•••••</span>}
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                              <span>
                                Utilizado: {showBalance ? `${percentUsed.toFixed(0)}%` : '•••••'}
                              </span>
                              <span>
                                Limite total: {showBalance ? formatCurrency(account.creditLimit) : '•••••'}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              }) : (
                <div className="col-span-3 py-8 flex flex-col items-center text-gray-500 dark:text-gray-400">
                  <i className="fas fa-wallet text-gray-300 dark:text-gray-600 text-5xl mb-4"></i>
                  <p>Você ainda não possui contas cadastradas.</p>
                </div>
              )}
              
              {/* Add new account card */}
              <div 
                onClick={() => {setEditingAccount(null); setAccountModalOpen(true);}}
                className="flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-dark-400 rounded-xl p-5 hover:border-primary dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900 dark:hover:bg-opacity-10 transition-all duration-200 cursor-pointer"
              >
                <div className="text-center">
                  <div className="mx-auto bg-indigo-100 dark:bg-indigo-900 dark:bg-opacity-30 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                    <i className="fas fa-plus text-primary dark:text-indigo-400 text-xl"></i>
                  </div>
                  <h4 className="font-semibold text-gray-800 dark:text-white">Adicionar nova conta</h4>
                </div>
              </div>
            </div>
          </div>

          {/* Recent transactions */}
          <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-300 overflow-hidden transition-theme">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-dark-300 flex flex-col md:flex-row justify-between items-start md:items-center">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2 md:mb-0">Transações Recentes</h3>
              <a href="/transactions" className="text-primary hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium transition-colors">Ver todas</a>
            </div>
            
            <div className="divide-y divide-gray-100 dark:divide-dark-300">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((item) => {
                  const isContribution = item.isContribution;
                  
                  return (
                    <div key={item.id} className="hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors">
                      <div className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`${isContribution ? 'bg-blue-100 dark:bg-blue-900 dark:bg-opacity-30 text-blue-600 dark:text-blue-400' : 
                            item.type === 'income' ? 'bg-green-100 dark:bg-green-900 dark:bg-opacity-30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900 dark:bg-opacity-30 text-red-600 dark:text-red-400'} p-3 rounded-lg mr-4`}>
                            <i className={`fas fa-${isContribution ? 'bullseye' : getCategoryIcon(item.category)}`}></i>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800 dark:text-white">{item.description}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {getAccountNameById(item.accountId)} • {formatDate(item.date)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${isContribution ? 'text-blue-600 dark:text-blue-400' : 
                            item.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {isContribution ? '- ' : item.type === 'income' ? '+ ' : '- '}
                            {showBalance 
                              ? formatCurrency(item.amount)
                              : <span className="text-gray-400 dark:text-gray-500">•••••</span>}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  <p>Nenhuma transação recente encontrada.</p>
                  <a href="/transactions" className="text-primary dark:text-indigo-400 hover:underline mt-2 inline-block transition-colors">
                    Adicionar uma transação
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <AccountModal 
        isOpen={accountModalOpen}
        onClose={() => {setAccountModalOpen(false); setEditingAccount(null);}}
        onSubmit={handleSaveAccount}
        account={editingAccount}
        existingAccounts={accounts}  // Adicionando as contas existentes como prop
      />

      <PayCreditCardModal 
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSubmit={handlePayCreditCard}
        creditCardAccounts={accounts.filter(acc => acc.type === 'credit')}
        bankAccounts={accounts.filter(acc => acc.type !== 'credit')}
      />
    </div>
  );
};

export default Accounts;