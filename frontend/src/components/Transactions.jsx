import React, { useState, useEffect } from 'react';
import { getTransactions, createTransaction, getAccounts, getCategories } from '../services/api';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';
import MobileSidebar from './layout/MobileSidebar';
import TransactionModal from './modals/TransactionModal';

const Transactions = () => {
  // Estados
  const [transactions, setTransactions] = useState([]);
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
  
  // Sumários
  const [summary, setSummary] = useState({
    count: 0,
    income: 0,
    expense: 0
  });

  // Função para garantir que os valores são números
  const ensureNumber = (value) => {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Buscar transações, contas e categorias
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [transactionsData, accountsData, categoriesData] = await Promise.all([
          getTransactions(),
          getAccounts(),
          getCategories()
        ]);

        // Garantir que todos os valores das transações sejam numéricos
        const processedTransactions = transactionsData.map(t => ({
          ...t,
          amount: ensureNumber(t.amount || t.value) // Tenta amount primeiro, depois value
        }));

        setTransactions(processedTransactions);
        setAccounts(accountsData);
        setCategories(categoriesData);
        
        // Calcular sumários com segurança
        const totalIncome = processedTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + ensureNumber(t.amount), 0);
          
        const totalExpense = processedTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + ensureNumber(t.amount), 0);
          
        setSummary({
          count: processedTransactions.length,
          income: totalIncome,
          expense: totalExpense
        });
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        // Em caso de erro, podemos definir dados vazios ou mock
        setTransactions([]);
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
      // Garantir que amount seja um número
      const preparedData = {
        ...formData,
        amount: ensureNumber(formData.amount)
      };
      
      await createTransaction(preparedData);
      
      // Recarregar transações
      const data = await getTransactions();
      
      // Processar os dados para garantir valores numéricos
      const processedData = data.map(t => ({
        ...t,
        amount: ensureNumber(t.amount || t.value)
      }));
      
      setTransactions(processedData);
      
      // Atualizar sumários com segurança
      const totalIncome = processedData
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + ensureNumber(t.amount), 0);
        
      const totalExpense = processedData
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + ensureNumber(t.amount), 0);
        
      setSummary({
        count: processedData.length,
        income: totalIncome,
        expense: totalExpense
      });
      
      setTransactionModalOpen(false);
      showNotification('Transação adicionada com sucesso!');
    } catch (error) {
      console.error("Error adding transaction:", error);
      showNotification('Erro ao adicionar transação!', 'error');
    }
  };

  // Resetar filtros
  const resetFilters = () => {
    setFilterType('all');
    setFilterCategory('');
    setFilterPeriod('last30');
    setFilterAccount('');
  };

  // Aplicar filtros
  const applyFilters = () => {
    // Lógica para filtrar transações
    const filteredTransactions = transactions.filter(transaction => {
      // Filtro por tipo
      if (filterType !== 'all' && transaction.type !== filterType) {
        return false;
      }
      
      // Filtro por categoria (usando ID da categoria)
      if (filterCategory && transaction.categoryId !== filterCategory) {
        return false;
      }
      
      // Filtro por conta (usando ID da conta)
      if (filterAccount && transaction.accountId !== filterAccount) {
        return false;
      }
      
      // Filtro por período
      if (filterPeriod === 'thisMonth') {
        const date = new Date(transaction.date);
        const today = new Date();
        if (date.getMonth() !== today.getMonth() || date.getFullYear() !== today.getFullYear()) {
          return false;
        }
      }
      // Adicione outros filtros de período conforme necessário
      
      return true;
    });
    
    // Aqui poderia atualizar um estado de transações filtradas
    // Por enquanto apenas fechamos o painel de filtros
    setFiltersOpen(false);
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
  const calculateMonthlyTotal = (type) => {
    try {
      const total = transactions
        .filter(t => {
          const date = new Date(t.date);
          const today = new Date();
          return date.getMonth() === today.getMonth() && 
                date.getFullYear() === today.getFullYear() &&
                t.type === type;
        })
        .reduce((sum, t) => sum + ensureNumber(t.amount), 0);
        
      return total.toFixed(2).replace('.', ',');
    } catch (error) {
      console.error(`Erro ao calcular total mensal para ${type}:`, error);
      return "0,00";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar />
      <Header title="Transações" onMenuClick={() => setMobileMenuOpen(true)} />
      <MobileSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <div className="md:ml-64">
        <div className="p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Transações</h2>
              <p className="text-gray-600">Todas as suas receitas e despesas em um só lugar</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button 
                onClick={() => setFiltersOpen(!filtersOpen)} 
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <i className="fas fa-filter mr-2"></i>
                <span>Filtrar</span>
              </button>
              <button 
                onClick={() => setTransactionModalOpen(true)} 
                className="bg-primary hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <i className="fas fa-plus mr-2"></i>
                <span>Adicionar</span>
              </button>
            </div>
          </div>

          {/* Filters panel */}
          {filtersOpen && (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Type filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <div className="flex space-x-1">
                    <button 
                      className={`filter-type-btn px-3 py-1 text-sm rounded-lg ${filterType === 'all' ? 'filter-active' : 'bg-gray-100 text-gray-700'}`}
                      onClick={() => setFilterType('all')}
                    >
                      Todos
                    </button>
                    <button 
                      className={`filter-type-btn px-3 py-1 text-sm rounded-lg ${filterType === 'income' ? 'filter-active' : 'bg-green-50 text-green-700'}`}
                      onClick={() => setFilterType('income')}
                    >
                      Receitas
                    </button>
                    <button 
                      className={`filter-type-btn px-3 py-1 text-sm rounded-lg ${filterType === 'expense' ? 'filter-active' : 'bg-red-50 text-red-700'}`}
                      onClick={() => setFilterType('expense')}
                    >
                      Despesas
                    </button>
                  </div>
                </div>
                
                {/* Category filter - MODIFICADO para usar dados dinâmicos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select 
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="">Todas categorias</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Date range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
                  <select 
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    value={filterPeriod}
                    onChange={(e) => setFilterPeriod(e.target.value)}
                  >
                    <option value="last30">Últimos 30 dias</option>
                    <option value="thisMonth">Este mês</option>
                    <option value="lastMonth">Mês passado</option>
                    <option value="last3Months">Últimos 3 meses</option>
                    <option value="custom">Personalizado</option>
                  </select>
                </div>
                
                {/* Account filter - MODIFICADO para usar dados dinâmicos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Conta</label>
                  <select 
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
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
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Limpar
                </button>
                <button 
                  onClick={applyFilters}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          )}

          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Total transactions */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Transações</p>
                  <h3 className="text-2xl font-bold mt-1">{summary.count}</h3>
                </div>
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <i className="fas fa-exchange-alt text-indigo-600"></i>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Este mês</span>
                  <span className="text-primary font-medium">
                    {transactions.filter(t => {
                      const date = new Date(t.date);
                      const today = new Date();
                      return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
                    }).length} transações
                  </span>
                </div>
              </div>
            </div>
            
            {/* Income summary */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Receitas</p>
                  <h3 className="text-2xl font-bold mt-1 text-green-600">
                    R$ {ensureNumber(summary.income).toFixed(2).replace('.', ',')}
                  </h3>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <i className="fas fa-arrow-up text-green-600"></i>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Este mês</span>
                  <span className="text-green-600 font-medium">
                    + R$ {calculateMonthlyTotal('income')}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Expense summary */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Despesas</p>
                  <h3 className="text-2xl font-bold mt-1 text-red-600">
                    R$ {ensureNumber(summary.expense).toFixed(2).replace('.', ',')}
                  </h3>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <i className="fas fa-arrow-down text-red-600"></i>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Este mês</span>
                  <span className="text-red-600 font-medium">
                    - R$ {calculateMonthlyTotal('expense')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Table header */}
            <div className="px-6 py-4 border-b flex flex-col md:flex-row justify-between items-start md:items-center">
              <h3 className="font-semibold text-gray-800 mb-2 md:mb-0">Histórico de Transações</h3>
              
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <select className="appearance-none bg-white border border-gray-300 rounded-lg pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option>Ordenar por: Data</option>
                    <option>Ordenar por: Valor</option>
                    <option>Ordenar por: Categoria</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <i className="fas fa-chevron-down text-xs"></i>
                  </div>
                </div>
                
                <button className="p-2 rounded-lg hover:bg-gray-100">
                  <i className="fas fa-download text-gray-500"></i>
                </button>
              </div>
            </div>
            
            {/* Table content */}
            <div className="divide-y divide-gray-100">
              {transactions.length > 0 ? (
                transactions.map(transaction => {
                  // Buscar dados relacionados (se estiverem disponíveis)
                  const category = categories.find(c => c.id === transaction.categoryId) || {};
                  const account = accounts.find(a => a.id === transaction.accountId) || {};
                  
                  return (
                    <div key={transaction.id} className="transaction-card hover:bg-gray-50">
                      <div className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'} p-3 rounded-lg mr-4`}>
                            <i className={`${
                              category.icon ? `fas ${category.icon}` : 
                              category.name === 'Alimentação' ? 'fas fa-shopping-bag' :
                              category.name === 'Moradia' ? 'fas fa-home' :
                              category.name === 'Transporte' ? 'fas fa-car' :
                              category.name === 'Lazer' ? 'fas fa-utensils' :
                              category.name === 'Rendimento' ? 'fas fa-money-bill-wave' :
                              'fas fa-tag'
                            } ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}></i>
                          </div>
                          <div>
                            <h4 className="font-medium">{transaction.description}</h4>
                            <p className="text-sm text-gray-500">
                              {transaction.place && `${transaction.place} • `}
                              {new Date(transaction.date).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type === 'income' ? '+' : '-'} R$ {ensureNumber(transaction.amount).toFixed(2).replace('.', ',')}
                          </p>
                          <div className="flex items-center justify-end mt-1">
                            <span className={`px-2 py-1 ${
                              category.color ? `bg-${category.color}-50 text-${category.color}-600` :
                              category.name === 'Alimentação' ? 'bg-red-50 text-red-600' :
                              category.name === 'Moradia' ? 'bg-blue-50 text-blue-600' :
                              category.name === 'Transporte' ? 'bg-purple-50 text-purple-600' :
                              category.name === 'Lazer' ? 'bg-yellow-50 text-yellow-600' :
                              category.name === 'Rendimento' ? 'bg-green-50 text-green-600' :
                              'bg-gray-50 text-gray-600'
                            } text-xs rounded-full mr-2`}>
                              {category.name || transaction.category || 'Sem categoria'}
                            </span>
                            <span className="text-xs text-gray-500">{account.name || transaction.account || 'Conta padrão'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="px-6 py-12 text-center">
                  <i className="fas fa-receipt text-gray-300 text-5xl mb-4"></i>
                  <p className="text-gray-500">Nenhuma transação encontrada.</p>
                  <button 
                    onClick={() => setTransactionModalOpen(true)}
                    className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700"
                  >
                    Adicionar sua primeira transação
                  </button>
                </div>
              )}
            </div>
            
            {/* Table footer */}
            {transactions.length > 0 && (
              <div className="px-6 py-4 border-t flex flex-col md:flex-row justify-between items-center">
                <p className="text-sm text-gray-500 mb-2 md:mb-0">Mostrando {transactions.length} de {summary.count} transações</p>
                <div className="flex space-x-2">
                  <button 
                    className={`px-3 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  {[1, 2, 3].map(page => (
                    <button 
                      key={page}
                      className={`px-3 py-1 border border-gray-300 rounded-lg ${currentPage === page ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button 
                    className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Passa contas e categorias para o TransactionModal */}
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

export default Transactions;