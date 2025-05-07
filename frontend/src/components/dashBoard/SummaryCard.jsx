import React from 'react';

const SummaryCard = ({ title, amount, icon, color, details }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className={`text-2xl font-bold mt-1 ${color}`}>{amount}</h3>
        </div>
        <div className={`bg-${color.replace('text-', '')}-100 p-3 rounded-lg`}>
          <i className={`fas ${icon} ${color}`}></i>
        </div>
      </div>
      {details && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          {details}
        </div>
      )}
    </div>
  );
};

export default SummaryCard;