import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserSettingsContext } from '../../contexts/UserSettingsContext'; // Adicionar essa importação

const PayCreditCardModal = ({ isOpen, onClose, onSubmit, creditCardAccounts, bankAccounts }) => {
  const { currentUser } = useAuth();
  const { formatCurrency } = useUserSettingsContext(); // Obter a função de formatação
  
  const [formData, setFormData] = useState({
    creditCardId: '',
    bankAccountId: '',
    amount: '',
    date: new Date().toISOString().substr(0, 10),
    description: 'Pagamento de fatura',
    notes: ''
  });
  
  // Resetar formulário quando o modal é aberto
  useEffect(() => {
    if (isOpen && creditCardAccounts.length > 0 && bankAccounts.length > 0) {
      // Obter o primeiro cartão e seu saldo formatado corretamente
      const firstCard = creditCardAccounts[0];
      const rawAmount = getCreditCardBalance(firstCard.id);
      
      setFormData({
        creditCardId: firstCard.id,
        bankAccountId: bankAccounts[0].id,
        amount: rawAmount, // Usar o valor não formatado no campo
        date: new Date().toISOString().substr(0, 10),
        description: `Pagamento de fatura - ${firstCard.name}`,
        notes: ''
      });
    }
  }, [isOpen, creditCardAccounts, bankAccounts]);
  
  // Obter o saldo atual do cartão de crédito como valor numérico
  const getCreditCardBalance = (cardId) => {
    const card = creditCardAccounts.find(cc => cc.id === cardId);
    if (card && card.balance !== undefined) {
      // Garantir que retornamos um valor numérico para o input
      const balanceValue = Math.abs(parseFloat(card.balance));
      return balanceValue.toFixed(2).replace('.', ',');
    }
    return '';
  };
  
  // Atualizar o valor automaticamente quando o cartão de crédito é alterado
  const handleCreditCardChange = (e) => {
    const creditCardId = e.target.value;
    const selectedCard = creditCardAccounts.find(cc => cc.id === creditCardId);
    
    setFormData(prev => ({
      ...prev,
      creditCardId,
      amount: getCreditCardBalance(creditCardId) || prev.amount,
      description: `Pagamento de fatura - ${selectedCard?.name || 'Cartão'}`
    }));
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.creditCardId || !formData.bankAccountId || !formData.amount) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    const paymentData = {
      ...formData,
      amount: parseFloat(formData.amount.replace(',', '.')),
      userId: currentUser.id,
      type: 'credit_payment'
    };
    
    onSubmit(paymentData);
  };
  
  if (!isOpen) return null;

  // Calcular valores para exibição
  const selectedCard = creditCardAccounts.find(cc => cc.id === formData.creditCardId);
  const formattedBalance = selectedCard ? 
    formatCurrency(Math.abs(parseFloat(selectedCard.balance || 0))) : 
    'R$ 0,00';
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 transition-theme">
      <div className="bg-white dark:bg-dark-200 rounded-xl shadow-lg w-full max-w-md transition-theme">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white transition-theme">Pagamento de Fatura</h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          {selectedCard && (
            <div className="mb-4 p-4 bg-indigo-50 dark:bg-indigo-900 dark:bg-opacity-10 rounded-lg">
              <p className="text-gray-600 dark:text-gray-300">Fatura atual:</p>
              <p className="text-lg font-bold text-red-600 dark:text-red-400">{formattedBalance}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* Resto do código continua igual */}
            {/* ... */}

            {/* Cartão de Crédito */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-theme" htmlFor="creditCardId">
                Cartão de Crédito
              </label>
              <select
                id="creditCardId"
                name="creditCardId"
                value={formData.creditCardId}
                onChange={handleCreditCardChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-400 dark:bg-dark-300 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-indigo-600 transition-theme"
                required
              >
                {creditCardAccounts.length === 0 && (
                  <option value="">Nenhum cartão de crédito disponível</option>
                )}
                {creditCardAccounts.map(card => (
                  <option key={card.id} value={card.id}>
                    {card.name} ({card.bankName || 'Sem banco'})
                  </option>
                ))}
              </select>
            </div>
            
            {/* Conta para Pagamento */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-theme" htmlFor="bankAccountId">
                Pagar com
              </label>
              <select
                id="bankAccountId"
                name="bankAccountId"
                value={formData.bankAccountId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-400 dark:bg-dark-300 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-indigo-600 transition-theme"
                required
              >
                {bankAccounts.length === 0 && (
                  <option value="">Nenhuma conta bancária disponível</option>
                )}
                {bankAccounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.bankName || 'Sem banco'})
                  </option>
                ))}
              </select>
            </div>
            
            {/* Valor */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-theme" htmlFor="amount">
                Valor
              </label>
              <div className="relative rounded-lg border border-gray-300 dark:border-dark-400 focus-within:ring-2 focus-within:ring-primary dark:focus-within:ring-indigo-600 focus-within:border-transparent transition-theme">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">R$</span>
                <input
                  id="amount"
                  type="text"
                  name="amount"
                  required
                  value={formData.amount}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border-0 rounded-lg focus:outline-none dark:bg-dark-300 dark:text-white transition-theme"
                  placeholder="0,00"
                />
              </div>
            </div>
            
            {/* Data */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-theme" htmlFor="date">
                Data do Pagamento
              </label>
              <input
                id="date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-400 dark:bg-dark-300 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-indigo-600 transition-theme"
                required
              />
            </div>
            
            {/* Descrição */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-theme" htmlFor="description">
                Descrição
              </label>
              <input
                id="description"
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-400 dark:bg-dark-300 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-indigo-600 transition-theme"
                required
              />
            </div>
            
            {/* Observações */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-theme" htmlFor="notes">
                Observações (opcional)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-400 dark:bg-dark-300 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-indigo-600 transition-theme"
                placeholder="Informações adicionais sobre o pagamento"
                rows="2"
              ></textarea>
            </div>
            
            {/* Botões */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-dark-400 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-lg transition-colors"
              >
                Pagar Fatura
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PayCreditCardModal;