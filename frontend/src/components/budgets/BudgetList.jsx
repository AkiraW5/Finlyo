import React from 'react';

const budgetData = [
  { id: 1, name: 'Alimentação', current: 600, limit: 800, color: 'bg-red-500', percentage: 75 },
  { id: 2, name: 'Transporte', current: 180, limit: 300, color: 'bg-blue-500', percentage: 60 },
  { id: 3, name: 'Lazer', current: 250, limit: 500, color: 'bg-yellow-500', percentage: 50 },
  { id: 4, name: 'Saúde', current: 100, limit: 400, color: 'bg-green-500', percentage: 25 },
  { id: 5, name: 'Educação', current: 300, limit: 500, color: 'bg-purple-500', percentage: 60 },
];

const categories = [
  { name: 'Alimentação', color: 'bg-red-50 text-red-600' },
  { name: 'Moradia', color: 'bg-blue-50 text-blue-600' },
  { name: 'Lazer', color: 'bg-yellow-50 text-yellow-600' },
  { name: 'Transporte', color: 'bg-purple-50 text-purple-600' },
  { name: 'Saúde', color: 'bg-green-50 text-green-600' },
];

const BudgetList = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">Orçamentos</h3>
        <button className="text-primary text-sm font-medium">Gerenciar</button>
      </div>
      
      <div className="space-y-4">
        {budgetData.map(budget => (
          <div key={budget.id}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">{budget.name}</span>
              <span className="text-xs text-gray-500">
                R$ {budget.current} / R$ {budget.limit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`${budget.color} h-2 rounded-full`} 
                style={{ width: `${budget.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6">
        <h4 className="font-medium text-sm mb-3">Categorias mais usadas</h4>
        <div className="flex flex-wrap gap-2">
          {categories.map((category, index) => (
            <span 
              key={index}
              className={`category-chip px-3 py-1 ${category.color} text-xs rounded-full hover:bg-opacity-80`}
            >
              {category.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BudgetList;