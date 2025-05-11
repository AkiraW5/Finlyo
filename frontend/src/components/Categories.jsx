import React, { useEffect, useState } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory, getTransactions } from '../services/api';
import { useUserSettingsContext } from '../contexts/UserSettingsContext';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';
import MobileSidebar from './layout/MobileSidebar';
import CategoryModal from './modals/CategoryModal';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('expense');
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [monthlyCategoryAmounts, setMonthlyCategoryAmounts] = useState({});
    
    // Obter preferências do usuário através do contexto
    const { 
        settings, 
        formatCurrency, 
        formatDate, 
        showBalance 
    } = useUserSettingsContext();

    useEffect(() => {
        fetchCategories();
        fetchTransactions();
    }, []);

    // Controle de dropdown para os 3 pontinhos de ações
    const toggleDropdown = (categoryId) => {
        if (activeDropdown === categoryId) {
            setActiveDropdown(null); // Fecha o dropdown se já estiver aberto
        } else {
            setActiveDropdown(categoryId); // Abre o dropdown específico da categoria
        }
    };

    // Event listener para fechar os dropdowns quando clicar fora
    useEffect(() => {
        const closeDropdowns = (e) => {
            if (!e.target.closest('.dropdown')) {
                setActiveDropdown(null);
            }
        };
        
        document.addEventListener('click', closeDropdowns);
        return () => document.removeEventListener('click', closeDropdowns);
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const data = await getCategories();
            setCategories(data);
            setError(null);
        } catch (error) {
            console.error('Erro ao buscar categorias:', error);
            setError('Falha ao carregar categorias. Tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactions = async () => {
        try {
            // Buscar todas as transações
            const transactionsData = await getTransactions();
            setTransactions(transactionsData);
            
            // Filtrar apenas as 5 transações mais recentes para exibir
            updateRecentTransactions(transactionsData);
            
            // Calcular os gastos/rendimentos mensais por categoria
            calculateMonthlyCategoryAmounts(transactionsData);
        } catch (error) {
            console.error('Erro ao buscar transações:', error);
        }
    };
    
    // Calcular os valores mensais por categoria
    const calculateMonthlyCategoryAmounts = (transactionsData) => {
        if (!transactionsData || transactionsData.length === 0) {
            setMonthlyCategoryAmounts({});
            return;
        }
        
        // Obter o primeiro dia do mês atual
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        // Filtrar transações do mês atual
        const currentMonthTransactions = transactionsData.filter(
            transaction => new Date(transaction.date) >= firstDayOfMonth
        );
        
        // Calcular total por categoria
        const categoryAmounts = {};
        
        currentMonthTransactions.forEach(transaction => {
            const { category, amount, type } = transaction;
            
            // Se a categoria não existe no objeto, inicializá-la
            if (!categoryAmounts[category]) {
                categoryAmounts[category] = {
                    expense: 0,
                    income: 0
                };
            }
            
            // Adicionar valor à categoria correspondente
            if (type === 'expense') {
                categoryAmounts[category].expense += parseFloat(amount) || 0;
            } else if (type === 'income') {
                categoryAmounts[category].income += parseFloat(amount) || 0;
            }
        });
        
        setMonthlyCategoryAmounts(categoryAmounts);
        return categoryAmounts;
    };
    
    // Obter o valor mensal para uma categoria específica
    const getMonthlyCategoryAmount = (categoryName, type) => {
        if (!monthlyCategoryAmounts[categoryName]) return 0;
        
        return type === 'expense' 
            ? monthlyCategoryAmounts[categoryName].expense 
            : monthlyCategoryAmounts[categoryName].income;
    };
    
    // Atualiza a lista de transações recentes baseado no tipo atual (expense/income)
    const updateRecentTransactions = (transactionsData) => {
        if (!transactionsData || transactionsData.length === 0) {
            setRecentTransactions([]);
            return;
        }
        
        // Filtrar por tipo atual selecionado na tab
        const filteredTransactions = transactionsData.filter(
            transaction => transaction.type === activeTab
        );
        
        // Ordenar por data (mais recentes primeiro) e pegar apenas as 5 primeiras
        const recent = filteredTransactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
            
        setRecentTransactions(recent);
    };
    
    // Ao mudar a tab, atualizar as transações recentes
    useEffect(() => {
        if (transactions.length > 0) {
            updateRecentTransactions(transactions);
        }
    }, [activeTab]);

    const handleSaveCategory = async (categoryData) => {
        try {
            let updatedCategories;
            
            if (editingCategory) {
                await updateCategory(editingCategory.id, categoryData);
                updatedCategories = categories.map(cat => 
                    cat.id === editingCategory.id ? {...categoryData, id: cat.id} : cat
                );
                showNotification('Categoria atualizada com sucesso!');
            } else {
                const newCategory = await createCategory(categoryData);
                updatedCategories = [...categories, newCategory];
                showNotification('Categoria criada com sucesso!');
            }
            
            setCategories(updatedCategories);
            setCategoryModalOpen(false);
            setEditingCategory(null);
        } catch (error) {
            console.error("Erro ao salvar categoria:", error);
            showNotification('Erro ao salvar categoria!', 'error');
        }
    };

    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setCategoryModalOpen(true);
    };

    const handleDeleteCategory = async (id) => {
        if (window.confirm("Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.")) {
            try {
                await deleteCategory(id);
                setCategories(categories.filter(cat => cat.id !== id));
                showNotification('Categoria excluída com sucesso!');
            } catch (error) {
                console.error("Erro ao excluir categoria:", error);
                showNotification('Erro ao excluir categoria!', 'error');
            }
        }
    };

    // Função auxiliar para mostrar notificações
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

    // Filtrar categorias pelo tipo ativo na tab
    const filteredCategories = categories.filter(cat => cat.type === activeTab);

    // Obter ícone para categoria
    const getCategoryIcon = (category) => {
        const iconMap = {
            'Alimentação': 'utensils',
            'Moradia': 'home',
            'Transporte': 'car',
            'Lazer': 'film',
            'Saúde': 'heartbeat',
            'Educação': 'graduation-cap',
            'Rendimento': 'money-bill-wave',
            'Investimento': 'piggy-bank',
            'Presente': 'gift',
            'Outros': 'tag'
        };
        
        return iconMap[category.name] || iconMap[category] || 'tag';
    };
    
    // Obter classe de fundo para categoria
    const getCategoryBgClass = (type) => {
        return type === 'income' ? 'income-bg' : 'expense-bg';
    };

    // Renderização condicional para exibir valores
    const renderAmount = (amount) => {
        // Se usuário não quer ver valores
        if (!showBalance) {
            return <span className="privacy-mask">•••••</span>;
        }
        
        return formatCurrency(amount);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-dark-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Carregando...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 dark:bg-dark-100 min-h-screen">
            <Sidebar />
            <Header title="Categorias" onMenuClick={() => setMobileMenuOpen(true)} />
            <MobileSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

            <div className="md:ml-64">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Categorias</h2>
                            <p className="text-gray-600 dark:text-gray-300">Organize suas receitas e despesas por categorias</p>
                        </div>
                        <div className="mt-4 md:mt-0 flex space-x-3">
                            <button 
                                onClick={() => {setEditingCategory(null); setCategoryModalOpen(true);}}
                                className="btn btn-primary"
                            >
                                <i className="fas fa-plus mr-2"></i>
                                <span>Nova Categoria</span>
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 dark:border-dark-300 mb-6">
                        <button 
                            onClick={() => setActiveTab('expense')}
                            className={`px-4 py-2 font-medium text-sm border-b-2 ${
                                activeTab === 'expense' 
                                    ? 'border-red-500 text-red-600 dark:text-red-400' 
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            Despesas
                        </button>
                        <button 
                            onClick={() => setActiveTab('income')}
                            className={`px-4 py-2 font-medium text-sm border-b-2 ${
                                activeTab === 'income' 
                                    ? 'border-green-500 text-green-600 dark:text-green-400' 
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            Receitas
                        </button>
                    </div>

                    {/* Categories grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                        {filteredCategories.length > 0 ? (
                            filteredCategories.map(category => (
                                <div key={category.id} className="card transition-theme">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`${
                                            activeTab === 'expense' 
                                                ? 'bg-red-100 dark:bg-red-900 dark:bg-opacity-30 text-red-600 dark:text-red-400' 
                                                : 'bg-green-100 dark:bg-green-900 dark:bg-opacity-30 text-green-600 dark:text-green-400'
                                            } p-3 rounded-lg`}>
                                            <i className={`fas fa-${getCategoryIcon(category)}`}></i>
                                        </div>
                                        <div className="dropdown relative">
                                            <button 
                                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleDropdown(category.id);
                                                }}
                                            >
                                                <i className="fas fa-ellipsis-v"></i>
                                            </button>
                                            <div className={`dropdown-menu absolute right-0 mt-2 w-40 bg-white dark:bg-dark-200 rounded-md shadow-lg z-10 ${activeDropdown === category.id ? 'block' : 'hidden'}`}>
                                                <button 
                                                    onClick={() => handleEditCategory(category)}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-300"
                                                >
                                                    Editar
                                                </button>
                                                <a 
                                                    href={`/transactions?category=${category.id}`}
                                                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-300"
                                                >
                                                    Transações
                                                </a>
                                                <button 
                                                    onClick={() => handleDeleteCategory(category.id)}
                                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-dark-300"
                                                >
                                                    Excluir
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <h4 className="font-semibold text-gray-800 dark:text-white mb-1">{category.name}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{category.description || 'Sem descrição'}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400 text-sm">
                                            {category.type === 'expense' ? 'Gasto mensal' : 'Rendimento mensal'}
                                        </span>
                                        <span className={`font-semibold ${
                                            category.type === 'expense' 
                                                ? 'text-red-600 dark:text-red-400' 
                                                : 'text-green-600 dark:text-green-400'
                                        }`}>
                                            {renderAmount(getMonthlyCategoryAmount(category.name, category.type))}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-8 text-center text-gray-500 dark:text-gray-400">
                                <i className="fas fa-tags text-gray-300 dark:text-gray-600 text-5xl mb-4"></i>
                                <p>Nenhuma categoria de {activeTab === 'expense' ? 'despesa' : 'receita'} encontrada.</p>
                            </div>
                        )}
                        
                        {/* Add new category card */}
                        <div 
                            onClick={() => {setEditingCategory(null); setCategoryModalOpen(true);}}
                            className="flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-dark-300 rounded-xl p-5 hover:border-primary dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900 dark:hover:bg-opacity-20 transition-all duration-200 cursor-pointer"
                        >
                            <div className="text-center">
                                <div className="mx-auto bg-indigo-100 dark:bg-indigo-900 dark:bg-opacity-50 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                                    <i className="fas fa-plus text-primary dark:text-indigo-400 text-xl"></i>
                                </div>
                                <h4 className="font-semibold text-gray-800 dark:text-white">Nova categoria</h4>
                            </div>
                        </div>
                    </div>

                    {/* Recent transactions by category */}
                    <div className="panel">
                        {/* Table header */}
                        <div className="panel-header">
                            <h3 className="font-semibold text-gray-800 dark:text-white mb-2 md:mb-0">
                                Transações Recentes - {activeTab === 'expense' ? 'Despesas' : 'Receitas'}
                            </h3>
                            <a href="/transactions" className="text-primary dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium">Ver todas</a>
                        </div>
                        
                        {/* Table content */}
                        <div className="divide-y divide-gray-100 dark:divide-dark-300">
                            {recentTransactions.length > 0 ? (
                                recentTransactions.map(transaction => (
                                    <div key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-dark-300 transition-theme">
                                        <div className="px-6 py-4 flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className={`${
                                                    transaction.type === 'expense' 
                                                        ? 'bg-red-100 dark:bg-red-900 dark:bg-opacity-30 text-red-600 dark:text-red-400' 
                                                        : 'bg-green-100 dark:bg-green-900 dark:bg-opacity-30 text-green-600 dark:text-green-400'
                                                    } p-3 rounded-lg mr-4`}>
                                                    <i className={`fas fa-${getCategoryIcon(transaction.category)}`}></i>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium dark:text-white">{transaction.description}</h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {transaction.category} • {formatDate(transaction.date)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-medium ${
                                                    transaction.type === 'expense' 
                                                        ? 'text-red-600 dark:text-red-400' 
                                                        : 'text-green-600 dark:text-green-400'
                                                }`}>
                                                    {transaction.type === 'expense' ? '- ' : '+ '}
                                                    {renderAmount(transaction.amount)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                    <p>Nenhuma transação recente encontrada.</p>
                                    <a href="/transactions" className="text-primary dark:text-indigo-400 hover:underline mt-2 inline-block">
                                        Adicionar uma transação
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <CategoryModal 
                isOpen={categoryModalOpen}
                onClose={() => {setCategoryModalOpen(false); setEditingCategory(null);}}
                onSubmit={handleSaveCategory}
                category={editingCategory}
                defaultType={activeTab}
            />
        </div>
    );
};

export default Categories;