import React, { useState, useEffect } from 'react';
import { 
  getTransactions, 
  createTransaction, 
  getAccounts, 
  getCategories, 
  getContributions, 
  updateTransaction, 
  deleteTransaction 
} from '../services/api';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';
import MobileSidebar from './layout/MobileSidebar';
import TransactionModal from './modals/TransactionModal';
import { useUserSettingsContext } from '../contexts/UserSettingsContext';

const Transactions = () => {
  // Estados
  const [transactions, setTransactions] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [combinedTransactions, setCombinedTransactions] = useState([]);
  // Estado adicional para transações filtradas
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('last30');
  const [filterAccount, setFilterAccount] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isInvestment, setIsInvestment] = useState(false);
  const [investmentAccountId, setInvestmentAccountId] = useState('');

  const [filterStartDate, setFilterStartDate] = useState(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return thirtyDaysAgo.toISOString().split('T')[0]; // Formato YYYY-MM-DD para inputs HTML
  });
  const [filterEndDate, setFilterEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0]; // Data atual formatada como YYYY-MM-DD
  });
  
  // Obter configurações do contexto de usuário
  const { settings, formatCurrency, formatDate, showBalance } = useUserSettingsContext();
  
  // Sumários
  const [summary, setSummary] = useState({
    count: 0,
    income: 0,
    expense: 0
  });

  // Função para verificar se uma conta é do tipo cartão de crédito
  const isCreditCardAccount = (accountId) => {
    const account = accounts.find(acc => acc.id.toString() === accountId?.toString());
    return account && account.type === 'credit';
  };

  // Adicionar função para detectar categorias de investimento
  const checkIfInvestmentCategory = () => {
    if (!categoryId || !categories || categories.length === 0) return false;
    
    const selectedCategory = categories.find(cat => cat.id.toString() === categoryId.toString());
    if (!selectedCategory) return false;
    
    // Verificar por palavras relacionadas a investimentos
    const investmentTerms = ['investimento', 'ação', 'ações', 'tesouro direto', 'fundo', 'cdb', 'lci', 'lca', 'aplicação'];
    const categoryNameLower = selectedCategory.name.toLowerCase();
    
    return investmentTerms.some(term => categoryNameLower.includes(term));
  };

  const handleCategoryChange = (e) => {
    const selectedId = e.target.value;
    setCategoryId(selectedId);
    
    // Se o ID foi selecionado, encontrar o nome da categoria correspondente
    if (selectedId && categories && categories.length > 0) {
      const selectedCategory = categories.find(c => c.id.toString() === selectedId);
      if (selectedCategory) {
        setCategory(selectedCategory.name);
        
        // Verificar se é uma categoria de transferência
        const possibleTransferNames = ['transferência', 'transferencia', 'transferências', 'transferencias', 'transfer'];
        const isTransfer = possibleTransferNames.some(name => selectedCategory.name.toLowerCase().includes(name));
        
        if (isTransfer) {
          setIsInternalTransfer(false);
          setDestinationAccountId('');
          setIsInvestment(false);
          setInvestmentAccountId('');
        } 
        // Verificar se é uma categoria de investimento (apenas para despesas)
        else if (transactionType === 'expense') {
          const investmentTerms = ['investimento', 'ação', 'ações', 'tesouro direto', 'fundo', 'cdb', 'lci', 'lca', 'aplicação'];
          const isInvest = investmentTerms.some(term => selectedCategory.name.toLowerCase().includes(term));
          
          setIsInvestment(isInvest);
          if (!isInvest) {
            setInvestmentAccountId('');
          }
        } else {
          setIsInvestment(false);
          setInvestmentAccountId('');
        }
      }
    } else {
      setCategory('');
      setIsInvestment(false);
      setInvestmentAccountId('');
    }
  };



  // Função para garantir que os valores são números
  const ensureNumber = (value) => {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Adicione esta função para controlar o dropdown
  const toggleDropdown = (transactionId) => {
    if (activeDropdown === transactionId) {
      setActiveDropdown(null); // Fecha o dropdown se já estiver aberto
    } else {
      setActiveDropdown(transactionId); // Abre o dropdown específico da transação
    }
  };

  // Função para verificar se uma transação é uma transferência interna
  const isTransferTransaction = (transaction) => {
    // Buscar a categoria da transação
    const category = categories.find(c => c.id === transaction.categoryId);
    
    // Verificar se o nome da categoria contém "transferência" ou "transferencia" (sem acento)
    return category && 
      (category.name.toLowerCase().includes('transfer') || 
      category.name.toLowerCase().includes('transferência') ||
      category.name.toLowerCase().includes('transferencia'));
  };

  // Adicione um event listener para fechar dropdowns quando clicar fora
  useEffect(() => {
    const closeDropdowns = (e) => {
      if (!e.target.closest('.dropdown')) {
        setActiveDropdown(null);
      }
    };
    
    document.addEventListener('click', closeDropdowns);
    return () => document.removeEventListener('click', closeDropdowns);
  }, []);

  // Função para editar transação
  const handleEditTransaction = (transaction) => {
    // Se for uma contribuição, não permitir edição
    if (transaction.isContribution) {
      showNotification('Contribuições não podem ser editadas diretamente. Use a página de Metas.', 'error');
      return;
    }
    
    setEditingTransaction(transaction);
    setTransactionModalOpen(true);
  };
  
  // Função para excluir transação
  const handleDeleteTransaction = async (transaction) => {
    // Se for uma contribuição, não permitir exclusão
    if (transaction.isContribution) {
      showNotification('Contribuições não podem ser excluídas diretamente. Use a página de Metas.', 'error');
      return;
    }
    
    if (window.confirm("Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.")) {
      try {
        await deleteTransaction(transaction.id);
        
        // Recarregar transações
        const transactionsData = await getTransactions();
        
        // Processar os dados para garantir valores numéricos
        const processedTransactions = transactionsData.map(t => {
          const category = categories.find(c => c.id === t.categoryId);
          
          const isTransfer = category && 
            (category.name.toLowerCase().includes('transfer') || 
            category.name.toLowerCase().includes('transferência') ||
            category.name.toLowerCase().includes('transferencia'));
          
          return {
            ...t,
            amount: ensureNumber(t.amount || t.value),
            isTransaction: true,
            isInternalTransfer: isTransfer,
            accountId: t.accountId ? String(t.accountId) : t.accountId // Garantir que accountId seja string
          };
        });
        
        // Atualizar estados
        setTransactions(processedTransactions);
        
        // Combinar com as contribuições existentes
        const combined = [...processedTransactions, ...contributions]
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setCombinedTransactions(combined);
        
        // Aplicar filtros novamente
        applyFilters();
        
        showNotification('Transação excluída com sucesso!');
      } catch (error) {
        console.error("Erro ao excluir transação:", error);
        showNotification('Erro ao excluir transação!', 'error');
      }
    }
  };

  // Renderização condicional para valores monetários
  const renderCurrency = (value) => {
    if (!showBalance) {
      return <span className="text-gray-400 dark:text-gray-500">•••••</span>;
    }
    return formatCurrency(value);
  };

  const [sortBy, setSortBy] = useState('date'); // Opções: 'date', 'amount', 'category'


  // Buscar transações, contas, categorias e contribuições
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Primeiro obter as contas para garantir que isCreditCardAccount funcione corretamente
        const accountsData = await getAccounts();
        setAccounts(accountsData);
        
        // Somente depois buscar o restante dos dados
        const [transactionsData, categoriesData, contributionsData] = await Promise.all([
          getTransactions(),
          getCategories(),
          getContributions()
        ]);

        // Garantir que todos os valores das transações sejam numéricos e identificar transferências
        const processedTransactions = transactionsData.map(t => {
          // Buscar a categoria da transação
          const category = categoriesData.find(c => c.id === t.categoryId);
          
          // Verificar se é uma transferência com base na categoria
          const isTransfer = category && 
            (category.name.toLowerCase().includes('transfer') || 
            category.name.toLowerCase().includes('transferência') ||
            category.name.toLowerCase().includes('transferencia'));
          
          return {
            ...t,
            amount: ensureNumber(t.amount || t.value),
            isTransaction: true,
            isInternalTransfer: isTransfer
          };
        });

        // Transformar contribuições em um formato compatível com transações
        const processedContributions = contributionsData.map(c => ({
          id: `contrib-${c.id}`,
          description: c.notes || 'Contribuição para meta',
          amount: ensureNumber(c.amount),
          date: c.date,
          type: 'expense',
          category: 'Metas',
          accountId: c.accountId,
          budgetId: c.budgetId,
          isContribution: true
        }));

        // Armazenar dados separadamente
        setTransactions(processedTransactions);
        setContributions(processedContributions);
        setCategories(categoriesData);
        
        // Combinar transações e contribuições
        const combined = [...processedTransactions, ...processedContributions]
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setCombinedTransactions(combined);

        // Aplicar os filtros iniciais aos dados carregados
        // Isso garante que apenas as transações dos últimos 30 dias são exibidas
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const today = new Date();
        
        const filteredItems = combined.filter(item => {
          const date = new Date(item.date);
          return date >= thirtyDaysAgo;
        });
        
        setFilteredTransactions(filteredItems);
        
        // Calcular sumários com base nas transações filtradas
        const filteredIncome = filteredItems
          .filter(t => 
            !t.isContribution && 
            t.type === 'income' && 
            !isCreditCardAccount(t.accountId) && 
            !t.isInternalTransfer
          )
          .reduce((sum, t) => sum + ensureNumber(t.amount), 0);
          
        const filteredExpense = filteredItems
          .filter(t => 
            (t.isContribution || t.type === 'expense') && 
            !t.isInternalTransfer // Excluir transferências internas
          )
          .reduce((sum, t) => sum + ensureNumber(t.amount), 0);
                
        setSummary({
          count: filteredItems.length,
          income: filteredIncome,
          expense: filteredExpense
        });

      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setTransactions([]);
        setContributions([]);
        setCombinedTransactions([]);
        setFilteredTransactions([]);
        setAccounts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Adicionar transação
  const handleAddTransaction = async (formData) => {
    try {
      // Verificar se formData é um array (caso de transferência entre contas)
      if (Array.isArray(formData)) {
        // Processar cada transação no array sequencialmente
        for (const transaction of formData) {
          const preparedData = {
            ...transaction,
            amount: ensureNumber(transaction.amount)
          };
          await createTransaction(preparedData);
        }
        showNotification('Transferência entre contas registrada com sucesso!');
      } else {
        // Processar uma única transação (caso normal)
        const preparedData = {
          ...formData,
          amount: ensureNumber(formData.amount)
        };
        
        if (editingTransaction) {
          // Atualizar transação existente
          await updateTransaction(editingTransaction.id, preparedData);
        } else {
          // Criar nova transação
          await createTransaction(preparedData);
        }
        
        showNotification(editingTransaction ? 'Transação atualizada com sucesso!' : 'Transação adicionada com sucesso!');
      }
      
      // Recarregar transações e contribuições
      const [transactionsData, contributionsData] = await Promise.all([
        getTransactions(),
        getContributions()
      ]);
      
      // Processar os dados para garantir valores numéricos e identificar transferências
      const processedTransactions = transactionsData.map(t => {
        // Buscar a categoria da transação
        const category = categories.find(c => c.id === t.categoryId);
        
        // Verificar se é uma transferência com base na categoria
        const isTransfer = category && 
          (category.name.toLowerCase().includes('transfer') || 
          category.name.toLowerCase().includes('transferência') ||
          category.name.toLowerCase().includes('transferencia'));
        
        return {
          ...t,
          amount: ensureNumber(t.amount || t.value),
          isTransaction: true,
          isInternalTransfer: isTransfer
        };
      });

      // Transformar contribuições
      const processedContributions = contributionsData.map(c => ({
        id: `contrib-${c.id}`,
        description: c.notes || 'Contribuição para meta',
        amount: ensureNumber(c.amount),
        date: c.date,
        type: 'expense',
        category: 'Metas',
        accountId: c.accountId,
        budgetId: c.budgetId,
        isContribution: true
      }));
      
      // Atualizar estados
      setTransactions(processedTransactions);
      setContributions(processedContributions);
      
      // Combinar transações e contribuições
      const combined = [...processedTransactions, ...processedContributions]
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setCombinedTransactions(combined);
      
      // Aplicar filtros para atualizar visualização
      applyFilters();
      
      setTransactionModalOpen(false);
      setEditingTransaction(null); // Limpar estado de edição
    } catch (error) {
      console.error(editingTransaction ? "Erro ao atualizar transação:" : "Erro ao adicionar transação:", error);
      showNotification(editingTransaction ? 'Erro ao atualizar transação!' : 'Erro ao adicionar transação!', 'error');
    }
  };

  // Resetar filtros
  const resetFilters = () => {
    setFilterType('all');
    setFilterCategory('');
    setFilterPeriod('last30');
    setFilterAccount('');

    // Resetar datas personalizadas
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    setFilterStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
    setFilterEndDate(new Date().toISOString().split('T')[0]); // Data atual formatada como YYYY-MM-DD
    
    // Atualizar as transações filtradas para mostrar todas
    setFilteredTransactions(combinedTransactions);
    
    // Recalcular o sumário excluindo receitas em contas de cartão de crédito
    const filteredIncome = combinedTransactions
      .filter(t => 
        !t.isContribution && 
        t.type === 'income' && 
        !isCreditCardAccount(t.accountId) && 
        !t.isInternalTransfer
      )
      .reduce((sum, t) => sum + ensureNumber(t.amount), 0);
      
    const filteredExpense = combinedTransactions
      .filter(t => 
      (t.isContribution || t.type === 'expense') &&
      !t.isInternalTransfer // Excluir transferências internas
      )
      .reduce((sum, t) => sum + ensureNumber(t.amount), 0);
    
    // Atualizar o sumário corretamente
    setSummary({
      count: combinedTransactions.length,
      income: filteredIncome,
      expense: filteredExpense
    });
  };

  // Aplicar filtros
  const applyFilters = () => {
    // Função para verificar se uma data está dentro do período selecionado
    const isDateInPeriod = (dateString) => {
      const date = new Date(dateString);
      const today = new Date();
      
      switch (filterPeriod) {
        case 'thisMonth':
          return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
          
        case 'lastMonth': {
          const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
          return date >= lastMonth && date <= lastMonthEnd;
        }
          
        case 'last3Months': {
          const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
          return date >= threeMonthsAgo;
        }

        case 'custom': {
          const startDate = new Date(filterStartDate);
          const endDate = new Date(filterEndDate);
          endDate.setHours(23, 59, 59, 999); // Incluir o final do dia
          return date >= startDate && date <= endDate;
        }
          
        case 'last30':
        default: {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(today.getDate() - 30);
          return date >= thirtyDaysAgo;
        }
      }
    };
    
    // Lógica para filtrar transações e contribuições combinadas
    const filteredItems = combinedTransactions.filter(item => {
      // Filtro por tipo
      if (filterType !== 'all') {
        if (item.isContribution && filterType !== 'expense') return false;
        if (!item.isContribution && item.type !== filterType) return false;
      }
      
      // Filtro por categoria
      if (filterCategory) {
        if (item.isContribution) {
          if (filterCategory !== 'Metas') return false;
        } else {
          if (item.categoryId !== filterCategory) return false;
        }
      }
      
      // Filtro por conta (usando ID da conta)
      if (filterAccount && String(item.accountId) !== String(filterAccount)) {
        return false;
      }

      // Filtro por período - implementação completa
      return isDateInPeriod(item.date);
    });
    
    // Atualizar o estado das transações filtradas
    setFilteredTransactions(filteredItems);
    
    // Atualizar o sumário com base nas transações filtradas
    const filteredIncome = filteredItems
      .filter(t => 
        !t.isContribution && 
        t.type === 'income' && 
        !isCreditCardAccount(t.accountId) &&
        !t.isInternalTransfer // Adicionar esta condição para excluir transferências internas
      )
      .reduce((sum, t) => sum + ensureNumber(t.amount), 0);
      
    const filteredExpense = filteredItems
      .filter(t => 
      (t.isContribution || t.type === 'expense') &&
      !t.isInternalTransfer // Excluir transferências internas
      )
      .reduce((sum, t) => sum + ensureNumber(t.amount), 0);
    
    // Atualizar o sumário para refletir apenas as transações filtradas
    setSummary({
      count: filteredItems.length,
      income: filteredIncome,
      expense: filteredExpense
    });
    
    setFiltersOpen(false);
    // Resetar para primeira página quando filtros são aplicados
    setCurrentPage(1);
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

  // Função segura para calcular o valor das transações este mês
  // Modificada para excluir receitas em contas de cartão de crédito
  const calculateMonthlyTotal = (type) => {
    try {
      // Se for tipo income, apenas considere transações regulares
      if (type === 'income') {
        const total = transactions
          .filter(t => {
            const date = new Date(t.date);
            const today = new Date();
            return date.getMonth() === today.getMonth() && 
                  date.getFullYear() === today.getFullYear() &&
                  t.type === type &&
                  !isCreditCardAccount(t.accountId) && 
                  !t.isInternalTransfer; // Excluir transferências internas
          })
          .reduce((sum, t) => sum + ensureNumber(t.amount), 0);
          
        return showBalance ? total.toFixed(2).replace('.', ',') : '•••••';
      }
      // Se for expense, considere tanto transações regulares quanto contribuições
      else if (type === 'expense') {
        const transactionsTotal = transactions
          .filter(t => {
            const date = new Date(t.date);
            const today = new Date();
            return date.getMonth() === today.getMonth() && 
                  date.getFullYear() === today.getFullYear() &&
                  t.type === type &&
                  !t.isInternalTransfer; // Excluir transferências internas
          })
          .reduce((sum, t) => sum + ensureNumber(t.amount), 0);
          
        const contributionsTotal = contributions
          .filter(c => {
            const date = new Date(c.date);
            const today = new Date();
            return date.getMonth() === today.getMonth() && 
                  date.getFullYear() === today.getFullYear();
          })
          .reduce((sum, c) => sum + ensureNumber(c.amount), 0);
          
        return showBalance ? (transactionsTotal + contributionsTotal).toFixed(2).replace('.', ',') : '•••••';
      }
      
      return showBalance ? "0,00" : '•••••';
    } catch (error) {
      console.error(`Erro ao calcular total mensal para ${type}:`, error);
      return showBalance ? "0,00" : '•••••';
    }
  };

  const sortTransactions = (items, sortType) => {
    const sortedItems = [...items];
    
    switch (sortType) {
      case 'date':
        return sortedItems.sort((a, b) => new Date(b.date) - new Date(a.date));
      case 'amount':
        return sortedItems.sort((a, b) => b.amount - a.amount);
      case 'category':
        return sortedItems.sort((a, b) => {
          // Buscar nomes das categorias para comparação
          const categoryA = a.isContribution ? 'Metas' : 
            (categories.find(c => c.id === a.categoryId)?.name || '');
          const categoryB = b.isContribution ? 'Metas' : 
            (categories.find(c => c.id === b.categoryId)?.name || '');
          return categoryA.localeCompare(categoryB);
        });
      default:
        return sortedItems;
    }
  };  

  const itemsPerPage = 10;
  const sortedTransactions = sortTransactions(filteredTransactions, sortBy);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = sortedTransactions.slice(startIndex, endIndex);
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);

  // Função para lidar com mudanças de ordenação
  const handleSortChange = (e) => {
    const value = e.target.value;
    switch (value) {
      case 'Ordenar por: Data':
        setSortBy('date');
        break;
      case 'Ordenar por: Valor':
        setSortBy('amount');
        break;
      case 'Ordenar por: Categoria':
        setSortBy('category');
        break;
      default:
        setSortBy('date');
    }
  
    // Voltar para a primeira página ao mudar a ordenação
    setCurrentPage(1);
    
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

  return (
    <div className="bg-gray-50 dark:bg-dark-100 min-h-screen transition-theme">
      <Sidebar />
      <Header title="Transações" onMenuClick={() => setMobileMenuOpen(true)} />
      <MobileSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <div className="md:ml-64">
        <div className="p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Transações</h2>
              <p className="text-gray-600 dark:text-gray-300">Todas as suas receitas e despesas em um só lugar</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button 
                onClick={() => setFiltersOpen(!filtersOpen)} 
                className="flex items-center px-4 py-2 border border-gray-300 dark:border-dark-400 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors"
              >
                <i className="fas fa-filter mr-2"></i>
                <span>Filtrar</span>
              </button>
              <button 
                onClick={() => setTransactionModalOpen(true)} 
                className="bg-primary hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
              >
                <i className="fas fa-plus mr-2"></i>
                <span>Adicionar</span>
              </button>
            </div>
          </div>

          {/* Filters panel */}
          {filtersOpen && (
            <div className="bg-white dark:bg-dark-200 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-dark-300 mb-6 transition-theme">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Type filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                  <div className="flex space-x-1">
                    <button 
                      className={`filter-type-btn px-3 py-1 text-sm rounded-lg ${filterType === 'all' ? 'filter-active' : 'bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300'}`}
                      onClick={() => setFilterType('all')}
                    >
                      Todos
                    </button>
                    <button 
                      className={`filter-type-btn px-3 py-1 text-sm rounded-lg ${filterType === 'income' ? 'filter-active' : 'bg-green-50 dark:bg-green-900 dark:bg-opacity-20 text-green-700 dark:text-green-400'}`}
                      onClick={() => setFilterType('income')}
                    >
                      Receitas
                    </button>
                    <button 
                      className={`filter-type-btn px-3 py-1 text-sm rounded-lg ${filterType === 'expense' ? 'filter-active' : 'bg-red-50 dark:bg-red-900 dark:bg-opacity-20 text-red-700 dark:text-red-400'}`}
                      onClick={() => setFilterType('expense')}
                    >
                      Despesas
                    </button>
                  </div>
                </div>
                
                {/* Category filter - com categoria especial "Metas" */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
                  <select 
                    className="block w-full rounded-lg border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-800 dark:text-white shadow-sm focus:border-primary focus:ring-primary dark:focus:ring-indigo-600 transition-theme"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="">Todas categorias</option>
                    <option value="Metas">Metas</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Date range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Período</label>
                  <select 
                    className="block w-full rounded-lg border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-800 dark:text-white shadow-sm focus:border-primary focus:ring-primary dark:focus:ring-indigo-600 transition-theme"
                    value={filterPeriod}
                    onChange={(e) => setFilterPeriod(e.target.value)}
                  >
                    <option value="last30">Últimos 30 dias</option>
                    <option value="thisMonth">Este mês</option>
                    <option value="lastMonth">Mês passado</option>
                    <option value="last3Months">Últimos 3 meses</option>
                    <option value="custom">Personalizado</option>
                  </select>

                  {/* Campos de data personalizados que aparecem apenas quando "custom" é selecionado */}
                  {filterPeriod === 'custom' && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">Data início</label>
                        <input
                          type="date"
                          value={filterStartDate}
                          onChange={(e) => setFilterStartDate(e.target.value)}
                          className="block w-full rounded-lg border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-800 dark:text-white text-sm shadow-sm focus:border-primary focus:ring-primary dark:focus:ring-indigo-600 transition-theme"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">Data fim</label>
                        <input
                          type="date"
                          value={filterEndDate}
                          onChange={(e) => setFilterEndDate(e.target.value)}
                          className="block w-full rounded-lg border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-800 dark:text-white text-sm shadow-sm focus:border-primary focus:ring-primary dark:focus:ring-indigo-600 transition-theme"
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Account filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Conta</label>
                  <select 
                    className="block w-full rounded-lg border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-800 dark:text-white shadow-sm focus:border-primary focus:ring-primary dark:focus:ring-indigo-600 transition-theme"
                    value={filterAccount}
                    onChange={(e) => setFilterAccount(e.target.value)}
                  >
                    <option value="">Todas contas</option>
                    {accounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.name} {account.bankName ? `(${account.bankName})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end space-x-3">
                <button 
                  onClick={resetFilters}
                  className="px-4 py-2 border border-gray-300 dark:border-dark-400 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors"
                >
                  Limpar
                </button>
                <button 
                  onClick={applyFilters}
                  className="px-4 py-2 bg-primary dark:bg-indigo-700 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-800 transition-colors"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          )}

          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Total transactions */}
            <div className="bg-white dark:bg-dark-200 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-dark-300 transition-theme">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Transações</p>
                  <h3 className="text-2xl font-bold mt-1 text-gray-800 dark:text-white">{summary.count}</h3>
                </div>
                <div className="bg-indigo-100 dark:bg-indigo-900 dark:bg-opacity-30 p-3 rounded-lg">
                  <i className="fas fa-exchange-alt text-indigo-600 dark:text-indigo-400"></i>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-dark-300">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Este mês</span>
                  <span className="text-primary dark:text-indigo-400 font-medium">
                    {combinedTransactions.filter(item => {
                      const date = new Date(item.date);
                      const today = new Date();
                      return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
                    }).length} transações
                  </span>
                </div>
              </div>
            </div>
            
            {/* Income summary */}
            <div className="bg-white dark:bg-dark-200 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-dark-300 transition-theme">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receitas</p>
                  <h3 className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">
                    {renderCurrency(summary.income)}
                  </h3>
                </div>
                <div className="bg-green-100 dark:bg-green-900 dark:bg-opacity-30 p-3 rounded-lg">
                  <i className="fas fa-arrow-up text-green-600 dark:text-green-400"></i>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-dark-300">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Este mês</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    + {showBalance ? 'R$ ' + calculateMonthlyTotal('income') : <span className="text-gray-400 dark:text-gray-500">•••••</span>}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Expense summary */}
            <div className="bg-white dark:bg-dark-200 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-dark-300 transition-theme">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Despesas</p>
                  <h3 className="text-2xl font-bold mt-1 text-red-600 dark:text-red-400">
                    {renderCurrency(summary.expense)}
                  </h3>
                </div>
                <div className="bg-red-100 dark:bg-red-900 dark:bg-opacity-30 p-3 rounded-lg">
                  <i className="fas fa-arrow-down text-red-600 dark:text-red-400"></i>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-dark-300">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Este mês</span>
                  <span className="text-red-600 dark:text-red-400 font-medium">
                    - {showBalance ? 'R$ ' + calculateMonthlyTotal('expense') : <span className="text-gray-400 dark:text-gray-500">•••••</span>}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions table */}
          <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-300 overflow-hidden transition-theme">
            {/* Table header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-dark-300 flex flex-col md:flex-row justify-between items-start md:items-center">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2 md:mb-0">Histórico de Transações</h3>
              
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <select 
                    className="appearance-none bg-white dark:bg-dark-300 border border-gray-300 dark:border-dark-400 rounded-lg pl-3 pr-8 py-2 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-indigo-600 focus:border-transparent transition-theme"
                    onChange={handleSortChange}
                    value={`Ordenar por: ${sortBy === 'date' ? 'Data' : sortBy === 'amount' ? 'Valor' : 'Categoria'}`}
                  >
                    <option>Ordenar por: Data</option>
                    <option>Ordenar por: Valor</option>
                    <option>Ordenar por: Categoria</option>
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
            
            {/* Table content */}
            <div className="divide-y divide-gray-100 dark:divide-dark-300">
              {filteredTransactions.length > 0 ? (
                paginatedTransactions.map(item => {
                  // Determinar se é uma transação ou contribuição
                  const isContribution = item.isContribution;
                  
                  // Buscar dados relacionados
                  const category = isContribution 
                    ? { name: 'Metas', icon: 'bullseye', color: 'blue' }
                    : (categories.find(c => c.id === item.categoryId) || {});
                    
                  const account = accounts.find(a => a.id === item.accountId) || {};
                  
                  // Verificar se é uma entrada em conta de cartão de crédito (não deve contar como receita real)
                  const isCreditCardIncome = item.type === 'income' && isCreditCardAccount(item.accountId);
                  
                  // Definir estilo com base no tipo de transação, considerando pagamentos de cartão
                  let transactionColorClass = 'text-gray-600 dark:text-gray-400'; // Padrão
                  
                  if (isContribution) {
                    transactionColorClass = 'text-blue-600 dark:text-blue-400';
                  } else if (item.type === 'income' && !isCreditCardIncome) {
                    transactionColorClass = 'text-green-600 dark:text-green-400';
                  } else if (item.type === 'expense') {
                    transactionColorClass = 'text-red-600 dark:text-red-400';
                  } else if (isCreditCardIncome) {
                    // Para entradas em cartão de crédito (pagamentos de fatura)
                    transactionColorClass = 'text-purple-600 dark:text-purple-400';
                  }
                  
                  return (
                    <div key={item.id} className="transaction-card hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors">
                      <div className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`${isContribution ? 'bg-blue-100 dark:bg-blue-900 dark:bg-opacity-30' : 
                                          isCreditCardIncome ? 'bg-purple-100 dark:bg-purple-900 dark:bg-opacity-30' :
                                          item.type === 'income' ? 'bg-green-100 dark:bg-green-900 dark:bg-opacity-30' : 
                                          'bg-red-100 dark:bg-red-900 dark:bg-opacity-30'} p-3 rounded-lg mr-4`}>
                            <i className={`fas ${
                              isContribution ? 'fa-bullseye' :
                              isCreditCardIncome ? 'fa-credit-card' :
                              category.icon ? (category.icon.startsWith('fa-') ? category.icon : `fa-${category.icon}`) : 
                              category.name === 'Alimentação' ? 'fa-shopping-bag' :
                              category.name === 'Moradia' ? 'fa-home' :
                              category.name === 'Transporte' ? 'fa-car' :
                              category.name === 'Lazer' ? 'fa-utensils' :
                              category.name === 'Rendimento' ? 'fa-money-bill-wave' :
                              'fa-tag'
                            } ${transactionColorClass}`}></i>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800 dark:text-white">
                              {item.description}
                              {isCreditCardIncome && <span className="text-xs text-purple-500 ml-2">(Pagamento de fatura)</span>}
                              {item.isInternalTransfer && <span className="text-xs text-indigo-500 ml-2">(Transferência interna)</span>}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {!isContribution && item.place && `${item.place} • `}
                              {formatDate(item.date)}
                            </p>
                          </div>
                        </div>

                        <div className="text-right flex items-center">
                          <p className={`font-medium ${transactionColorClass} mr-4`}>
                            {isContribution || item.type === 'expense' ? '- ' : '+ '}
                            {renderCurrency(item.amount)}
                          </p>

                          {/* Dropdown Menu */}
                          <div className="dropdown relative">
                            <button 
                              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none transition-colors" 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleDropdown(item.id);
                              }}
                            >
                              <i className="fas fa-ellipsis-v"></i>
                            </button>
                            <div className={`dropdown-menu absolute right-0 mt-2 w-40 bg-white dark:bg-dark-200 rounded-md shadow-lg z-10 ${activeDropdown === item.id ? 'block' : 'hidden'}`}>
                              {!isContribution && (
                                <button 
                                  onClick={() => handleEditTransaction(item)} 
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors"
                                >
                                  <i className="fas fa-edit mr-2"></i> Editar
                                </button>
                              )}
                              <button 
                                onClick={() => handleDeleteTransaction(item)} 
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors"
                              >
                                <i className="fas fa-trash-alt mr-2"></i> Excluir
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end mt-1 px-6 pb-3">
                        <span className={`px-2 py-1 ${
                          isContribution ? 'bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 text-blue-600 dark:text-blue-400' :
                          category.color ? `bg-${category.color}-50 dark:bg-${category.color}-900 dark:bg-opacity-20 text-${category.color}-600 dark:text-${category.color}-400` :
                          category.name === 'Alimentação' ? 'bg-red-50 dark:bg-red-900 dark:bg-opacity-20 text-red-600 dark:text-red-400' :
                          category.name === 'Moradia' ? 'bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 text-blue-600 dark:text-blue-400' :
                          category.name === 'Transporte' ? 'bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20 text-purple-600 dark:text-purple-400' :
                          category.name === 'Lazer' ? 'bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 text-yellow-600 dark:text-yellow-400' :
                          category.name === 'Rendimento' ? 'bg-green-50 dark:bg-green-900 dark:bg-opacity-20 text-green-600 dark:text-green-400' :
                          'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                        } text-xs rounded-full mr-2`}>
                          {isContribution ? 'Metas' : category.name || item.category || 'Sem categoria'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {account.name || item.account || 'Conta padrão'}
                          {isCreditCardAccount(item.accountId) && <span className="ml-1">(Cartão)</span>}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="px-6 py-12 text-center">
                  <i className="fas fa-receipt text-gray-300 dark:text-gray-600 text-5xl mb-4"></i>
                  <p className="text-gray-500 dark:text-gray-400">Nenhuma transação encontrada com os filtros selecionados.</p>
                  <button 
                    onClick={resetFilters}
                    className="mt-4 px-4 py-2 bg-gray-200 dark:bg-dark-300 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-dark-400 mr-2 transition-colors"
                  >
                  Limpar Filtros
                  </button>
                  <button 
                    onClick={() => setTransactionModalOpen(true)}
                    className="mt-4 px-4 py-2 bg-primary dark:bg-indigo-700 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-800 transition-colors"
                  >
                    Adicionar nova transação
                  </button>
                </div>
              )}
            </div>
            
            {/* Table footer - Paginação ajustada para o total de páginas calculado */}
            {filteredTransactions.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-100 dark:border-dark-300 flex flex-col md:flex-row justify-between items-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 md:mb-0">
                  Mostrando {startIndex + 1} a {Math.min(endIndex, filteredTransactions.length)} de {filteredTransactions.length} transações
                </p>
                <div className="flex space-x-2">
                  <button 
                    className={`px-3 py-1 border border-gray-300 dark:border-dark-400 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-300 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''} transition-colors`}
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  
                  {/* Geração dinâmica dos números de página */}
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    // Se temos muitas páginas, mostrar páginas ao redor da atual
                    let pageNum = i + 1;
                    if (totalPages > 5) {
                      if (currentPage > 3) {
                        pageNum = i + currentPage - 2;
                        
                        // Se estamos perto do fim, ajustar
                        if (pageNum > totalPages - 4 && i < 5) {
                          pageNum = totalPages - 4 + i;
                        }
                      }
                    }
                    
                    // Não mostrar números de página além do total
                    if (pageNum <= totalPages) {
                      return (
                        <button 
                          key={pageNum}
                          className={`px-3 py-1 border border-gray-300 dark:border-dark-400 rounded-lg ${currentPage === pageNum ? 'bg-primary dark:bg-indigo-700 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-300'} transition-colors`}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    return null;
                  })}
                  
                  <button 
                    className={`px-3 py-1 border border-gray-300 dark:border-dark-400 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-300 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''} transition-colors`}
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Passa contas, categorias e funções de formatação para o modal */}
      <TransactionModal 
        isOpen={transactionModalOpen}
        onClose={() => {
          setTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleAddTransaction}
        transaction={editingTransaction}
        accounts={accounts}
        categories={categories}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
      />
    </div>
  );
};

export default Transactions;