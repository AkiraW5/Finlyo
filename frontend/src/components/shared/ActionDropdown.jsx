import React, { useState, useRef, useEffect } from 'react';

/**
 * Componente de dropdown modular para ações como editar, visualizar e excluir
 * @param {Object} props - Props do componente
 * @param {Array} props.actions - Array de objetos com as ações disponíveis
 * @param {string} props.actions[].label - Texto da ação
 * @param {Function} props.actions[].onClick - Função a ser executada quando a ação for clicada
 * @param {string} props.actions[].icon - Ícone da ação (opcional)
 * @param {string} props.actions[].color - Cor do texto (opcional, ex: 'text-red-600')
 */
const ActionDropdown = ({ actions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  // Fecha o dropdown quando clica fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="dropdown relative" ref={dropdownRef}>
      <button 
        className="text-gray-400 hover:text-gray-600 focus:outline-none" 
        onClick={toggleDropdown}
        aria-label="Menu de ações"
      >
        <i className="fas fa-ellipsis-v"></i>
      </button>
      {isOpen && (
        <div className="dropdown-menu absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10">
          {actions.map((action, index) => (
            <button 
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
                setIsOpen(false);
              }}
              className={`block w-full text-left px-4 py-2 text-sm ${action.color || 'text-gray-700'} hover:bg-gray-100`}
            >
              {action.icon && <i className={`fas fa-${action.icon} mr-2`}></i>}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionDropdown;