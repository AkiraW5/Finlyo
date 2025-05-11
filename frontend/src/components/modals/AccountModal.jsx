import React, { useState, useEffect } from 'react';

const AccountModal = ({ isOpen, onClose, onSubmit, account = null, existingAccounts = [] }) => {
  const [accountType, setAccountType] = useState('');
  const [name, setName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [balance, setBalance] = useState('0,00');  // Inicializado com formato de moeda
  const [creditLimit, setCreditLimit] = useState('0,00');  // Inicializado com formato de moeda
  const [color, setColor] = useState('indigo');
  const [notes, setNotes] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [linkedAccountId, setLinkedAccountId] = useState('');

  // Lista de contas bancárias disponíveis para vincular ao cartão
  const bankAccounts = existingAccounts.filter(acc => 
    acc.type === 'checking' || acc.type === 'savings'
  );

  // Carregar dados quando estiver editando uma conta existente
  useEffect(() => {
    if (account) {
      // Formatar valores numéricos para exibição
      const formattedBalance = account.balance ? 
        (parseFloat(account.balance)).toFixed(2).replace('.', ',') : 
        '0,00';
      
      const formattedCreditLimit = account.creditLimit ? 
        (parseFloat(account.creditLimit)).toFixed(2).replace('.', ',') : 
        '0,00';
      
      setAccountType(account.type || '');
      setName(account.name || '');
      setBankName(account.bankName || '');
      setAccountNumber(account.accountNumber || '');
      setBalance(formattedBalance);
      setCreditLimit(formattedCreditLimit);
      setColor(account.color || 'indigo');
      setNotes(account.notes || '');
      setCardNumber(account.cardNumber || '');
      setLinkedAccountId(account.linkedAccountId || '');
    } else {
      resetForm();
    }
  }, [account]);

  const resetForm = () => {
    setAccountType('');
    setName('');
    setBankName('');
    setAccountNumber('');
    setBalance('0,00');  // Valor formatado
    setCreditLimit('0,00');  // Valor formatado
    setColor('indigo');
    setNotes('');
    setCardNumber('');
    setLinkedAccountId('');
  };

  // Função para formatar valores monetários
  const formatCurrency = (value) => {
    // Remove todos os caracteres não numéricos
    const digitsOnly = value.replace(/\D/g, '');
    
    // Converte para centavos (inteiro)
    const valueInCents = parseInt(digitsOnly || '0', 10);
    
    // Formata para o padrão brasileiro: 0,00
    return (valueInCents / 100).toFixed(2).replace('.', ',');
  };
  
  // Função para formatar número do cartão de crédito (XXXX XXXX XXXX XXXX)
  const formatCardNumber = (value) => {
    // Remove espaços e caracteres não numéricos
    const digitsOnly = value.replace(/\D/g, '');
    
    // Limita a 16 dígitos
    const limitedDigits = digitsOnly.slice(0, 16);
    
    // Adiciona espaços a cada 4 dígitos
    let formattedValue = '';
    for (let i = 0; i < limitedDigits.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formattedValue += ' ';
      }
      formattedValue += limitedDigits[i];
    }
    
    return formattedValue;
  };
  
  // Funções de manipulação de valores monetários
  const handleBalanceChange = (e) => {
    setBalance(formatCurrency(e.target.value));
  };
  
  const handleCreditLimitChange = (e) => {
    setCreditLimit(formatCurrency(e.target.value));
  };

  const handleCardNumberChange = (e) => {
    setCardNumber(formatCardNumber(e.target.value));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Converter valores formatados para números
    const balanceValue = parseFloat(balance.replace(',', '.')) || 0;
    const creditLimitValue = parseFloat(creditLimit.replace(',', '.')) || 0;
    
    const accountData = {
      type: accountType,
      name,
      bankName: accountType !== 'credit' ? bankName : null,
      accountNumber: accountType !== 'credit' ? accountNumber : null,
      balance: balanceValue,
      creditLimit: accountType === 'credit' ? creditLimitValue : null,
      color,
      notes,
      cardNumber: accountType === 'credit' ? cardNumber.replace(/\s/g, '') : null,
      linkedAccountId: accountType === 'credit' ? linkedAccountId : null
    };
    
    onSubmit(accountData);
    resetForm();
  };
  
  const handleCancel = () => {
    resetForm();
    onClose();
  };
  
  // Verifica se certos campos devem ser exibidos com base no tipo de conta
  const shouldShowBankField = (accountType === 'checking' || accountType === 'savings' || accountType === 'investment') && accountType !== 'credit';
  const shouldShowAccountNumberField = (accountType === 'checking' || accountType === 'savings') && accountType !== 'credit';
  const shouldShowCreditLimitField = accountType === 'credit';
  const shouldShowCardNumberField = accountType === 'credit';
  const shouldShowLinkedAccountField = accountType === 'credit';
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-dark-200 rounded-xl shadow-xl w-full max-w-md transition-theme">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-300">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            {account ? 'Editar Conta' : 'Adicionar Nova Conta'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4">
              {/* Account type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Conta</label>
                <select 
                  className="block w-full rounded-lg border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-800 dark:text-white shadow-sm focus:border-primary focus:ring-primary dark:focus:ring-indigo-600 transition-theme" 
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {accountType === 'credit' ? 'Nome do Cartão' : 'Nome da Conta'}
                </label>
                <input 
                  type="text" 
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-dark-400 rounded-lg bg-gray-50 dark:bg-dark-300 text-gray-800 dark:text-white focus:ring-primary focus:border-primary dark:focus:ring-indigo-600 transition-theme" 
                  placeholder={accountType === 'credit' ? "Ex: Cartão Nubank" : "Ex: Conta Nubank"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                />
              </div>
              
              {/* Card Number - Novo campo para cartões de crédito */}
              {shouldShowCardNumberField && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Número do Cartão</label>
                  <input 
                    type="text" 
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-dark-400 rounded-lg bg-gray-50 dark:bg-dark-300 text-gray-800 dark:text-white focus:ring-primary focus:border-primary dark:focus:ring-indigo-600 transition-theme" 
                    placeholder="XXXX XXXX XXXX XXXX"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    maxLength={19}  // 16 dígitos + 3 espaços
                  />
                </div>
              )}
              
              {/* Linked Account - Novo campo para vincular cartão a uma conta existente */}
              {shouldShowLinkedAccountField && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vincular a Conta</label>
                  <select 
                    className="block w-full rounded-lg border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-800 dark:text-white shadow-sm focus:border-primary focus:ring-primary dark:focus:ring-indigo-600 transition-theme" 
                    value={linkedAccountId}
                    onChange={(e) => setLinkedAccountId(e.target.value)}
                  >
                    <option value="">Selecione uma conta (opcional)</option>
                    {bankAccounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.name} {account.bankName ? `(${account.bankName})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* Bank name */}
              {shouldShowBankField && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Banco</label>
                  <input 
                    type="text" 
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-dark-400 rounded-lg bg-gray-50 dark:bg-dark-300 text-gray-800 dark:text-white focus:ring-primary focus:border-primary dark:focus:ring-indigo-600 transition-theme" 
                    placeholder="Ex: Banco Itaú"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  />
                </div>
              )}
              
              {/* Account number */}
              {shouldShowAccountNumberField && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Número da Conta</label>
                  <input 
                    type="text" 
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-dark-400 rounded-lg bg-gray-50 dark:bg-dark-300 text-gray-800 dark:text-white focus:ring-primary focus:border-primary dark:focus:ring-indigo-600 transition-theme" 
                    placeholder="Ex: 12345-6"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                  />
                </div>
              )}
              
              {/* Initial balance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {accountType === 'credit' ? 'Valor da Fatura Inicial' : 'Saldo Inicial'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400">R$</span>
                  </div>
                  <input 
                    type="text"
                    inputMode="numeric"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-400 rounded-lg bg-gray-50 dark:bg-dark-300 text-gray-800 dark:text-white focus:ring-primary focus:border-primary dark:focus:ring-indigo-600 transition-theme" 
                    placeholder="0,00"
                    value={balance}
                    onChange={handleBalanceChange}
                    required 
                  />
                </div>
                {accountType === 'credit' && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Este valor será adicionado como uma transação de despesa.
                  </p>
                )}
              </div>
              
              {/* Credit limit */}
              {shouldShowCreditLimitField && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Limite do Cartão</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">R$</span>
                    </div>
                    <input 
                      type="text"
                      inputMode="numeric"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-400 rounded-lg bg-gray-50 dark:bg-dark-300 text-gray-800 dark:text-white focus:ring-primary focus:border-primary dark:focus:ring-indigo-600 transition-theme" 
                      placeholder="0,00"
                      value={creditLimit}
                      onChange={handleCreditLimitChange}
                    />
                  </div>
                </div>
              )}
              
              {/* Color picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cor da Conta</label>
                <div className="flex space-x-2">
                  {['indigo', 'green', 'red', 'blue', 'purple', 'yellow'].map(colorOption => (
                    <button
                      key={colorOption}
                      type="button"
                      className={`w-8 h-8 rounded-full bg-${colorOption}-500 dark:bg-${colorOption}-600 border-2 ${color === colorOption ? 'border-indigo-700 dark:border-indigo-400' : 'border-transparent'} focus:outline-none transition-theme`}
                      onClick={() => setColor(colorOption)}
                    ></button>
                  ))}
                </div>
              </div>
              
              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notas (Opcional)</label>
                <textarea 
                  rows="2" 
                  className="block w-full rounded-lg border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-800 dark:text-white shadow-sm focus:border-primary focus:ring-primary dark:focus:ring-indigo-600 transition-theme" 
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
                className="px-4 py-2 border border-gray-300 dark:border-dark-400 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-primary dark:bg-indigo-700 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-800 transition-colors"
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