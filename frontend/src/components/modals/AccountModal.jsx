import React, { useState, useEffect } from 'react';

const AccountModal = ({ isOpen, onClose, onSubmit, account = null }) => {
  const [accountType, setAccountType] = useState('');
  const [name, setName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [balance, setBalance] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [color, setColor] = useState('indigo');
  const [notes, setNotes] = useState('');

  // Carregar dados quando estiver editando uma conta existente
  useEffect(() => {
    if (account) {
      setAccountType(account.type || '');
      setName(account.name || '');
      setBankName(account.bankName || '');
      setAccountNumber(account.accountNumber || '');
      setBalance(account.balance ? account.balance.toString() : '');
      setCreditLimit(account.creditLimit ? account.creditLimit.toString() : '');
      setColor(account.color || 'indigo');
      setNotes(account.notes || '');
    } else {
      resetForm();
    }
  }, [account]);

  const resetForm = () => {
    setAccountType('');
    setName('');
    setBankName('');
    setAccountNumber('');
    setBalance('');
    setCreditLimit('');
    setColor('indigo');
    setNotes('');
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const balanceValue = parseFloat(balance.replace(',', '.'));
    const creditLimitValue = creditLimit ? parseFloat(creditLimit.replace(',', '.')) : 0;
    
    const accountData = {
      type: accountType,
      name,
      bankName: bankName || null,
      accountNumber: accountNumber || null,
      balance: balanceValue,
      creditLimit: accountType === 'credit' ? creditLimitValue : null,
      color,
      notes
    };
    
    onSubmit(accountData);
    resetForm();
  };
  
  const handleCancel = () => {
    resetForm();
    onClose();
  };
  
  // Verifica se certos campos devem ser exibidos com base no tipo de conta
  const shouldShowBankField = accountType === 'checking' || accountType === 'savings' || accountType === 'credit' || accountType === 'investment';
  const shouldShowAccountNumberField = accountType === 'checking' || accountType === 'savings';
  const shouldShowCreditLimitField = accountType === 'credit';
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            {account ? 'Editar Conta' : 'Adicionar Nova Conta'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4">
              {/* Account type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Conta</label>
                <select 
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary" 
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                  required
                >
                  <option value="">Selecione um tipo</option>
                  <option value="checking">Conta Corrente</option>
                  <option value="savings">Poupança</option>
                  <option value="credit">Cartão de Crédito</option>
                  <option value="investment">Investimentos</option>
                  <option value="wallet">Carteira</option>
                  <option value="other">Outro</option>
                </select>
              </div>
              
              {/* Account name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Conta</label>
                <input 
                  type="text" 
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary focus:border-primary" 
                  placeholder="Ex: Conta Nubank" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                />
              </div>
              
              {/* Bank name */}
              {shouldShowBankField && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Banco</label>
                  <input 
                    type="text" 
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary focus:border-primary" 
                    placeholder="Ex: Banco Itaú"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  />
                </div>
              )}
              
              {/* Account number */}
              {shouldShowAccountNumberField && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número da Conta</label>
                  <input 
                    type="text" 
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary focus:border-primary" 
                    placeholder="Ex: 12345-6"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                  />
                </div>
              )}
              
              {/* Initial balance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {accountType === 'credit' ? 'Valor da Fatura' : 'Saldo Inicial'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">R$</span>
                  </div>
                  <input 
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary focus:border-primary" 
                    placeholder="0,00"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    required 
                  />
                </div>
              </div>
              
              {/* Credit limit */}
              {shouldShowCreditLimitField && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Limite do Cartão</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">R$</span>
                    </div>
                    <input 
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary focus:border-primary" 
                      placeholder="0,00"
                      value={creditLimit}
                      onChange={(e) => setCreditLimit(e.target.value)}
                    />
                  </div>
                </div>
              )}
              
              {/* Color picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cor da Conta</label>
                <div className="flex space-x-2">
                  {['indigo', 'green', 'red', 'blue', 'purple', 'yellow'].map(colorOption => (
                    <button
                      key={colorOption}
                      type="button"
                      className={`w-8 h-8 rounded-full bg-${colorOption}-500 border-2 ${color === colorOption ? 'border-indigo-700' : 'border-transparent'} focus:outline-none`}
                      onClick={() => setColor(colorOption)}
                    ></button>
                  ))}
                </div>
              </div>
              
              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas (Opcional)</label>
                <textarea 
                  rows="2" 
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary" 
                  placeholder="Detalhes adicionais sobre esta conta..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button 
                type="button" 
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700"
              >
                {account ? 'Salvar Alterações' : 'Salvar Conta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccountModal;