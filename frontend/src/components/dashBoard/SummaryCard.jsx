import React from 'react';

const SummaryCard = ({ title, amount, icon, color, details }) => {
  // Extrair a cor base do valor (ex: "text-indigo-600" -> "indigo")
  const baseColor = color.replace('text-', '').replace(/-\d+$/, '');
  
  return (
    <div className="bg-white dark:bg-dark-200 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-dark-300 transition-theme">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <h3 className={`text-2xl font-bold mt-1 ${color}`}>{amount}</h3>
        </div>
        <div className={`bg-${baseColor}-100 dark:bg-${baseColor}-900 dark:bg-opacity-20 p-3 rounded-lg`}>
          <i className={`fas ${icon} ${color}`}></i>
        </div>
      </div>
      {details && (
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-dark-300">
          {details}
        </div>
      )}
    </div>
  );
};

export default SummaryCard;