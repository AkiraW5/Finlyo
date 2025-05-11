import React, { useState, useEffect } from 'react';

const GoalModal = ({ isOpen, onClose, onSubmit, goal }) => {
    const [formData, setFormData] = useState({
        category: '',
        description: '',
        limit: '0,00',  // Inicializado com formato de moeda
        saved: '0,00',  // Inicializado com formato de moeda
        deadline: '',
        icon: 'plane',
        color: 'blue',
        automaticSavings: false,
        automaticAmount: '0,00'  // Inicializado com formato de moeda
    });

  // Preencher o formulário quando estiver editando uma meta existente
  useEffect(() => {
    if (goal) {
      // Formatar valores numéricos para exibição
      const formattedLimit = goal.limit ? 
        (parseFloat(goal.limit)).toFixed(2).replace('.', ',') : 
        '0,00';
      
      const formattedSaved = goal.saved ? 
        (parseFloat(goal.saved)).toFixed(2).replace('.', ',') : 
        '0,00';
      
      const formattedAutomaticAmount = goal.automaticAmount ? 
        (parseFloat(goal.automaticAmount)).toFixed(2).replace('.', ',') : 
        '0,00';
      
      setFormData({
        category: goal.category || '',
        description: goal.description || '',
        limit: formattedLimit,
        saved: formattedSaved,
        deadline: goal.deadline || '',
        type: 'goal',
        icon: goal.icon || 'plane',
        color: goal.color || 'blue',
        automaticSavings: goal.automaticSavings || false,
        automaticAmount: formattedAutomaticAmount
      });
    } else {
      // Resetar o formulário para uma nova meta
      setFormData({
        category: '',
        description: '',
        limit: '0,00',
        saved: '0,00',
        deadline: '',
        type: 'goal',
        icon: 'plane',
        color: 'blue',
        automaticSavings: false,
        automaticAmount: '0,00'
      });
    }
  }, [goal]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Para os campos de valor monetário, aplicar formatação especial
    if (name === 'limit' || name === 'saved' || name === 'automaticAmount') {
      // Remove caracteres não numéricos
      const digitsOnly = value.replace(/\D/g, '');
      
      // Converte para centavos (inteiro)
      const valueInCents = parseInt(digitsOnly || '0', 10);
      
      // Formata para o padrão brasileiro: 0,00
      const formattedValue = (valueInCents / 100).toFixed(2).replace('.', ',');
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      // Para outros campos, manter o comportamento original
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
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
    
    // Converter valores formatados para números antes de enviar
    const submissionData = {
      ...formData,
      limit: parseFloat(formData.limit.replace(',', '.')) || 0,
      saved: parseFloat(formData.saved.replace(',', '.')) || 0,
      automaticAmount: formData.automaticSavings ? 
        parseFloat(formData.automaticAmount.replace(',', '.')) || 0 : 0
    };
    
    onSubmit(submissionData);
  };

  // Se o modal não estiver aberto, não renderize nada
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto p-4">
      <div className="bg-white dark:bg-dark-200 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] my-8 transition-theme">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-400">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            {goal ? 'Editar Meta Financeira' : 'Nova Meta Financeira'}
          </h3>
          <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4">
              {/* Nome da Meta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da Meta</label>
                <input 
                  type="text" 
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-dark-300 rounded-lg bg-gray-50 dark:bg-dark-300 text-gray-800 dark:text-white focus:ring-primary focus:border-primary dark:focus:ring-indigo-600 dark:focus:border-indigo-500"
                  placeholder="Ex: Viagem para Europa" 
                  required
                />
              </div>
              
              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição (Opcional)</label>
                <textarea 
                  rows="2" 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-gray-300 dark:border-dark-300 bg-white dark:bg-dark-300 text-gray-800 dark:text-white shadow-sm focus:border-primary focus:ring-primary dark:focus:ring-indigo-600 dark:focus:border-indigo-500" 
                  placeholder="Detalhes sobre esta meta..."
                ></textarea>
              </div>
              
              {/* Ícones */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ícone</label>
                <div className="grid grid-cols-6 gap-2">
                  {['plane', 'home', 'laptop', 'graduation-cap', 'shield-alt', 'car', 
                    'piggy-bank', 'heart', 'briefcase', 'tshirt', 'music', 'camera'].map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => handleIconSelect(icon)}
                      className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300 border-2 ${formData.icon === icon ? 'border-indigo-500 dark:border-indigo-400' : 'border-transparent'}`}
                    >
                      <i className={`fas fa-${icon} text-gray-700 dark:text-gray-300`}></i>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Valor da Meta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor da Meta</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400">R$</span>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="limit"
                    value={formData.limit}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-300 rounded-lg bg-gray-50 dark:bg-dark-300 text-gray-800 dark:text-white focus:ring-primary focus:border-primary dark:focus:ring-indigo-600 dark:focus:border-indigo-500"
                    placeholder="0,00"
                    required
                  />
                </div>
              </div>
              
              {/* Valor Atual */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor Atual (Opcional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400">R$</span>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="saved"
                    value={formData.saved}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-300 rounded-lg bg-gray-50 dark:bg-dark-300 text-gray-800 dark:text-white focus:ring-primary focus:border-primary dark:focus:ring-indigo-600 dark:focus:border-indigo-500"
                    placeholder="0,00"
                  />
                </div>
              </div>
              
              {/* Prazo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prazo (Opcional)</label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-dark-300 rounded-lg bg-gray-50 dark:bg-dark-300 text-gray-800 dark:text-white focus:ring-primary focus:border-primary dark:focus:ring-indigo-600 dark:focus:border-indigo-500"
                />
              </div>
              
              {/* Cores */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cor</label>
                <div className="flex space-x-2">
                  {['blue', 'green', 'purple', 'indigo', 'yellow', 'red'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorSelect(color)}
                      className={`w-8 h-8 rounded-full bg-${color}-500 dark:bg-${color}-600 border-2 ${formData.color === color ? `border-${color}-700 dark:border-${color}-400` : 'border-transparent'} focus:outline-none`}
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
                  className="h-4 w-4 text-primary focus:ring-primary dark:focus:ring-indigo-600 border-gray-300 dark:border-dark-300 dark:bg-dark-300 rounded"
                />
                <label htmlFor="automaticSavings" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Depósito automático mensal
                </label>
              </div>
              
              {/* Valor do depósito automático */}
              {formData.automaticSavings && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor do depósito automático</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">R$</span>
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      name="automaticAmount"
                      value={formData.automaticAmount}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-300 rounded-lg bg-gray-50 dark:bg-dark-300 text-gray-800 dark:text-white focus:ring-primary focus:border-primary dark:focus:ring-indigo-600 dark:focus:border-indigo-500"
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
                className="px-4 py-2 border border-gray-300 dark:border-dark-400 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-300 hover:bg-gray-50 dark:hover:bg-dark-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-lg transition-colors"
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