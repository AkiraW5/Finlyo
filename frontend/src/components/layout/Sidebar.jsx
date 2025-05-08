import React, { useState } from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const history = useHistory();
  const { currentUser, logout } = useAuth(); // Adicionar acesso à função de logout
  const [profileMenuOpen, setProfileMenuOpen] = useState(false); // Estado para controlar o dropdown
  
  // Função para verificar se um link está ativo
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  // Função para lidar com o logout
  const handleLogout = () => {
    logout();
    history.push('/login');
  };

  return (
    <div className="hidden md:flex flex-col w-64 bg-white border-r fixed top-0 left-0 bottom-0 z-10">
      {/* Perfil do usuário com dropdown */}
      <div className="p-4 border-b relative">
        <div 
          className="flex items-center cursor-pointer"
          onClick={() => setProfileMenuOpen(!profileMenuOpen)}
        >
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
            {currentUser?.name?.charAt(0) || 'U'}
          </div>
          <div className="ml-3 flex-grow">
            <p className="text-sm font-medium truncate">{currentUser?.name || 'Usuário'}</p>
            <p className="text-xs text-gray-500 truncate">{currentUser?.email || 'usuário@email.com'}</p>
          </div>
          <div className="text-gray-400">
            <i className={`fas fa-chevron-${profileMenuOpen ? 'up' : 'down'}`}></i>
          </div>
        </div>
        
        {/* Menu dropdown */}
        {profileMenuOpen && (
          <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-20">
            <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <i className="fas fa-user-cog mr-2"></i>
              Meu Perfil
            </Link>
            <button 
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              Sair
            </button>
          </div>
        )}
      </div>
      
      {/* Links de navegação - resto do código permanece igual */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-1">
          <Link to="/" className={`flex items-center px-4 py-2 text-sm rounded-lg ${isActive('/') ? 'bg-indigo-50 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}>
            <i className="fas fa-home mr-3 w-4"></i>
            <span>Dashboard</span>
          </Link>
          
          <Link to="/transactions" className={`flex items-center px-4 py-2 text-sm rounded-lg ${isActive('/transactions') ? 'bg-indigo-50 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}>
            <i className="fas fa-exchange-alt mr-3 w-4"></i>
            <span>Transações</span>
          </Link>
          
          <Link to="/accounts" className={`flex items-center px-4 py-2 text-sm rounded-lg ${isActive('/accounts') ? 'bg-indigo-50 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}>
            <i className="fas fa-wallet mr-3 w-4"></i>
            <span>Contas</span>
          </Link>
          
          <Link to="/categories" className={`flex items-center px-4 py-2 text-sm rounded-lg ${isActive('/categories') ? 'bg-indigo-50 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}>
            <i className="fas fa-tags mr-3 w-4"></i>
            <span>Categorias</span>
          </Link>
          
          <Link to="/budget" className={`flex items-center px-4 py-2 text-sm rounded-lg ${isActive('/budget') ? 'bg-indigo-50 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}>
            <i className="fas fa-chart-pie mr-3 w-4"></i>
            <span>Orçamentos</span>
          </Link>
          
          <Link to="/goals" className={`flex items-center px-4 py-2 text-sm rounded-lg ${isActive('/goals') ? 'bg-indigo-50 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}>
            <i className="fas fa-bullseye mr-3 w-4"></i>
            <span>Metas</span>
          </Link>
          
          <Link to="/reports" className={`flex items-center px-4 py-2 text-sm rounded-lg ${isActive('/reports') ? 'bg-indigo-50 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}>
            <i className="fas fa-chart-bar mr-3 w-4"></i>
            <span>Relatórios</span>
          </Link>
        </nav>
      </div>
      
      {/* Footer com link para configurações */}
      <div className="p-4 border-t">
        <Link to="/settings" className={`flex items-center px-4 py-2 text-sm rounded-lg ${isActive('/settings') ? 'bg-indigo-50 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}>
          <i className="fas fa-cog mr-3 w-4"></i>
          <span>Configurações</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;