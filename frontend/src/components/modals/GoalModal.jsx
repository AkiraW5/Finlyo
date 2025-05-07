import React, { useState, useEffect } from 'react';

const GoalModal = ({ isOpen, onClose, onSubmit, goal }) => {
    const [formData, setFormData] = useState({
        category: '',
        description: '',
        limit: '', // Este valor será mapeado para 'amount'
        deadline: '',
        icon: 'plane',
        color: 'blue',
        automaticSavings: false,
        automaticAmount: ''
      });

  // Preencher o formulário quando estiver editando uma meta existente
  useEffect(() => {
    if (goal) {
      setFormData({
        category: goal.category || '',
        description: goal.description || '',
        limit: goal.limit || '',
        saved: goal.saved || '',
        deadline: goal.deadline || '',
        type: 'goal',
        icon: goal.icon || 'plane',
        color: goal.color || 'blue',
        automaticSavings: goal.automaticSavings || false,
        automaticAmount: goal.automaticAmount || ''
      });
    } else {
      // Resetar o formulário para uma nova meta
      setFormData({
        category: '',
        description: '',
        limit: '',
        saved: '',
        deadline: '',
        type: 'goal',
        icon: 'plane',
        color: 'blue',
        automaticSavings: false,
        automaticAmount: ''
      });
    }
  }, [goal]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleIconSelect = (icon) => {
    setFormData({
      ...formData,
      icon
    });
  };

  const handleColorSelect = (color) => {
    setFormData({
      ...formData,
      color
    });
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
          <h3 className="text-lg font-semibold text-gray-800">
            {goal ? 'Editar Meta Financeira' : 'Nova Meta Financeira'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4">
              {/* Nome da Meta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Meta</label>
                <input 
                  type="text" 
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary focus:border-primary"
                  placeholder="Ex: Viagem para Europa" 
                  required
                />
              </div>
              
              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (Opcional)</label>
                <textarea 
                  rows="2" 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary" 
                  placeholder="Detalhes sobre esta meta..."
                ></textarea>
              </div>
              
              {/* Ícones */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ícone</label>
                <div className="grid grid-cols-6 gap-2">
                  {['plane', 'home', 'laptop', 'graduation-cap', 'shield-alt', 'car', 
                    'piggy-bank', 'heart', 'briefcase', 'tshirt', 'music', 'camera'].map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => handleIconSelect(icon)}
                      className={`p-2 rounded-lg hover:bg-gray-100 border-2 ${formData.icon === icon ? 'border-indigo-500' : 'border-transparent'}`}
                    >
                      <i className={`fas fa-${icon} text-gray-700`}></i>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Valor da Meta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor da Meta</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">R$</span>
                  </div>
                  <input
                    type="number"
                    name="limit"
                    value={formData.limit}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary focus:border-primary"
                    placeholder="0,00"
                    required
                  />
                </div>
              </div>
              
              {/* Valor Atual */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor Atual (Opcional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">R$</span>
                  </div>
                  <input
                    type="number"
                    name="saved"
                    value={formData.saved}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary focus:border-primary"
                    placeholder="0,00"
                  />
                </div>
              </div>
              
              {/* Prazo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prazo (Opcional)</label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary focus:border-primary"
                />
              </div>
              
              {/* Cores */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
                <div className="flex space-x-2">
                  {['blue', 'green', 'purple', 'indigo', 'yellow', 'red'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorSelect(color)}
                      className={`w-8 h-8 rounded-full bg-${color}-500 border-2 ${formData.color === color ? `border-${color}-700` : 'border-transparent'} focus:outline-none`}
                    ></button>
                  ))}
                </div>
              </div>
              
              {/* Depósito Automático */}
              <div className="flex items-center">
                <input
                  id="automaticSavings"
                  type="checkbox"
                  name="automaticSavings"
                  checked={formData.automaticSavings}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="automaticSavings" className="ml-2 block text-sm text-gray-700">
                  Depósito automático mensal
                </label>
              </div>
              
              {/* Valor do depósito automático */}
              {formData.automaticSavings && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor do depósito automático</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">R$</span>
                    </div>
                    <input
                      type="number"
                      name="automaticAmount"
                      value={formData.automaticAmount}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary focus:border-primary"
                      placeholder="0,00"
                      required={formData.automaticSavings}
                    />
                  </div>
                </div>
              )}
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
                {goal ? 'Salvar Alterações' : 'Criar Meta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GoalModal;