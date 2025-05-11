import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  
  // Função para verificar se um link está ativo
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  // Função para lidar com o logout
  const handleLogout = () => {
    logout();
    navigate.push('/login');
  };

  return (
    <div className="hidden md:flex flex-col w-64 bg-white dark:bg-dark-200 border-r border-gray-100 dark:border-dark-300 fixed top-0 left-0 bottom-0 z-10 transition-theme">
      {/* Perfil do usuário com dropdown */}
      <div className="p-4 border-b border-gray-100 dark:border-dark-300 relative">
        <div 
          className="flex items-center cursor-pointer" 
          onClick={() => setProfileMenuOpen(!profileMenuOpen)}
        >
          <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 dark:bg-opacity-50 flex items-center justify-center text-indigo-500 dark:text-indigo-400 mr-2">
            <i className="fas fa-user"></i>
          </div>
          <div className="ml-1 flex-grow">
            <p className="text-sm font-medium truncate text-gray-800 dark:text-white">{currentUser?.name || 'Usuário'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentUser?.email || 'usuário@email.com'}</p>
          </div>
          <div className="text-gray-400 dark:text-gray-500">
            <i className={`fas fa-chevron-${profileMenuOpen ? 'up' : 'down'}`}></i>
          </div>
        </div>
        
        {/* Menu dropdown */}
        {profileMenuOpen && (
          <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-dark-200 border border-gray-200 dark:border-dark-300 rounded-md shadow-lg z-20">
            <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-300">
              <i className="fas fa-user-cog mr-2"></i>
              Meu Perfil
            </Link>
            <button 
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-dark-300"
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              Sair
            </button>
          </div>
        )}
      </div>
      
      {/* Links de navegação */}
      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        <nav className="px-2 space-y-1">
          <Link to="/" className={`nav-link ${isActive('/') ? 'nav-link-active' : 'nav-link-inactive'}`}>
            <i className="fas fa-home mr-3 w-4"></i>
            <span>Dashboard</span>
          </Link>
          
          <Link to="/transactions" className={`nav-link ${isActive('/transactions') ? 'nav-link-active' : 'nav-link-inactive'}`}>
            <i className="fas fa-exchange-alt mr-3 w-4"></i>
            <span>Transações</span>
          </Link>
          
          <Link to="/accounts" className={`nav-link ${isActive('/accounts') ? 'nav-link-active' : 'nav-link-inactive'}`}>
            <i className="fas fa-wallet mr-3 w-4"></i>
            <span>Contas</span>
          </Link>
          
          <Link to="/categories" className={`nav-link ${isActive('/categories') ? 'nav-link-active' : 'nav-link-inactive'}`}>
            <i className="fas fa-tags mr-3 w-4"></i>
            <span>Categorias</span>
          </Link>
          
          <Link to="/budget" className={`nav-link ${isActive('/budget') ? 'nav-link-active' : 'nav-link-inactive'}`}>
            <i className="fas fa-chart-pie mr-3 w-4"></i>
            <span>Orçamentos</span>
          </Link>
          
          <Link to="/goals" className={`nav-link ${isActive('/goals') ? 'nav-link-active' : 'nav-link-inactive'}`}>
            <i className="fas fa-bullseye mr-3 w-4"></i>
            <span>Metas</span>
          </Link>
          
          <Link to="/reports" className={`nav-link ${isActive('/reports') ? 'nav-link-active' : 'nav-link-inactive'}`}>
            <i className="fas fa-chart-bar mr-3 w-4"></i>
            <span>Relatórios</span>
          </Link>
        </nav>
      </div>
      
      {/* Link para testes em ambiente de desenvolvimento */}
      {process.env.NODE_ENV === 'development' && (
        <Link to="/system-tests" className={`nav-link mx-2 my-1 ${isActive('/system-tests') ? 'nav-link-active' : 'nav-link-inactive'}`}>
          <i className="fas fa-flask mr-3 w-4"></i>
          <span>Testes de Sistema</span>
        </Link>
      )}

      {/* Footer com link para configurações */}
      <div className="p-4 border-t border-gray-100 dark:border-dark-300">
        <Link to="/settings" className={`nav-link ${isActive('/settings') ? 'nav-link-active' : 'nav-link-inactive'}`}>
          <i className="fas fa-cog mr-3 w-4"></i>
          <span>Configurações</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;