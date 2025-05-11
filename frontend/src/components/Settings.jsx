import React, { useState, useEffect } from 'react';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';
import MobileSidebar from './layout/MobileSidebar';
import { getUserSettings, updateUserSettings } from '../services/api';

const Settings = () => {
  // Estados
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Estados para configurações do usuário
  const [settings, setSettings] = useState({
    // Perfil
    name: '',
    email: '',
    
    // Preferências
    currency: 'BRL',
    dateFormat: 'DD/MM/YYYY',
    theme: 'light',
    language: 'pt-BR',
    
    // Notificações
    emailNotifications: true,
    budgetAlerts: true,
    weeklyReport: true,
    
    // Exportação
    exportFormat: 'csv',
    
    // Privacidade
    showBalance: true,
    hideAmounts: false
  });

  // Buscar configurações do usuário
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError('');
        const userSettings = await getUserSettings();
        
        if (userSettings) {
          setSettings(prev => ({
            ...prev,
            ...userSettings
          }));
        }
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
        setError('Não foi possível carregar suas configurações. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  // Manipular mudança nos campos
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

// Salvar configurações
const handleSave = async (e) => {
  e.preventDefault();
  setError('');
  
  try {
    setLoading(true);
    await updateUserSettings(settings);
    setSuccess(true);
    
    // Mostrar mensagem de sucesso brevemente e depois recarregar a página
    setTimeout(() => {
      // Recarregar a página para aplicar as novas configurações (equivalente a Ctrl+R)
      window.location.reload();
    }, 10);
  } catch (error) {
    console.error("Erro ao salvar configurações:", error);
    setError('Não foi possível salvar suas configurações. Tente novamente mais tarde.');
    setLoading(false);
  }
};

  // Adicionar mensagem de erro
  const renderErrorMessage = () => {
    if (!error) return null;
    
    return (
      <div className="mt-4 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg fade-in flex items-center">
        <i className="fas fa-exclamation-circle mr-2"></i>
        <span>{error}</span>
      </div>
    );
  };

  // Renderizar a seção atual com base na aba ativa
  const renderActiveSection = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-300 p-6 transition-theme">
            <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-4">Dados Pessoais</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
              <input 
                type="text" 
                name="name"
                value={settings.name}
                onChange={handleChange}
                className="block w-full rounded-lg border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-800 dark:text-white shadow-sm focus:border-primary focus:ring-primary dark:focus:ring-indigo-600 transition-theme"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input 
                type="email" 
                name="email"
                value={settings.email}
                onChange={handleChange}
                className="block w-full rounded-lg border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-800 dark:text-white shadow-sm focus:border-primary focus:ring-primary dark:focus:ring-indigo-600 transition-theme"
              />
            </div>
            
            <div className="border-t dark:border-dark-400 pt-4 mt-6">
              <h4 className="font-medium text-gray-800 dark:text-white mb-3">Segurança da Conta</h4>
              
              <button className="px-4 py-2 bg-gray-200 dark:bg-dark-300 hover:bg-gray-300 dark:hover:bg-dark-400 rounded-lg text-gray-700 dark:text-gray-300 mb-2 w-full md:w-auto transition-theme">
                Alterar Senha
              </button>
              
              <button className="px-4 py-2 bg-red-100 dark:bg-red-900 dark:bg-opacity-20 hover:bg-red-200 dark:hover:bg-opacity-30 rounded-lg text-red-700 dark:text-red-400 w-full md:w-auto transition-theme">
                Excluir Conta
              </button>
            </div>
          </div>
        );
        
      case 'preferences':
        return (
          <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-300 p-6 transition-theme">
            <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-4">Preferências de Exibição</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Moeda</label>
                <select 
                  name="currency"
                  value={settings.currency}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-800 dark:text-white shadow-sm focus:border-primary focus:ring-primary dark:focus:ring-indigo-600 transition-theme"
                >
                  <option value="BRL">Real Brasileiro (R$)</option>
                  <option value="USD">Dólar Americano ($)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="GBP">Libra Esterlina (£)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Formato de Data</label>
                <select 
                  name="dateFormat"
                  value={settings.dateFormat}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-800 dark:text-white shadow-sm focus:border-primary focus:ring-primary dark:focus:ring-indigo-600 transition-theme"
                >
                  <option value="DD/MM/YYYY">DD/MM/AAAA</option>
                  <option value="MM/DD/YYYY">MM/DD/AAAA</option>
                  <option value="YYYY-MM-DD">AAAA-MM-DD</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tema</label>
                <select 
                  name="theme"
                  value={settings.theme}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-800 dark:text-white shadow-sm focus:border-primary focus:ring-primary dark:focus:ring-indigo-600 transition-theme"
                >
                  <option value="light">Claro</option>
                  <option value="dark">Escuro</option>
                  <option value="system">Sistema</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Idioma</label>
                <select 
                  name="language"
                  value={settings.language}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-800 dark:text-white shadow-sm focus:border-primary focus:ring-primary dark:focus:ring-indigo-600 transition-theme"
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es">Español</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="font-medium text-gray-800 dark:text-white mb-3">Privacidade</h4>
              
              <div className="flex items-center mb-3">
                <input
                  id="showBalance"
                  type="checkbox"
                  name="showBalance"
                  checked={settings.showBalance}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary focus:ring-primary dark:focus:ring-indigo-600 border-gray-300 dark:border-dark-400 rounded"
                />
                <label htmlFor="showBalance" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Mostrar saldos na dashboard
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="hideAmounts"
                  type="checkbox"
                  name="hideAmounts"
                  checked={settings.hideAmounts}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary focus:ring-primary dark:focus:ring-indigo-600 border-gray-300 dark:border-dark-400 rounded"
                />
                <label htmlFor="hideAmounts" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Ocultar valores em dispositivos públicos
                </label>
              </div>
            </div>
          </div>
        );
      
      case 'notifications':
        return (
          <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-300 p-6 transition-theme">
            <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-4">Notificações</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white">Notificações por Email</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receba alertas importantes por email</p>
                </div>
                <div className="flex items-center">
                  <div className="relative inline-block w-12 mr-2 align-middle">
                    <input 
                      id="emailNotifications" 
                      type="checkbox"
                      name="emailNotifications"
                      checked={settings.emailNotifications}
                      onChange={handleChange}
                      className="absolute opacity-0 w-0 h-0"
                    />
                    <label
                      htmlFor="emailNotifications"
                      className={`block overflow-hidden h-6 rounded-full cursor-pointer 
                        ${settings.emailNotifications ? 'bg-primary dark:bg-indigo-600' : 'bg-gray-300 dark:bg-dark-400'}`}
                    >
                      <span 
                        className={`block h-6 w-6 rounded-full bg-white dark:bg-gray-200 shadow transform transition-transform 
                        ${settings.emailNotifications ? 'translate-x-6' : 'translate-x-0'}`} 
                      ></span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white">Alertas de Orçamento</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receba alertas quando estiver próximo do limite</p>
                </div>
                <div className="flex items-center">
                  <div className="relative inline-block w-12 mr-2 align-middle">
                    <input 
                      id="budgetAlerts" 
                      type="checkbox"
                      name="budgetAlerts"
                      checked={settings.budgetAlerts}
                      onChange={handleChange}
                      className="absolute opacity-0 w-0 h-0"
                    />
                    <label
                      htmlFor="budgetAlerts"
                      className={`block overflow-hidden h-6 rounded-full cursor-pointer 
                        ${settings.budgetAlerts ? 'bg-primary dark:bg-indigo-600' : 'bg-gray-300 dark:bg-dark-400'}`}
                    >
                      <span 
                        className={`block h-6 w-6 rounded-full bg-white dark:bg-gray-200 shadow transform transition-transform 
                        ${settings.budgetAlerts ? 'translate-x-6' : 'translate-x-0'}`} 
                      ></span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white">Relatório Semanal</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receba um resumo semanal da sua atividade financeira</p>
                </div>
                <div className="flex items-center">
                  <div className="relative inline-block w-12 mr-2 align-middle">
                    <input 
                      id="weeklyReport" 
                      type="checkbox"
                      name="weeklyReport"
                      checked={settings.weeklyReport}
                      onChange={handleChange}
                      className="absolute opacity-0 w-0 h-0"
                    />
                    <label
                      htmlFor="weeklyReport"
                      className={`block overflow-hidden h-6 rounded-full cursor-pointer 
                        ${settings.weeklyReport ? 'bg-primary dark:bg-indigo-600' : 'bg-gray-300 dark:bg-dark-400'}`}
                    >
                      <span 
                        className={`block h-6 w-6 rounded-full bg-white dark:bg-gray-200 shadow transform transition-transform 
                        ${settings.weeklyReport ? 'translate-x-6' : 'translate-x-0'}`} 
                      ></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'export':
        return (
          <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-300 p-6 transition-theme">
            <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-4">Exportação e Backup</h3>
            
            <div className="mb-6">
              <h4 className="font-medium text-gray-800 dark:text-white mb-3">Exportar Dados</h4>
              
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Formato de Exportação</label>
                <select 
                  name="exportFormat"
                  value={settings.exportFormat}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-800 dark:text-white shadow-sm focus:border-primary focus:ring-primary dark:focus:ring-indigo-600 transition-theme"
                >
                  <option value="csv">CSV</option>
                  <option value="xlsx">Excel (XLSX)</option>
                  <option value="pdf">PDF</option>
                  <option value="json">JSON</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <button className="px-4 py-2 bg-primary hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-lg flex items-center justify-center transition-theme">
                  <i className="fas fa-download mr-2"></i>
                  Exportar Transações
                </button>
                
                <button className="px-4 py-2 bg-primary hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-lg flex items-center justify-center transition-theme">
                  <i className="fas fa-download mr-2"></i>
                  Exportar Orçamentos
                </button>
                
                <button className="px-4 py-2 bg-primary hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-lg flex items-center justify-center transition-theme">
                  <i className="fas fa-download mr-2"></i>
                  Exportar Metas
                </button>
                
                <button className="px-4 py-2 bg-indigo-800 hover:bg-indigo-900 dark:hover:bg-indigo-950 text-white rounded-lg flex items-center justify-center transition-theme">
                  <i className="fas fa-file-export mr-2"></i>
                  Exportar Todos os Dados
                </button>
              </div>
            </div>
            
            <div className="pt-4 border-t dark:border-dark-400">
              <h4 className="font-medium text-gray-800 dark:text-white mb-3">Backup</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white rounded-lg flex items-center justify-center transition-theme">
                  <i className="fas fa-cloud-upload-alt mr-2"></i>
                  Criar Backup Agora
                </button>
                
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white rounded-lg flex items-center justify-center transition-theme">
                  <i className="fas fa-cloud-download-alt mr-2"></i>
                  Restaurar Backup
                </button>
              </div>
              
              <div className="mt-4 bg-gray-50 dark:bg-dark-300 rounded-lg p-3 transition-theme">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <i className="fas fa-info-circle mr-1 text-blue-500 dark:text-blue-400"></i>
                  Último backup realizado em: <span className="font-medium dark:text-gray-300">12/04/2025 às 15:30</span>
                </p>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-dark-100 min-h-screen transition-theme">
      <Sidebar />
      <Header title="Configurações" onMenuClick={() => setMobileMenuOpen(true)} />
      <MobileSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      
      <div className="md:ml-64">
        <div className="p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Configurações</h2>
              <p className="text-gray-600 dark:text-gray-300">Personalize sua experiência no Controle Financeiro</p>
            </div>
          </div>

          {/* Conteúdo principal */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar de configurações */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-300 overflow-hidden transition-theme">
                <nav className="flex flex-col">
                  <button 
                    onClick={() => setActiveTab('profile')} 
                    className={`p-4 text-left flex items-center ${
                      activeTab === 'profile' 
                        ? 'bg-indigo-50 dark:bg-indigo-900 dark:bg-opacity-20 text-primary dark:text-indigo-400' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-300'
                    } transition-theme`}
                  >
                    <i className="fas fa-user mr-3 w-5"></i>
                    <span>Dados Pessoais</span>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('preferences')} 
                    className={`p-4 text-left flex items-center ${
                      activeTab === 'preferences' 
                        ? 'bg-indigo-50 dark:bg-indigo-900 dark:bg-opacity-20 text-primary dark:text-indigo-400' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-300'
                    } transition-theme`}
                  >
                    <i className="fas fa-cog mr-3 w-5"></i>
                    <span>Preferências</span>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('notifications')} 
                    className={`p-4 text-left flex items-center ${
                      activeTab === 'notifications' 
                        ? 'bg-indigo-50 dark:bg-indigo-900 dark:bg-opacity-20 text-primary dark:text-indigo-400' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-300'
                    } transition-theme`}
                  >
                    <i className="fas fa-bell mr-3 w-5"></i>
                    <span>Notificações</span>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('export')} 
                    className={`p-4 text-left flex items-center ${
                      activeTab === 'export' 
                        ? 'bg-indigo-50 dark:bg-indigo-900 dark:bg-opacity-20 text-primary dark:text-indigo-400' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-300'
                    } transition-theme`}
                  >
                    <i className="fas fa-file-export mr-3 w-5"></i>
                    <span>Exportação e Backup</span>
                  </button>
                </nav>
              </div>
            </div>
            
            {/* Área de configuração */}
            <div className="lg:col-span-3">
              {renderActiveSection()}
              
              {/* Botões de ação */}
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center px-6 py-3 bg-primary hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-lg shadow transition-theme"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      <span>Salvar Configurações</span>
                    </>
                  )}
                </button>
              </div>
              
              {/* Mensagem de sucesso */}
              {success && (
                <div className="mt-4 bg-green-50 dark:bg-green-900 dark:bg-opacity-20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg fade-in flex items-center">
                  <i className="fas fa-check-circle mr-2"></i>
                  <span>Configurações salvas com sucesso!</span>
                </div>
              )}

              {/* Mensagem de erro */}
              {renderErrorMessage()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;