import React from 'react';
import ThemeToggle from '../common/ThemeToggle';

const Header = ({ title, onMenuClick }) => {
  return (
    <>
      {/* Header para desktop */}
      <header className="hidden md:block bg-white dark:bg-dark-200 shadow-sm border-b border-gray-100 dark:border-dark-300 py-4 px-6 md:ml-64">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={onMenuClick} 
              className="md:hidden mr-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <i className="fas fa-bars"></i>
            </button>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">{title}</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Botão de toggle de tema */}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Header para mobile */}
      <div className="md:hidden flex items-center justify-between h-16 px-4 bg-primary text-white">
        <button onClick={onMenuClick} className="text-white focus:outline-none">
          <i className="fas fa-bars"></i>
        </button>
        <div className="flex items-center">
          <img src="/finlyo-icon.png" alt="Finlyo" className="h-8 w-8 mr-2" />
          <h1 className="font-bold text-xl">Finlyo</h1>
        </div>
        <div className="w-6">
          <ThemeToggle />
        </div>
      </div>
    </>
  );
};

export default Header;