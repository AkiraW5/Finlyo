import React, { useState, useEffect } from 'react';

const ContributionModal = ({ isOpen, onClose, onSubmit, goals, selectedGoal, accounts = [] }) => {
  const [formData, setFormData] = useState({
    goalId: '',
    amount: '',
    accountId: '', // Inicializado corretamente
    date: new Date().toISOString().split('T')[0],
    method: 'deposit',
    notes: '',
    type: 'budget_contribution'
  });

  // Atualizar o formulário quando uma meta for selecionada
  useEffect(() => {
    if (selectedGoal) {
      setFormData(prev => ({
        ...prev,
        goalId: selectedGoal.id
      }));
    }
  }, [selectedGoal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Se o modal não estiver aberto, não renderize nada
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Adicionar Contribuição</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4">
              {/* Selecione a Meta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Selecione a Meta</label>
                <select
                  name="goalId"
                  value={formData.goalId}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  required
                >
                  <option value="">Selecione uma meta</option>
                  {goals.map(goal => (
                    <option key={goal.id} value={goal.id}>
                      {goal.category}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Valor da Contribuição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor da Contribuição</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">R$</span>
                  </div>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary focus:border-primary"
                    placeholder="0,00"
                    required
                  />
                </div>
              </div>

              {/* Conta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conta</label>
                <select
                  name="accountId"
                  value={formData.accountId}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  required
                >
                  <option value="">Selecione uma conta</option>
                  {accounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Data da Contribuição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              
              {/* Método */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Método</label>
                <select
                  name="method"
                  value={formData.method}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  required
                >
                  <option value="deposit">Depósito manual</option>
                  <option value="transfer">Transferência</option>
                  <option value="automatic">Depósito automático</option>
                  <option value="other">Outro</option>
                </select>
              </div>
              
              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas (Opcional)</label>
                <textarea
                  rows="2"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  placeholder="Detalhes sobre esta contribuição..."
                ></textarea>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700"
              >
                Adicionar Contribuição
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContributionModal;