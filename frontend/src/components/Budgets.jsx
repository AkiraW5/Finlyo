import React, { useState, useEffect } from 'react';
import { 
  getBudgets, 
  createBudget, 
  updateBudget, 
  deleteBudget, 
  getTransactions, 
  getAccounts, 
  getContributions, 
  createContribution 
} from '../services/api';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';
import MobileSidebar from './layout/MobileSidebar';
import GoalModal from './modals/GoalModal';
import ContributionModal from './modals/ContributionModal';

const Goals = () => {
  // Estados
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [goals, setGoals] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [contributionModalOpen, setContributionModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [goalSummary, setGoalSummary] = useState({
    activeCount: 0,
    nearCompletion: 0,
    totalSaved: 0
  });

  // Buscar dados quando o componente montar
  useEffect(() => {
    fetchData();
  }, []);

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

  // Buscar metas e contribuições
  const fetchData = async () => {
    try {
      setLoading(true);
      
      const budgetsData = await getBudgets();
      const contributionsData = await getContributions();
      const accountsData = await getAccounts();
      
      // Transformar budgets em goals com informações adicionais
      const goalsData = budgetsData.map(budget => ({
        ...budget,
        limit: budget.amount,
        saved: calculateSavedAmount(budget, contributionsData),
        deadline: budget.endDate || getDefaultDeadline(),
        icon: budget.icon || getDefaultIcon(budget.category),
        color: budget.color || getDefaultColor(budget.category),
        progress: 0
      }));
      
      // Calcular progresso para cada meta
      goalsData.forEach(goal => {
        goal.progress = goal.limit > 0 ? (goal.saved / goal.limit) * 100 : 0;
      });
      
      setGoals(goalsData);
      setContributions(contributionsData);
      setAccounts(accountsData);
      
      // Calcular resumo
      calculateSummary(goalsData);
      
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      showNotification('Erro ao carregar as metas', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Calcular valor economizado para uma meta
  const calculateSavedAmount = (goal, contributionsData) => {
    if (!contributionsData || !contributionsData.length) return 0;
    
    // Filtrar contribuições relacionadas a essa meta
    const goalContributions = contributionsData.filter(contrib => 
      contrib.budgetId === goal.id
    );
    
    // Somar os valores das contribuições
    return goalContributions.reduce((sum, contrib) => sum + parseFloat(contrib.amount || 0), 0);
  };

  // Calcular resumo das metas
  const calculateSummary = (goalsData) => {
    const activeGoals = goalsData.filter(goal => goal.progress < 100);
    const nearCompletionGoals = goalsData.filter(goal => goal.progress >= 75 && goal.progress < 100);
    const totalSaved = goalsData.reduce((sum, goal) => sum + goal.saved, 0);
    
    setGoalSummary({
      activeCount: activeGoals.length,
      nearCompletion: nearCompletionGoals.length,
      totalSaved: totalSaved
    });
  };

  // Obter data limite padrão (1 ano a partir de hoje)
  const getDefaultDeadline = () => {
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    return oneYearFromNow.toISOString().split('T')[0];
  };

  // Obter ícone padrão com base na categoria
  const getDefaultIcon = (category) => {
    const iconMap = {
      'Viagem': 'plane',
      'Educação': 'graduation-cap',
      'Imóvel': 'home',
      'Veículo': 'car',
      'Reserva': 'shield-alt',
      'Tecnologia': 'laptop',
      'Saúde': 'heartbeat',
      'Investimento': 'chart-line',
    };
    
    const lowerCaseCategory = category.toLowerCase();
    
    if (iconMap[category]) return iconMap[category];
    if (lowerCaseCategory.includes('viagem')) return 'plane';
    if (lowerCaseCategory.includes('casa') || lowerCaseCategory.includes('imóvel')) return 'home';
    if (lowerCaseCategory.includes('carro') || lowerCaseCategory.includes('veículo')) return 'car';
    if (lowerCaseCategory.includes('educação') || lowerCaseCategory.includes('curso')) return 'graduation-cap';
    if (lowerCaseCategory.includes('reserva') || lowerCaseCategory.includes('emergência')) return 'shield-alt';
    if (lowerCaseCategory.includes('notebook') || lowerCaseCategory.includes('computador')) return 'laptop';
    
    return 'bullseye'; // Ícone padrão
  };

  // Obter cor padrão com base na categoria
  const getDefaultColor = (category) => {
    const colorMap = {
      'Viagem': 'blue',
      'Educação': 'yellow',
      'Imóvel': 'indigo',
      'Veículo': 'gray',
      'Reserva': 'green',
      'Tecnologia': 'purple',
      'Saúde': 'red',
      'Investimento': 'green',
    };
    
    const lowerCaseCategory = category.toLowerCase();
    
    if (colorMap[category]) return colorMap[category];
    if (lowerCaseCategory.includes('viagem')) return 'blue';
    if (lowerCaseCategory.includes('casa') || lowerCaseCategory.includes('imóvel')) return 'indigo';
    if (lowerCaseCategory.includes('carro') || lowerCaseCategory.includes('veículo')) return 'gray';
    if (lowerCaseCategory.includes('educação') || lowerCaseCategory.includes('curso')) return 'yellow';
    if (lowerCaseCategory.includes('reserva') || lowerCaseCategory.includes('emergência')) return 'green';
    if (lowerCaseCategory.includes('notebook') || lowerCaseCategory.includes('computador')) return 'purple';
    
    return 'blue'; // Cor padrão
  };

  // Formatar valores monetários
  const formatCurrency = (value) => {
    if (typeof value !== 'number') {
      value = parseFloat(value) || 0;
    }
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  // Toggle dropdown
  const toggleDropdown = (goalId) => {
    if (activeDropdown === goalId) {
      setActiveDropdown(null); // Fecha o dropdown se já estiver aberto
    } else {
      setActiveDropdown(goalId); // Abre o dropdown específico da meta
    }
  };

  // Filtrar metas com base na aba selecionada
  const filteredGoals = () => {
    const now = new Date();
    
    switch (activeTab) {
      case 'active':
        return goals.filter(goal => goal.progress < 100 && new Date(goal.deadline) >= now);
      case 'completed':
        return goals.filter(goal => goal.progress >= 100);
      case 'failed':
        return goals.filter(goal => goal.progress < 100 && new Date(goal.deadline) < now);
      default:
        return goals;
    }
  };

  // Adicionar contribuição a uma meta
  const handleAddContribution = async (contributionData) => {
    try {
      // Verificar se existe uma conta selecionada
      if (!contributionData.accountId) {
        showNotification('Selecione uma conta para esta contribuição!', 'error');
        return;
      }
      
      // Criar uma contribuição usando a API dedicada
      await createContribution({
        amount: contributionData.amount,
        date: contributionData.date,
        budgetId: contributionData.goalId,
        accountId: contributionData.accountId,
        notes: contributionData.notes || `Contribuição para ${selectedGoal?.category || 'meta'}`,
        method: contributionData.method || 'deposit'
      });
      
      setContributionModalOpen(false);
      fetchData(); // Recarregar dados
      showNotification('Contribuição adicionada com sucesso!');
    } catch (error) {
      console.error("Erro ao adicionar contribuição:", error);
      showNotification('Erro ao adicionar contribuição!', 'error');
    }
  };

  // Obter contribuições recentes para uma meta ou todas
  const getRecentContributions = (goalId = null) => {
    // Filtrar contribuições pela meta, se especificada
    const filteredContributions = goalId 
      ? contributions.filter(contrib => contrib.budgetId === goalId)
      : contributions;
    
    // Ordenar por data (mais recentes primeiro) e limitar a 5
    return filteredContributions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  };

  // Adicionar nova meta
  const handleAddGoal = async (goalData) => {
    try {
      // Mapear os campos do formulário para os campos esperados pelo banco de dados
      const budgetData = {
        category: goalData.category,
        amount: goalData.limit, // Mapear 'limit' para 'amount'
        period: 'monthly', // Adicionar o campo obrigatório 'period'
        startDate: goalData.deadline ? new Date() : null,
        endDate: goalData.deadline ? new Date(goalData.deadline) : null,
        notes: goalData.description || null,
        type: 'goal' // Indicar que é uma meta
      };
      
      if (editingGoal) {
        await updateBudget(editingGoal.id, budgetData);
      } else {
        await createBudget(budgetData);
      }
      
      setGoalModalOpen(false);
      setEditingGoal(null);
      fetchData(); // Recarregar dados
      showNotification('Meta salva com sucesso!');
    } catch (error) {
      console.error("Erro ao salvar meta:", error);
      showNotification('Erro ao salvar meta!', 'error');
    }
  };

  // Editar meta
  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setGoalModalOpen(true);
  };

  // Excluir meta
  const handleDeleteGoal = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita.")) {
      try {
        await deleteBudget(id);
        fetchData(); // Recarregar dados
        showNotification('Meta excluída com sucesso!');
      } catch (error) {
        console.error("Erro ao excluir meta:", error);
        showNotification('Erro ao excluir meta!', 'error');
      }
    }
  };

  // Abrir modal de contribuição
  const handleOpenContributionModal = (goal) => {
    setSelectedGoal(goal);
    setContributionModalOpen(true);
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

  // Loading state
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
      <Header title="Metas Financeiras" onMenuClick={() => setMobileMenuOpen(true)} />
      <MobileSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      
      <div className="md:ml-64">
        <div className="p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Metas Financeiras</h2>
              <p className="text-gray-600">Acompanhe suas metas e objetivos financeiros</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button 
                onClick={() => {setEditingGoal(null); setGoalModalOpen(true);}}
                className="bg-primary hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <i className="fas fa-plus mr-2"></i>
                <span>Nova Meta</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button 
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 font-medium text-sm border-b-2 ${activeTab === 'active' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Ativas
            </button>
            <button 
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 font-medium text-sm border-b-2 ${activeTab === 'completed' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Concluídas
            </button>
            <button 
              onClick={() => setActiveTab('failed')}
              className={`px-4 py-2 font-medium text-sm border-b-2 ${activeTab === 'failed' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Não alcançadas
            </button>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Metas ativas</p>
                  <h3 className="text-2xl font-bold text-gray-800">{goalSummary.activeCount}</h3>
                </div>
                <div className="bg-indigo-100 p-3 rounded-lg text-indigo-600">
                  <i className="fas fa-bullseye"></i>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Próximo da meta</p>
                  <h3 className="text-2xl font-bold text-gray-800">{goalSummary.nearCompletion}</h3>
                </div>
                <div className="bg-green-100 p-3 rounded-lg text-green-600">
                  <i className="fas fa-trophy"></i>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Valor acumulado</p>
                  <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(goalSummary.totalSaved)}</h3>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                  <i className="fas fa-coins"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Goals grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Render goals */}
            {filteredGoals().length > 0 ? (
              filteredGoals().map(goal => (
                <div key={goal.id} className="goal-card bg-white border border-gray-200 rounded-xl p-5 transition-all duration-200 cursor-pointer hover:shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`goal-icon bg-${goal.color}-100 text-${goal.color}-600 w-12 h-12 flex items-center justify-center rounded-xl`}>
                      <i className={`fas fa-${goal.icon}`}></i>
                    </div>
                    <div className="dropdown relative">
                      <button 
                        className="text-gray-400 hover:text-gray-600 focus:outline-none" 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDropdown(goal.id);
                        }}
                      >
                        <i className="fas fa-ellipsis-v"></i>
                      </button>
                      <div className={`dropdown-menu absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10 ${activeDropdown === goal.id ? 'block' : 'hidden'}`}>
                        <button onClick={() => handleEditGoal(goal)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Editar
                        </button>
                        <button onClick={() => handleOpenContributionModal(goal)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Adicionar valor
                        </button>
                        <button onClick={() => handleDeleteGoal(goal.id)} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-1">{goal.category}</h4>
                  <p className="text-sm text-gray-500 mb-4">{goal.description || `Meta para ${goal.category}`}</p>
                  
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progresso</span>
                      <span className="font-medium">{goal.progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`progress-bar bg-${goal.color}-500 rounded-full h-2`} 
                        style={{ width: `${Math.min(goal.progress, 100)}%`, transition: 'width 0.5s ease' }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 text-sm">Arrecadado</span>
                    <span className="font-semibold">{formatCurrency(goal.saved)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 text-sm">Meta</span>
                    <span className="font-semibold">{formatCurrency(goal.limit)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Prazo</span>
                    <span className="font-semibold">{new Date(goal.deadline).toLocaleDateString('pt-BR')}</span>
                  </div>
                  
                  <div className="mt-4">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-xl bg-${goal.color}-100 text-${goal.color}-800`}>
                      {goal.category}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 py-8 flex flex-col items-center text-gray-500">
                <i className="fas fa-bullseye text-gray-300 text-5xl mb-4"></i>
                <p>Nenhuma meta encontrada para esta categoria.</p>
              </div>
            )}
            
            {/* Add new goal card */}
            <div 
              onClick={() => {setEditingGoal(null); setGoalModalOpen(true);}}
              className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-5 hover:border-primary hover:bg-indigo-50 transition-all duration-200 cursor-pointer"
            >
              <div className="text-center">
                <div className="mx-auto bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                  <i className="fas fa-plus text-primary text-xl"></i>
                </div>
                <h4 className="font-semibold text-gray-800">Nova meta</h4>
              </div>
            </div>
          </div>

          {/* Recent contributions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b flex flex-col md:flex-row justify-between items-start md:items-center">
              <h3 className="font-semibold text-gray-800 mb-2 md:mb-0">Contribuições Recentes</h3>
              <button className="text-primary hover:text-indigo-700 text-sm font-medium">Ver histórico</button>
            </div>
            
            <div className="divide-y divide-gray-100">
              {getRecentContributions().length > 0 ? (
                getRecentContributions().map(contribution => {
                  const goal = goals.find(g => g.id === contribution.budgetId);
                  
                  return (
                    <div key={contribution.id} className="hover:bg-gray-50">
                      <div className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`bg-${goal?.color || 'blue'}-100 p-3 rounded-lg mr-4 text-${goal?.color || 'blue'}-600`}>
                            <i className={`fas fa-${goal?.icon || 'bullseye'}`}></i>
                          </div>
                          <div>
                            <h4 className="font-medium">{goal?.category || 'Meta'}</h4>
                            <p className="text-sm text-gray-500">
                              {new Date(contribution.date).toLocaleDateString('pt-BR')} • {contribution.notes || 'Depósito'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">+ {formatCurrency(contribution.amount)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="px-6 py-8 text-center text-gray-500">
                  <p>Nenhuma contribuição encontrada.</p>
                  <button 
                    onClick={() => setContributionModalOpen(true)}
                    className="text-primary hover:underline mt-2 inline-block"
                  >
                    Adicionar uma contribuição
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Goal Modal */}
      <GoalModal 
        isOpen={goalModalOpen}
        onClose={() => {setGoalModalOpen(false); setEditingGoal(null);}}
        onSubmit={handleAddGoal}
        goal={editingGoal}
      />
      
      {/* Contribution Modal */}
      <ContributionModal 
        isOpen={contributionModalOpen}
        onClose={() => {setContributionModalOpen(false); setSelectedGoal(null);}}
        onSubmit={handleAddContribution}
        goals={goals}
        selectedGoal={selectedGoal}
        accounts={accounts}
      />
    </div>
  );
};

// Exportar o componente sem comentários JSX após a instrução de exportação
export default Goals;