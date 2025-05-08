import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';
import MobileSidebar from './layout/MobileSidebar';
import { getTransactions, getAccounts, getBudgets, getCategories, getContributions } from '../services/api';

const Reports = () => {
    // Estados
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
    const [activeMonthlyTab, setActiveMonthlyTab] = useState('income'); // 'income', 'expense', 'balance'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Estados para dados
    const [transactions, setTransactions] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [contributions, setContributions] = useState([]);
    
    // Estados para estatísticas de sumário
    const [summary, setSummary] = useState({
      income: 0,
      expense: 0,
      balance: 0,
      incomeChange: 0,
      expenseChange: 0,
      balanceChange: 0
    });
    
    // Estados para dados dos gráficos
    const [chartData, setChartData] = useState({
      monthlyLabels: [],
      incomeData: [],
      expenseData: [],
      balanceData: [],
      categoryData: [],
      budgetStatus: [],
      savingsRate: 0
    });
    
    // Referências para os gráficos
    const incomeExpenseChartRef = useRef(null);
    const expenseCategoryChartRef = useRef(null);
    const monthlyTrendChartRef = useRef(null);
    const monthlyTrendChartInstance = useRef(null);
    const savingsRateChartRef = useRef(null);
    
    // Instâncias dos gráficos
    const [incomeExpenseChart, setIncomeExpenseChart] = useState(null);
    const [expenseCategoryChart, setExpenseCategoryChart] = useState(null);
    const [monthlyTrendChart, setMonthlyTrendChart] = useState(null);
    const [savingsRateChart, setSavingsRateChart] = useState(null);

    // Buscar dados da API
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [transactionsData, accountsData, budgetsData, categoriesData, contributionsData] = await Promise.all([
                    getTransactions(),
                    getAccounts(),
                    getBudgets(),
                    getCategories(),
                    getContributions()
                ]);
                
                // Armazenar dados brutos nos estados
                setTransactions(transactionsData);
                setAccounts(accountsData);
                setBudgets(budgetsData);
                setCategories(categoriesData);
                setContributions(contributionsData);
                
                // Processar dados para os gráficos e sumários
                processDataForCharts(transactionsData, accountsData, budgetsData, contributionsData, categoriesData);
                calculateSummary(transactionsData, contributionsData);
                
            } catch (err) {
                setError("Erro ao carregar dados: " + err.message);
                console.error("Erro ao buscar dados:", err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [selectedPeriod]); // Refazer os cálculos quando o período selecionado mudar

    // Processar dados para os gráficos
    const processDataForCharts = (transactions, accounts, budgets, contributions, categories) => {
        // Filtrar transações baseadas no período selecionado
        const filteredTransactions = filterTransactionsByPeriod(transactions, selectedPeriod);
        const filteredContributions = filterTransactionsByPeriod(contributions, selectedPeriod);
        
        // Preparar dados para o gráfico de receitas vs despesas
        const monthlyData = getMonthlyData(filteredTransactions);
        
        // Preparar dados para o gráfico de despesas por categoria
        const categoryData = getCategoryData(filteredTransactions, filteredContributions, categories);
        
        // Preparar dados para o status de orçamento
        const budgetStatus = getBudgetStatus(filteredTransactions, budgets);
        
        // Calcular taxa de poupança
        const savingsRate = calculateSavingsRate(filteredTransactions, filteredContributions);
        
        setChartData({
            monthlyLabels: monthlyData.labels,
            incomeData: monthlyData.incomeData,
            expenseData: monthlyData.expenseData,
            balanceData: monthlyData.balanceData,
            categoryData: categoryData,
            budgetStatus: budgetStatus,
            savingsRate: savingsRate
        });
    };

    // Filtrar transações baseadas no período selecionado
    const filterTransactionsByPeriod = (transactions, period) => {
        if (!transactions || transactions.length === 0) return [];
        
        const now = new Date();
        let startDate = new Date();
        
        switch(period) {
            case 'last7days':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'last30days':
                startDate.setDate(now.getDate() - 30);
                break;
            case 'thisMonth':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'lastMonth':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
                return transactions.filter(tx => {
                    const txDate = new Date(tx.date);
                    return txDate >= startDate && txDate <= lastDayLastMonth;
                });
            case 'thisQuarter':
                const quarter = Math.floor(now.getMonth() / 3);
                startDate = new Date(now.getFullYear(), quarter * 3, 1);
                break;
            case 'thisYear':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            case 'custom':
                // Implementar lógica para período personalizado se necessário
                break;
            default:
                startDate.setDate(now.getDate() - 30);
        }
        
        return transactions.filter(tx => {
            const txDate = new Date(tx.date);
            return txDate >= startDate && txDate <= now;
        });
    };

    // Obter dados mensais para o gráfico de receitas vs despesas
    const getMonthlyData = (transactions) => {
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const currentYear = new Date().getFullYear();
        const monthlyIncome = Array(12).fill(0);
        const monthlyExpense = Array(12).fill(0);
        
        transactions.forEach(tx => {
            const txDate = new Date(tx.date);
            if (txDate.getFullYear() === currentYear) {
                const month = txDate.getMonth();
                if (tx.type === 'income') {
                    monthlyIncome[month] += parseFloat(tx.amount || 0);
                } else {
                    monthlyExpense[month] += parseFloat(tx.amount || 0);
                }
            }
        });
        
        // Calcular saldo mensal (receitas - despesas)
        const monthlyBalance = monthlyIncome.map((income, idx) => income - monthlyExpense[idx]);
        
        return {
            labels: months,
            incomeData: monthlyIncome,
            expenseData: monthlyExpense,
            balanceData: monthlyBalance
        };
    };

    // Obter dados para o gráfico de despesas por categoria
    const getCategoryData = (transactions, contributions, categories) => {
        // Agrupar despesas por categoria
        const categoryMap = {};
        
        // Processa transações
        transactions
            .filter(tx => tx.type === 'expense')
            .forEach(tx => {
                const categoryName = tx.category || 'Outros';
                if (!categoryMap[categoryName]) {
                    categoryMap[categoryName] = 0;
                }
                categoryMap[categoryName] += parseFloat(tx.amount || 0);
            });
        
        // Adiciona contribuições na categoria "Metas" ou semelhante
        contributions.forEach(contrib => {
            if (!categoryMap['Metas']) {
                categoryMap['Metas'] = 0;
            }
            categoryMap['Metas'] += parseFloat(contrib.amount || 0);
        });
        
        // Converter para o formato necessário para o gráfico
        return Object.entries(categoryMap).map(([category, amount]) => ({
            category,
            amount,
            color: getCategoryColor(category, categories)
        }));
    };

    // Obter cor para uma categoria específica
    const getCategoryColor = (categoryName, categories) => {
        const categoryColors = {
            'Moradia': '#ef4444',
            'Alimentação': '#f97316',
            'Transporte': '#f59e0b',
            'Lazer': '#10b981',
            'Saúde': '#3b82f6',
            'Metas': '#8b5cf6',
            'Outros': '#94a3b8'
        };
        
        // Tentar encontrar a cor na lista de categorias
        const categoryObj = categories.find(cat => cat.name === categoryName);
        if (categoryObj && categoryObj.color) {
            return categoryObj.color;
        }
        
        // Usar cor do mapa ou padrão
        return categoryColors[categoryName] || '#94a3b8';
    };

    // Obter status dos orçamentos
    const getBudgetStatus = (transactions, budgets) => {
        if (!budgets || budgets.length === 0) return [];
        
        return budgets
            .filter(budget => budget.type !== 'goal') // Filtrar apenas orçamentos normais, não metas
            .map(budget => {
                // Calcular quanto foi gasto desta categoria no período atual
                const spent = transactions
                    .filter(tx => tx.type === 'expense' && tx.category === budget.category)
                    .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
                
                const budgetAmount = parseFloat(budget.amount || 0);
                const remaining = Math.max(0, budgetAmount - spent);
                const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
                
                return {
                    category: budget.category,
                    spent,
                    budgetAmount,
                    remaining,
                    percentage
                };
            });
    };

    // Calcular taxa de poupança
    const calculateSavingsRate = (transactions, contributions) => {
        const totalIncome = transactions
            .filter(tx => tx.type === 'income')
            .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
        
        const totalExpenses = transactions
            .filter(tx => tx.type === 'expense')
            .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
            
        const totalContributions = contributions
            .reduce((sum, contrib) => sum + parseFloat(contrib.amount || 0), 0);
        
        if (totalIncome <= 0) return 0;
        
        // Taxa de poupança = (Receita - (Despesas + Contribuições)) / Receita
        const savings = totalIncome - (totalExpenses + totalContributions);
        return (savings / totalIncome) * 100;
    };

    // Calcular sumário financeiro
    const calculateSummary = (transactions, contributions) => {
        // Obter dados do período atual
        const currentTransactions = filterTransactionsByPeriod(transactions, selectedPeriod);
        const currentContributions = filterTransactionsByPeriod(contributions, selectedPeriod);
        
        // Calcular receita e despesa do período atual
        const currentIncome = currentTransactions
            .filter(tx => tx.type === 'income')
            .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
            
        let currentExpense = currentTransactions
            .filter(tx => tx.type === 'expense')
            .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
        
        // Adicionar contribuições às despesas
        currentExpense += currentContributions
            .reduce((sum, contrib) => sum + parseFloat(contrib.amount || 0), 0);
            
        const currentBalance = currentIncome - currentExpense;
        
        // Obter dados do período anterior
        let previousPeriod;
        switch(selectedPeriod) {
            case 'thisMonth':
                previousPeriod = 'lastMonth';
                break;
            case 'lastMonth':
                // Implementar lógica para "mês retrasado"
                previousPeriod = 'custom';
                break;
            case 'thisYear':
                // Implementar lógica para "ano passado"
                previousPeriod = 'custom';
                break;
            default:
                previousPeriod = 'custom';
        }
        
        const previousTransactions = filterTransactionsByPeriod(transactions, previousPeriod);
        const previousContributions = filterTransactionsByPeriod(contributions, previousPeriod);
        
        // Calcular receita e despesa do período anterior
        const previousIncome = previousTransactions
            .filter(tx => tx.type === 'income')
            .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
            
        let previousExpense = previousTransactions
            .filter(tx => tx.type === 'expense')
            .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
            
        // Adicionar contribuições anteriores às despesas
        previousExpense += previousContributions
            .reduce((sum, contrib) => sum + parseFloat(contrib.amount || 0), 0);
            
        const previousBalance = previousIncome - previousExpense;
        
        // Calcular variação percentual
        const incomeChange = previousIncome === 0 
            ? 100 
            : ((currentIncome - previousIncome) / previousIncome) * 100;
            
        const expenseChange = previousExpense === 0 
            ? 100 
            : ((currentExpense - previousExpense) / previousExpense) * 100;
            
        const balanceChange = previousBalance === 0 
            ? 100 
            : ((currentBalance - previousBalance) / previousBalance) * 100;
        
        setSummary({
            income: currentIncome,
            expense: currentExpense,
            balance: currentBalance,
            incomeChange: incomeChange,
            expenseChange: expenseChange,
            balanceChange: balanceChange
        });
    };

    // Formatação de moeda
    const formatCurrency = (value) => {
        return `R$ ${Number(value).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    // Inicializar gráficos
    useEffect(() => {
        if (loading || !chartData.monthlyLabels.length) return;
        
        // Gráfico de Receitas vs Despesas
        if (incomeExpenseChartRef && incomeExpenseChartRef.current) {
            const ctx = incomeExpenseChartRef.current.getContext('2d');
            
            // Destruir gráfico existente se houver
            if (incomeExpenseChart) {
                incomeExpenseChart.destroy();
            }
            
            const newChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: chartData.monthlyLabels,
                    datasets: [
                        {
                            label: 'Receitas',
                            data: chartData.incomeData,
                            backgroundColor: '#10b981',
                            borderRadius: 4
                        },
                        {
                            label: 'Despesas',
                            data: chartData.expenseData,
                            backgroundColor: '#ef4444',
                            borderRadius: 4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed.y !== null) {
                                        label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y);
                                    }
                                    return label;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                display: false
                            }
                        },
                        y: {
                            beginAtZero: true,
                            grid: {
                                drawBorder: false
                            },
                            ticks: {
                                callback: function(value) {
                                    return 'R$ ' + value.toLocaleString('pt-BR');
                                }
                            }
                        }
                    }
                }
            });
            
            setIncomeExpenseChart(newChart);
        }
        
        // Gráfico de Despesas por Categoria
        if (expenseCategoryChartRef && expenseCategoryChartRef.current && chartData.categoryData.length) {
            const ctx = expenseCategoryChartRef.current.getContext('2d');
            
            if (expenseCategoryChart) {
                expenseCategoryChart.destroy();
            }
            
            const categoryLabels = chartData.categoryData.map(item => item.category);
            const categoryValues = chartData.categoryData.map(item => item.amount);
            const categoryColors = chartData.categoryData.map(item => item.color);
            
            const newChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: categoryLabels,
                    datasets: [{
                        data: categoryValues,
                        backgroundColor: categoryColors,
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                        legend: {
                            position: 'right',
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = Math.round((value / total) * 100);
                                    return `${label}: R$ ${value.toLocaleString('pt-BR')} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
            
            setExpenseCategoryChart(newChart);
        }
        
        // Gráfico de Taxa de Poupança
        if (savingsRateChartRef && savingsRateChartRef.current) {
            const ctx = savingsRateChartRef.current.getContext('2d');
            
            if (savingsRateChart) {
                savingsRateChart.destroy();
            }
            
            const savingsPercentage = Math.max(0, Math.min(100, chartData.savingsRate));
            const spendingPercentage = 100 - savingsPercentage;
            
            const newChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Poupança', 'Gastos'],
                    datasets: [{
                        data: [savingsPercentage, spendingPercentage],
                        backgroundColor: [
                            '#4f46e5',
                            '#e5e7eb'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '80%',
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
            
            setSavingsRateChart(newChart);
        }
        
        // Inicializar gráfico de tendência mensal
        updateMonthlyTrendChart();
    }, [chartData, loading]);

    // Atualizar gráfico de tendência mensal com base na aba selecionada
    const updateMonthlyTrendChart = () => {
        if (!monthlyTrendChartRef.current || !chartData.monthlyLabels.length) return;
        
        const ctx = monthlyTrendChartRef.current.getContext('2d');
        
        // Destruir gráfico existente se houver
        if (monthlyTrendChartInstance.current) {
            monthlyTrendChartInstance.current.destroy();
            monthlyTrendChartInstance.current = null;
        }
        
        let dataConfig = {};
        
        switch (activeMonthlyTab) {
            case 'expense':
                dataConfig = {
                    label: 'Despesas',
                    data: chartData.expenseData,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.05)',
                };
                break;
            case 'balance':
                dataConfig = {
                    label: 'Saldo',
                    data: chartData.balanceData,
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.05)',
                };
                break;
            case 'income':
            default:
                dataConfig = {
                    label: 'Receitas',
                    data: chartData.incomeData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.05)',
                };
        }
        
        const newChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.monthlyLabels,
                datasets: [{
                    ...dataConfig,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: false,
                        grid: {
                            drawBorder: false
                        },
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toLocaleString('pt-BR');
                            }
                        }
                    }
                }
            }
        });
        
        // Armazenar na ref em vez de no estado
        monthlyTrendChartInstance.current = newChart;
        setMonthlyTrendChart(newChart);
    };

    // Atualizar gráfico quando a aba muda
    useEffect(() => {
        if (!loading && chartData.monthlyLabels.length) {
            updateMonthlyTrendChart();
        }
        
        return () => {
            if (monthlyTrendChartInstance.current) {
                monthlyTrendChartInstance.current.destroy();
                monthlyTrendChartInstance.current = null;
            }
        };
    }, [activeMonthlyTab, chartData]);

    // Mostrar indicador de carregamento
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Carregando...</span>
                </div>
            </div>
        );
    }

    // Mostrar mensagem de erro se houver
    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-red-600 text-center">
                    <p className="text-xl font-bold mb-2">Erro ao carregar dados</p>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <Sidebar />
            <Header title="Relatórios" onMenuClick={() => setMobileMenuOpen(true)} />
            <MobileSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

            <div className="md:ml-64">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Relatórios Financeiros</h2>
                            <p className="text-gray-600">Análise detalhada de suas finanças</p>
                        </div>
                        <div className="mt-4 md:mt-0 flex space-x-3">
                            <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center hover:bg-gray-50">
                                <i className="fas fa-download mr-2"></i>
                                <span>Exportar</span>
                            </button>
                            <button className="bg-primary hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center">
                                <i className="fas fa-filter mr-2"></i>
                                <span>Filtrar</span>
                            </button>
                        </div>
                    </div>

                    {/* Date range selector */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                        <div className="flex flex-col md:flex-row items-center justify-between">
                            <div className="flex items-center mb-4 md:mb-0">
                                <h3 className="font-medium mr-3">Período:</h3>
                                <select 
                                    className="border border-gray-300 rounded-lg px-3 py-1 bg-gray-50 focus:ring-primary focus:border-primary"
                                    value={selectedPeriod}
                                    onChange={(e) => setSelectedPeriod(e.target.value)}
                                >
                                    <option value="last7days">Últimos 7 dias</option>
                                    <option value="last30days">Últimos 30 dias</option>
                                    <option value="thisMonth">Este mês</option>
                                    <option value="lastMonth">Mês passado</option>
                                    <option value="thisQuarter">Este trimestre</option>
                                    <option value="thisYear">Este ano</option>
                                    <option value="custom">Personalizado</option>
                                </select>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50">
                                    <i className="fas fa-chevron-left"></i>
                                </button>
                                <span className="font-medium">{new Date().toLocaleString('pt-BR', {month: 'long', year: 'numeric'})}</span>
                                <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50">
                                    <i className="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Summary cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="report-card bg-white border border-gray-200 rounded-xl p-4 transition-all duration-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Receitas</p>
                                    <h3 className="text-2xl font-bold text-green-600">{formatCurrency(summary.income)}</h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                        <span className={summary.incomeChange >= 0 ? "text-green-600" : "text-red-600"}>
                                            {summary.incomeChange >= 0 ? "+" : "-"}{Math.abs(summary.incomeChange).toFixed(1)}%
                                        </span> em relação ao período anterior
                                    </p>
                                </div>
                                <div className="bg-green-100 p-3 rounded-lg text-green-600">
                                    <i className={`fas fa-arrow-${summary.incomeChange >= 0 ? 'up' : 'down'}`}></i>
                                </div>
                            </div>
                        </div>
                        
                        <div className="report-card bg-white border border-gray-200 rounded-xl p-4 transition-all duration-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Despesas</p>
                                    <h3 className="text-2xl font-bold text-red-600">{formatCurrency(summary.expense)}</h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                        <span className={summary.expenseChange <= 0 ? "text-green-600" : "text-red-600"}>
                                            {summary.expenseChange >= 0 ? "+" : "-"}{Math.abs(summary.expenseChange).toFixed(1)}%
                                        </span> em relação ao período anterior
                                    </p>
                                </div>
                                <div className="bg-red-100 p-3 rounded-lg text-red-600">
                                    <i className={`fas fa-arrow-${summary.expenseChange >= 0 ? 'up' : 'down'}`}></i>
                                </div>
                            </div>
                        </div>
                        
                        <div className="report-card bg-white border border-gray-200 rounded-xl p-4 transition-all duration-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Saldo</p>
                                    <h3 className="text-2xl font-bold text-primary">{formatCurrency(summary.balance)}</h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                        <span className={summary.balanceChange >= 0 ? "text-green-600" : "text-red-600"}>
                                            {summary.balanceChange >= 0 ? "+" : "-"}{Math.abs(summary.balanceChange).toFixed(1)}%
                                        </span> em relação ao período anterior
                                    </p>
                                </div>
                                <div className="bg-indigo-100 p-3 rounded-lg text-primary">
                                    <i className={`fas fa-arrow-${summary.balanceChange >= 0 ? 'up' : 'down'}`}></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Income vs Expenses chart */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-gray-800">Receitas vs Despesas</h3>
                                <div className="flex space-x-2">
                                    <button className="px-2 py-1 text-xs bg-indigo-50 text-primary rounded hover:bg-indigo-100">Mensal</button>
                                    <button className="px-2 py-1 text-xs bg-white text-gray-600 border border-gray-200 rounded hover:bg-gray-50">Anual</button>
                                </div>
                            </div>
                            <div className="chart-container" style={{height: '300px'}}>
                                <canvas ref={incomeExpenseChartRef}></canvas>
                            </div>
                        </div>
                        
                        {/* Expenses by category chart */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-gray-800">Despesas por Categoria</h3>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <i className="fas fa-ellipsis-v"></i>
                                </button>
                            </div>
                            <div className="chart-container" style={{height: '300px'}}>
                                <canvas ref={expenseCategoryChartRef}></canvas>
                            </div>
                        </div>
                    </div>

                    {/* Monthly trends */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-gray-800">Tendência Mensal</h3>
                            <div className="flex space-x-2">
                                <button 
                                    className={`px-2 py-1 text-xs ${activeMonthlyTab === 'income' ? 'bg-indigo-50 text-primary' : 'bg-white text-gray-600 border border-gray-200'} rounded hover:bg-indigo-100`}
                                    onClick={() => setActiveMonthlyTab('income')}
                                >
                                    Receitas
                                </button>
                                <button 
                                    className={`px-2 py-1 text-xs ${activeMonthlyTab === 'expense' ? 'bg-indigo-50 text-primary' : 'bg-white text-gray-600 border border-gray-200'} rounded hover:bg-indigo-100`}
                                    onClick={() => setActiveMonthlyTab('expense')}
                                >
                                    Despesas
                                </button>
                                <button 
                                    className={`px-2 py-1 text-xs ${activeMonthlyTab === 'balance' ? 'bg-indigo-50 text-primary' : 'bg-white text-gray-600 border border-gray-200'} rounded hover:bg-indigo-100`}
                                    onClick={() => setActiveMonthlyTab('balance')}
                                >
                                    Saldo
                                </button>
                            </div>
                        </div>
                        <div className="chart-container" style={{height: '300px'}}>
                            <canvas ref={monthlyTrendChartRef}></canvas>
                        </div>
                    </div>

                    {/* Detailed transactions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                        {/* Table header */}
                        <div className="px-6 py-4 border-b flex flex-col md:flex-row justify-between items-start md:items-center">
                            <h3 className="font-semibold text-gray-800 mb-2 md:mb-0">Transações Detalhadas</h3>
                            <div className="flex space-x-2">
                                <select className="border border-gray-300 rounded-lg px-3 py-1 bg-gray-50 text-sm focus:ring-primary focus:border-primary">
                                    <option>Todas as categorias</option>
                                    {categories.map((category, index) => (
                                        <option key={index} value={category.name}>{category.name}</option>
                                    ))}
                                </select>
                                <select className="border border-gray-300 rounded-lg px-3 py-1 bg-gray-50 text-sm focus:ring-primary focus:border-primary">
                                    <option>Todos os tipos</option>
                                    <option>Receitas</option>
                                    <option>Despesas</option>
                                </select>
                            </div>
                        </div>
                        
                        {/* Table content */}
                        <div className="divide-y divide-gray-100 overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conta</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filterTransactionsByPeriod(transactions, selectedPeriod).map((transaction, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(transaction.date).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className={`${transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'} p-2 rounded-lg mr-3`}>
                                                        <i className={`fas ${transaction.type === 'income' ? 'fa-money-bill-wave' : 'fa-shopping-bag'} text-sm`}></i>
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{transaction.description}</div>
                                                        <div className="text-xs text-gray-500">{transaction.notes || '-'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs ${transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} rounded-full`}>
                                                    {transaction.category || 'Sem categoria'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {transaction.account || 'Não especificada'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                                                    {transaction.type === 'income' ? '' : '- '}
                                                    {formatCurrency(transaction.amount)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <button className="text-gray-400 hover:text-gray-600 mr-2">
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button className="text-gray-400 hover:text-gray-600">
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    
                                    {filterTransactionsByPeriod(transactions, selectedPeriod).length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                                Nenhuma transação encontrada para o período selecionado.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Table footer */}
                        <div className="px-6 py-4 border-t flex flex-col md:flex-row justify-between items-center">
                            <div className="text-sm text-gray-500 mb-2 md:mb-0">
                                Mostrando <span className="font-medium">1</span> a <span className="font-medium">{filterTransactionsByPeriod(transactions, selectedPeriod).length}</span> de <span className="font-medium">{filterTransactionsByPeriod(transactions, selectedPeriod).length}</span> transações
                            </div>
                            <div className="flex space-x-1">
                                <button className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50">
                                    <i className="fas fa-chevron-left"></i>
                                </button>
                                <button className="px-3 py-1 border border-primary rounded-lg text-white bg-primary hover:bg-indigo-700">1</button>
                                <button className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50">
                                    <i className="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Budget vs Actual */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Budget status */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-gray-800">Status do Orçamento</h3>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <i className="fas fa-ellipsis-v"></i>
                                </button>
                            </div>
                            <div className="space-y-4">
                                {chartData.budgetStatus.length > 0 ? (
                                    chartData.budgetStatus.map((budget, index) => (
                                        <div key={index}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-600">{budget.category}</span>
                                                <span className="font-medium">
                                                    {formatCurrency(budget.spent)} / {formatCurrency(budget.budgetAmount)}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className={`rounded-full h-2 ${
                                                        budget.percentage >= 100 ? 'bg-red-500' : 
                                                        budget.percentage >= 85 ? 'bg-yellow-500' : 
                                                        'bg-green-500'}`} 
                                                    style={{width: `${Math.min(100, budget.percentage)}%`}}
                                                ></div>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Restante: {formatCurrency(budget.remaining)} ({Math.round(100 - budget.percentage)}%)
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500 py-4">
                                        Nenhum orçamento definido. Adicione orçamentos para acompanhar seus gastos.
                                    </p>
                                )}
                            </div>
                        </div>
                        
                        {/* Savings rate */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-gray-800">Taxa de Poupança</h3>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <i className="fas fa-ellipsis-v"></i>
                                </button>
                            </div>
                            <div className="flex flex-col items-center justify-center h-64">
                                <div className="relative w-40 h-40 mb-4">
                                    <canvas ref={savingsRateChartRef}></canvas>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-primary">
                                                {Math.round(chartData.savingsRate)}%
                                            </div>
                                            <div className="text-xs text-gray-500">da renda</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600 text-center">
                                    Você está poupando <span className="font-medium text-primary">{Math.round(chartData.savingsRate)}%</span> da sua renda neste período.
                                    <div className="text-xs text-gray-500 mt-1">Meta: 30%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;