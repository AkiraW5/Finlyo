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
  
  // Estados para configurações do usuário
  const [settings, setSettings] = useState({
    // Perfil
    name: 'Usuário',
    email: 'usuario@exemplo.com',
    
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
        const userSettings = await getUserSettings();
        
        if (userSettings) {
          setSettings(prev => ({
            ...prev,
            ...userSettings
          }));
        }
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
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
    
    try {
      setLoading(true);
      await updateUserSettings(settings);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
    } finally {
      setLoading(false);
    }
  };

  // Renderizar a seção atual com base na aba ativa
  const renderActiveSection = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-lg text-gray-800 mb-4">Dados Pessoais</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input 
                type="text" 
                name="name"
                value={settings.name}
                onChange={handleChange}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                name="email"
                value={settings.email}
                onChange={handleChange}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>
            
            <div className="border-t pt-4 mt-6">
              <h4 className="font-medium text-gray-800 mb-3">Segurança da Conta</h4>
              
              <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 mb-2 w-full md:w-auto">
                Alterar Senha
              </button>
              
              <button className="px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-red-700 w-full md:w-auto">
                Excluir Conta
              </button>
            </div>
          </div>
        );
        
      case 'preferences':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-lg text-gray-800 mb-4">Preferências de Exibição</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Moeda</label>
                <select 
                  name="currency"
                  value={settings.currency}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                >
                  <option value="BRL">Real Brasileiro (R$)</option>
                  <option value="USD">Dólar Americano ($)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="GBP">Libra Esterlina (£)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Formato de Data</label>
                <select 
                  name="dateFormat"
                  value={settings.dateFormat}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                >
                  <option value="DD/MM/YYYY">DD/MM/AAAA</option>
                  <option value="MM/DD/YYYY">MM/DD/AAAA</option>
                  <option value="YYYY-MM-DD">AAAA-MM-DD</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tema</label>
                <select 
                  name="theme"
                  value={settings.theme}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                >
                  <option value="light">Claro</option>
                  <option value="dark">Escuro</option>
                  <option value="system">Sistema</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Idioma</label>
                <select 
                  name="language"
                  value={settings.language}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es">Español</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="font-medium text-gray-800 mb-3">Privacidade</h4>
              
              <div className="flex items-center mb-3">
                <input
                  id="showBalance"
                  type="checkbox"
                  name="showBalance"
                  checked={settings.showBalance}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="showBalance" className="ml-2 block text-sm text-gray-700">
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
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="hideAmounts" className="ml-2 block text-sm text-gray-700">
                  Ocultar valores em dispositivos públicos
                </label>
              </div>
            </div>
          </div>
        );
      
      case 'notifications':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-lg text-gray-800 mb-4">Notificações</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800">Notificações por Email</h4>
                  <p className="text-sm text-gray-500">Receba alertas importantes por email</p>
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
                        ${settings.emailNotifications ? 'bg-primary' : 'bg-gray-300'}`}
                    >
                      <span 
                        className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform 
                        ${settings.emailNotifications ? 'translate-x-6' : 'translate-x-0'}`} 
                      ></span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800">Alertas de Orçamento</h4>
                  <p className="text-sm text-gray-500">Receba alertas quando estiver próximo do limite</p>
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
                        ${settings.budgetAlerts ? 'bg-primary' : 'bg-gray-300'}`}
                    >
                      <span 
                        className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform 
                        ${settings.budgetAlerts ? 'translate-x-6' : 'translate-x-0'}`} 
                      ></span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800">Relatório Semanal</h4>
                  <p className="text-sm text-gray-500">Receba um resumo semanal da sua atividade financeira</p>
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
                        ${settings.weeklyReport ? 'bg-primary' : 'bg-gray-300'}`}
                    >
                      <span 
                        className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform 
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-lg text-gray-800 mb-4">Exportação e Backup</h3>
            
            <div className="mb-6">
              <h4 className="font-medium text-gray-800 mb-3">Exportar Dados</h4>
              
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Formato de Exportação</label>
                <select 
                  name="exportFormat"
                  value={settings.exportFormat}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                >
                  <option value="csv">CSV</option>
                  <option value="xlsx">Excel (XLSX)</option>
                  <option value="pdf">PDF</option>
                  <option value="json">JSON</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <button className="px-4 py-2 bg-primary hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center">
                  <i className="fas fa-download mr-2"></i>
                  Exportar Transações
                </button>
                
                <button className="px-4 py-2 bg-primary hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center">
                  <i className="fas fa-download mr-2"></i>
                  Exportar Orçamentos
                </button>
                
                <button className="px-4 py-2 bg-primary hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center">
                  <i className="fas fa-download mr-2"></i>
                  Exportar Metas
                </button>
                
                <button className="px-4 py-2 bg-indigo-800 hover:bg-indigo-900 text-white rounded-lg flex items-center justify-center">
                  <i className="fas fa-file-export mr-2"></i>
                  Exportar Todos os Dados
                </button>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h4 className="font-medium text-gray-800 mb-3">Backup</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center">
                  <i className="fas fa-cloud-upload-alt mr-2"></i>
                  Criar Backup Agora
                </button>
                
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center">
                  <i className="fas fa-cloud-download-alt mr-2"></i>
                  Restaurar Backup
                </button>
              </div>
              
              <div className="mt-4 bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">
                  <i className="fas fa-info-circle mr-1 text-blue-500"></i>
                  Último backup realizado em: <span className="font-medium">12/04/2025 às 15:30</span>
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
    <div className="bg-gray-50 min-h-screen">
      <Sidebar />
      <Header title="Configurações" onMenuClick={() => setMobileMenuOpen(true)} />
      <MobileSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      
      <div className="md:ml-64">
        <div className="p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Configurações</h2>
              <p className="text-gray-600">Personalize sua experiência no Controle Financeiro</p>
            </div>
          </div>

          {/* Conteúdo principal */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar de configurações */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <nav className="flex flex-col">
                  <button 
                    onClick={() => setActiveTab('profile')} 
                    className={`p-4 text-left flex items-center ${activeTab === 'profile' ? 'bg-indigo-50 text-primary' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <i className="fas fa-user mr-3 w-5"></i>
                    <span>Dados Pessoais</span>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('preferences')} 
                    className={`p-4 text-left flex items-center ${activeTab === 'preferences' ? 'bg-indigo-50 text-primary' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <i className="fas fa-cog mr-3 w-5"></i>
                    <span>Preferências</span>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('notifications')} 
                    className={`p-4 text-left flex items-center ${activeTab === 'notifications' ? 'bg-indigo-50 text-primary' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <i className="fas fa-bell mr-3 w-5"></i>
                    <span>Notificações</span>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('export')} 
                    className={`p-4 text-left flex items-center ${activeTab === 'export' ? 'bg-indigo-50 text-primary' : 'text-gray-700 hover:bg-gray-50'}`}
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
                  className="flex items-center px-6 py-3 bg-primary hover:bg-indigo-700 text-white rounded-lg shadow"
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
                <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg fade-in flex items-center">
                  <i className="fas fa-check-circle mr-2"></i>
                  <span>Configurações salvas com sucesso!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;