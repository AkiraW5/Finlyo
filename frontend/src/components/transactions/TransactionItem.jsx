import React from 'react';

const TransactionItem = ({ transaction }) => {
  const { type, description, amount, category, date, place, icon, iconBg, categoryBg } = transaction;
  
  return (
    <div className="transaction-card bg-white p-4 rounded-lg border border-gray-100 hover:border-primary transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`${iconBg} p-3 rounded-lg mr-3`}>
            <i className={`fas ${icon}`}></i>
          </div>
          <div>
            <h4 className="font-medium">{description}</h4>
            <p className="text-xs text-gray-500">{place} • {date}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`font-medium ${type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
            {type === 'income' ? '+' : '-'} R$ {Number(amount).toFixed(2).replace('.', ',')}
          </p>
          <span className={`px-2 py-1 ${categoryBg} text-xs rounded-full`}>{category}</span>
        </div>
      </div>
    </div>
  );
};

export default TransactionItem;