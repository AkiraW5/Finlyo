import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const { pathname } = location;
  
  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg hidden md:block">
      <div className="flex items-center justify-center h-16 px-4 bg-primary">
        <h1 className="text-white font-bold text-xl">Meu Financeiro</h1>
      </div>
      <div className="p-4 border-b flex items-center space-x-3">
        <img className="w-10 h-10 rounded-full" src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" />
        <div>
          <p className="font-medium">João Silva</p>
          <p className="text-xs text-gray-500">joao@email.com</p>
        </div>
      </div>
      <nav className="mt-4">
        <Link 
          to="/" 
          className={`flex items-center px-6 py-3 ${
            pathname === '/' 
              ? 'text-primary bg-indigo-50 border-r-4 border-primary' 
              : 'text-gray-600 hover:bg-indigo-50 hover:text-primary'
          }`}
        >
          <i className="fas fa-chart-pie mr-3"></i>
          <span>Visão Geral</span>
        </Link>
        <Link 
          to="/transactions" 
          className={`flex items-center px-6 py-3 ${
            pathname === '/transactions' 
              ? 'text-primary bg-indigo-50 border-r-4 border-primary' 
              : 'text-gray-600 hover:bg-indigo-50 hover:text-primary'
          }`}
        >
          <i className="fas fa-exchange-alt mr-3"></i>
          <span>Transações</span>
        </Link>
        <Link 
          to="/accounts" 
          className={`flex items-center px-6 py-3 ${
            pathname === '/accounts' 
              ? 'text-primary bg-indigo-50 border-r-4 border-primary' 
              : 'text-gray-600 hover:bg-indigo-50 hover:text-primary'
          }`}
        >
          <i className="fas fa-wallet mr-3"></i>
          <span>Contas</span>
        </Link>
        <Link 
          to="/categories" 
          className={`flex items-center px-6 py-3 ${
            pathname === '/categories' 
              ? 'text-primary bg-indigo-50 border-r-4 border-primary' 
              : 'text-gray-600 hover:bg-indigo-50 hover:text-primary'
          }`}
        >
          <i className="fas fa-tags mr-3"></i>
          <span>Categorias</span>
        </Link>
        <Link 
          to="/budgets" 
          className={`flex items-center px-6 py-3 ${
            pathname === '/budgets' 
              ? 'text-primary bg-indigo-50 border-r-4 border-primary' 
              : 'text-gray-600 hover:bg-indigo-50 hover:text-primary'
          }`}
        >
          <i className="fas fa-bullseye mr-3"></i>
          <span>Metas</span>
        </Link>
        <Link 
          to="/reports" 
          className={`flex items-center px-6 py-3 ${
            pathname === '/reports' 
              ? 'text-primary bg-indigo-50 border-r-4 border-primary' 
              : 'text-gray-600 hover:bg-indigo-50 hover:text-primary'
          }`}
        >
          <i className="fas fa-chart-line mr-3"></i>
          <span>Relatórios</span>
        </Link>
      </nav>
      <div className="absolute bottom-0 w-full p-4 border-t">
        <Link 
          to="/settings" 
          className={`flex items-center px-4 py-2 rounded-lg ${
            pathname === '/settings' 
              ? 'text-primary bg-indigo-50' 
              : 'text-gray-600 hover:bg-indigo-50 hover:text-primary'
          }`}
        >
          <i className="fas fa-cog mr-3"></i>
          <span>Configurações</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;