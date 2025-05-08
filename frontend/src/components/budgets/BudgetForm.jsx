import React, { useState, useEffect } from 'react';

const BudgetForm = ({ isOpen, onClose, onSubmit, budget, categories }) => {
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    description: '',
    type: 'expense', // Tipo padrão é despesa
    period: 'monthly'
  });
  
  const [errors, setErrors] = useState({});

  // Importante: quando receber um novo budget, atualize o formData
  useEffect(() => {
    if (budget) {
      setFormData({
        categoryId: budget.categoryId || '',
        amount: budget.amount || '',
        description: budget.description || '',
        type: budget.type || 'expense', // Preserva o tipo recebido do budget
        period: budget.period || 'monthly'
      });
      
      // Limpar erros quando receber novo budget
      setErrors({});
    }
  }, [budget]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.categoryId) {
      newErrors.categoryId = 'Selecione uma categoria';
    }
    
    if (!formData.amount) {
      newErrors.amount = 'Informe o valor do orçamento';
    } else if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar formulário antes de enviar
    if (!validateForm()) {
      return;
    }
    
    // Log para depuração
    console.log("Enviando orçamento:", formData);
    
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro específico quando o campo é alterado
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Filtrar categorias com base no tipo selecionado
  const filteredCategories = categories.filter(
    category => !category.type || category.type === formData.type
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            {budget && budget.id 
              ? `Editar ${formData.type === 'income' ? 'Receita' : 'Despesa'}` 
              : `Nova ${formData.type === 'income' ? 'Receita' : 'Despesa'}`}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            {/* Tipo de orçamento (despesa/receita) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input 
                    type="radio" 
                    name="type" 
                    value="expense"
                    checked={formData.type === 'expense'}
                    onChange={handleChange}
                    className="form-radio text-red-600" 
                  />
                  <span className="ml-2 text-gray-700">Despesa</span>
                </label>
                <label className="inline-flex items-center">
                  <input 
                    type="radio" 
                    name="type" 
                    value="income"
                    checked={formData.type === 'income'}
                    onChange={handleChange}
                    className="form-radio text-green-600" 
                  />
                  <span className="ml-2 text-gray-700">Receita</span>
                </label>
              </div>
            </div>
            
            {/* Categoria - filtrada pelo tipo selecionado */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className={`w-full border ${errors.categoryId ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              >
                <option value="">Selecione uma categoria</option>
                {filteredCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>
              )}
            </div>
            
            {/* Valor */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formData.type === 'income' ? 'Valor Previsto' : 'Valor Orçado'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0,00"
                  className={`w-full border ${errors.amount ? 'border-red-500' : 'border-gray-300'} rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
              </div>
              {errors.amount && (
                <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
              )}
            </div>
            
            {/* Descrição */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição (opcional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder={`Adicione uma descrição para ${formData.type === 'income' ? 'esta receita' : 'este orçamento'}...`}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              ></textarea>
            </div>
            
            {/* Botões de ação */}
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`px-4 py-2 text-white rounded-lg ${
                  formData.type === 'income'
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {budget && budget.id ? 'Atualizar' : 'Criar'} {formData.type === 'income' ? 'Receita' : 'Despesa'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BudgetForm;