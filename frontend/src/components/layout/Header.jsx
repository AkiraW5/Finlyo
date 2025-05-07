import React from 'react';

const Header = ({ onMenuClick }) => {
  return (
    <div className="md:hidden flex items-center justify-between h-16 px-4 bg-primary text-white">
      <button onClick={onMenuClick} className="text-white focus:outline-none">
        <i className="fas fa-bars"></i>
      </button>
      <h1 className="font-bold text-xl">Meu Financeiro</h1>
      <div className="w-6"></div>
    </div>
  );
};

export default Header;