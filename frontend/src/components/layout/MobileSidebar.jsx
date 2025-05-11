import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const MobileSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 bg-gray-900 bg-opacity-50 ${isOpen ? '' : 'hidden'}`}>
      <div className={`bg-white w-64 h-full max-h-screen transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? '' : '-translate-x-full'}`}>
        {/* Cabeçalho com logo - fixo no topo */}
        <div className="flex items-center justify-between h-16 min-h-[4rem] px-4 bg-primary text-white">
          <div className="flex items-center">
            <img src="/finlyo-icon.png" alt="Finlyo" className="h-8 w-8 mr-2" />
            <span className="font-bold">Finlyo</span>
          </div>
          <button onClick={onClose} className="text-white focus:outline-none">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Perfil do usuário */}
        <div className="p-4 border-b flex items-center space-x-3 min-h-[4.5rem]">
          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
            <i className="fas fa-user"></i>
          </div>
          <div>
            <p className="font-medium">{currentUser?.name || 'Usuário'}</p>
            <p className="text-xs text-gray-500">{currentUser?.email || 'usuário@email.com'}</p>
          </div>
        </div>

        {/* Links de navegação - área rolável */}
        <nav className="flex-1 overflow-y-auto pt-2">
          <Link 
            to="/" 
            className={`flex items-center px-6 py-2.5 ${
              location.pathname === '/' 
                ? 'text-primary bg-indigo-50' 
                : 'text-gray-600 hover:bg-indigo-50 hover:text-primary'
            }`} 
            onClick={onClose}
          >
            <i className="fas fa-home mr-3 w-4"></i>
            <span>Dashboard</span>
          </Link>
          <Link 
            to="/transactions" 
            className={`flex items-center px-6 py-2.5 ${
              location.pathname === '/transactions' 
                ? 'text-primary bg-indigo-50' 
                : 'text-gray-600 hover:bg-indigo-50 hover:text-primary'
            }`} 
            onClick={onClose}
          >
            <i className="fas fa-exchange-alt mr-3 w-4"></i>
            <span>Transações</span>
          </Link>
          <Link 
            to="/accounts" 
            className={`flex items-center px-6 py-2.5 ${
              location.pathname === '/accounts' 
                ? 'text-primary bg-indigo-50' 
                : 'text-gray-600 hover:bg-indigo-50 hover:text-primary'
            }`} 
            onClick={onClose}
          >
            <i className="fas fa-wallet mr-3 w-4"></i>
            <span>Contas</span>
          </Link>
          <Link 
            to="/categories" 
            className={`flex items-center px-6 py-2.5 ${
              location.pathname === '/categories' 
                ? 'text-primary bg-indigo-50' 
                : 'text-gray-600 hover:bg-indigo-50 hover:text-primary'
            }`} 
            onClick={onClose}
          >
            <i className="fas fa-tags mr-3 w-4"></i>
            <span>Categorias</span>
          </Link>
          <Link 
            to="/budget" 
            className={`flex items-center px-6 py-2.5 ${
              location.pathname === '/budget' 
                ? 'text-primary bg-indigo-50' 
                : 'text-gray-600 hover:bg-indigo-50 hover:text-primary'
            }`} 
            onClick={onClose}
          >
            <i className="fas fa-chart-pie mr-3 w-4"></i>
            <span>Orçamentos</span>
          </Link>
          <Link 
            to="/goals" 
            className={`flex items-center px-6 py-2.5 ${
              location.pathname === '/goals' 
                ? 'text-primary bg-indigo-50' 
                : 'text-gray-600 hover:bg-indigo-50 hover:text-primary'
            }`} 
            onClick={onClose}
          >
            <i className="fas fa-bullseye mr-3 w-4"></i>
            <span>Metas</span>
          </Link>
          <Link 
            to="/reports" 
            className={`flex items-center px-6 py-2.5 ${
              location.pathname === '/reports' 
                ? 'text-primary bg-indigo-50' 
                : 'text-gray-600 hover:bg-indigo-50 hover:text-primary'
            }`} 
            onClick={onClose}
          >
            <i className="fas fa-chart-bar mr-3 w-4"></i>
            <span>Relatórios</span>
          </Link>
        </nav>

        {/* Footer com configurações e logout - fixo na parte inferior */}
        <div className="p-3 border-t mt-auto">
          <Link 
            to="/settings" 
            className={`flex items-center px-4 py-2 mb-2 rounded-lg ${
              location.pathname === '/settings' 
                ? 'text-primary bg-indigo-50' 
                : 'text-gray-600 hover:bg-indigo-50 hover:text-primary'
            }`} 
            onClick={onClose}
          >
            <i className="fas fa-cog mr-3 w-4"></i>
            <span>Configurações</span>
          </Link>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 rounded-lg text-red-600 hover:bg-red-50"
          >
            <i className="fas fa-sign-out-alt mr-3 w-4"></i>
            <span>Sair</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileSidebar;