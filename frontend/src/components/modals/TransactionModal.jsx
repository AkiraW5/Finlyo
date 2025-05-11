import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const TransactionModal = ({ isOpen, onClose, onSubmit, accounts, categories }) => {
  const [transactionType, setTransactionType] = useState('income');
  const [amount, setAmount] = useState('0,00');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState('');
  const [account, setAccount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [notes, setNotes] = useState('');

  // Obter o usuário atual do contexto de autenticação
  const { currentUser } = useAuth();

  // Estados do formulário
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense',
    categoryId: '',
    accountId: '',
    date: new Date().toISOString().substr(0, 10),
    notes: ''
  });

  // Resetar o formulário quando o modal é aberto
  useEffect(() => {
    if (isOpen) {
      setFormData({
        description: '',
        amount: '',
        type: 'expense',
        categoryId: categories.length > 0 ? categories[0].id : '',
        accountId: accounts.length > 0 ? accounts[0].id : '',
        date: new Date().toISOString().substr(0, 10),
        notes: ''
      });
      setAmount('0,00'); // Inicializar com valor formatado
      setTransactionType('expense');
      setDescription('');
      setCategory('');
      setCategoryId(categories.length > 0 ? categories[0].id : '');
      setDate(new Date().toISOString().substr(0, 10));
      setAccount('');
      setAccountId(accounts.length > 0 ? accounts[0].id : '');
      setNotes('');
    }
  }, [isOpen, accounts, categories]);

  // Função para formatar o valor como moeda brasileira
  const handleAmountChange = (e) => {
    // Obtém apenas os dígitos da entrada
    const digitsOnly = e.target.value.replace(/\D/g, '');
    
    // Converte para centavos (inteiro)
    const valueInCents = parseInt(digitsOnly || '0', 10);
    
    // Converte centavos para o formato de moeda: R$ 0,00
    const formattedValue = (valueInCents / 100).toFixed(2).replace('.', ',');
    
    setAmount(formattedValue);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Garantir que o valor é numérico (converte de vírgula para ponto)
    const formattedAmount = parseFloat(amount.replace(',', '.')) || 0;
    
    // Criar objeto de transação
    const transactionData = {
      type: transactionType,
      amount: formattedAmount,
      description,
      category,
      categoryId: categoryId || null,
      date,
      account,
      accountId: accountId || null,
      notes
    };
    
    onSubmit(transactionData);
  };
  
  const resetForm = () => {
    setTransactionType('income');
    setAmount('0,00');
    setDescription('');
    setCategory('');
    setCategoryId('');
    setDate('');
    setAccount('');
    setAccountId('');
    setNotes('');
  };
  
  // Quando o usuário seleciona um account pelo ID, também guardar o nome
  const handleAccountChange = (e) => {
    const selectedId = e.target.value;
    setAccountId(selectedId);
    
    // Se o ID foi selecionado, encontrar o nome da conta correspondente
    if (selectedId && accounts && accounts.length > 0) {
      const selectedAccount = accounts.find(a => a.id.toString() === selectedId);
      if (selectedAccount) {
        setAccount(selectedAccount.name);
      }
    } else {
      setAccount('');
    }
  };
  
  // Quando o usuário seleciona uma category pelo ID, também guardar o nome
  const handleCategoryChange = (e) => {
    const selectedId = e.target.value;
    setCategoryId(selectedId);
    
    // Se o ID foi selecionado, encontrar o nome da categoria correspondente
    if (selectedId && categories && categories.length > 0) {
      const selectedCategory = categories.find(c => c.id.toString() === selectedId);
      if (selectedCategory) {
        setCategory(selectedCategory.name);
      }
    } else {
      setCategory('');
    }
  };
  
  const handleCancel = () => {
    resetForm();
    onClose();
  };
  
  // Função para censurar o número da conta
  const maskAccountNumber = (accountNumber) => {
    if (!accountNumber) return "";
    // Mostra apenas os últimos 4 dígitos do número da conta
    return "•••• " + accountNumber.slice(-4);
  };
  
  // Formata a exibição da conta com banco na frente e número censurado
  const formatAccountDisplay = (account) => {
    // Se não tiver número da conta ou banco, usa o nome da conta
    if (!account.accountNumber && !account.bankName) {
      return account.name;
    }
    
    const bankName = account.bankName || "";
    const maskedNumber = account.accountNumber ? maskAccountNumber(account.accountNumber) : "";
    
    // Formato: Banco - •••• 1234
    return bankName && maskedNumber 
      ? `${bankName} - ${maskedNumber}`
      : bankName || account.name;
  };
  
  if (!isOpen) return null;
  
  // Filtrar categorias por tipo (receita/despesa)
  const filteredCategories = categories?.filter(cat => 
    (transactionType === 'income' && (cat.type === 'income' || !cat.type)) || 
    (transactionType === 'expense' && (cat.type === 'expense' || !cat.type))
  ) || [];
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-dark-200 rounded-xl shadow-xl w-full max-w-md transition-theme">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-300">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Adicionar Transação</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4">
              {/* Transaction type toggle */}
              <div className="flex rounded-lg border border-gray-200 dark:border-dark-400 overflow-hidden">
                <button 
                  type="button" 
                  className={`flex-1 py-2 px-4 text-sm font-medium focus:outline-none ${
                    transactionType === 'income' ? 
                    'bg-green-50 dark:bg-green-900 dark:bg-opacity-20 text-green-700 dark:text-green-400' : 
                    'bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300'
                  } border-r border-gray-200 dark:border-dark-400 transition-theme`}
                  onClick={() => {
                    setTransactionType('income');
                    // Resetar categoria quando trocar o tipo
                    setCategory('');
                    setCategoryId('');
                  }}
                >
                  <i className="fas fa-arrow-up mr-2"></i> Receita
                </button>
                <button 
                  type="button" 
                  className={`flex-1 py-2 px-4 text-sm font-medium focus:outline-none ${
                    transactionType === 'expense' ? 
                    'bg-red-50 dark:bg-red-900 dark:bg-opacity-20 text-red-700 dark:text-red-400' : 
                    'bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300'
                  } transition-theme`}
                  onClick={() => {
                    setTransactionType('expense');
                    // Resetar categoria quando trocar o tipo
                    setCategory('');
                    setCategoryId('');
                  }}
                >
                  <i className="fas fa-arrow-down mr-2"></i> Despesa
                </button>
              </div>
              
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400">R$</span>
                  </div>
                  <input 
                    type="text"
                    inputMode="numeric" 
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-400 rounded-lg bg-gray-50 dark:bg-dark-300 text-gray-800 dark:text-white focus:ring-primary focus:border-primary dark:focus:ring-indigo-600 transition-theme" 
                    placeholder="0,00" 
                    value={amount}
                    onChange={handleAmountChange}
                    required 
                  />
                </div>
              </div>
              
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
                <input 
                  type="text" 
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-dark-400 rounded-lg bg-gray-50 dark:bg-dark-300 text-gray-800 dark:text-white focus:ring-primary focus:border-primary dark:focus:ring-indigo-600 transition-theme" 
                  placeholder="Ex: Supermercado" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required 
                />
              </div>
              
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
                <select 
                  className="block w-full rounded-lg border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-800 dark:text-white shadow-sm focus:border-primary focus:ring-primary dark:focus:ring-indigo-600 transition-theme" 
                  value={categoryId}
                  onChange={handleCategoryChange}
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))
                  ) : (
                    // Fallback para categorias estáticas
                    transactionType === 'expense' ? (
                      <>
                        <option value="Alimentação">Alimentação</option>
                        <option value="Moradia">Moradia</option>
                        <option value="Transporte">Transporte</option>
                        <option value="Outros">Outros</option>
                      </>
                    ) : (
                      <>
                        <option value="Rendimento">Rendimento</option>
                        <option value="Investimento">Investimento</option>
                        <option value="Outros">Outros</option>
                      </>
                    )
                  )}
                </select>
              </div>
              
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data</label>
                <input 
                  type="date" 
                  className="block w-full rounded-lg border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-800 dark:text-white shadow-sm focus:border-primary focus:ring-primary dark:focus:ring-indigo-600 transition-theme" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required 
                />
              </div>
              
              {/* Account - FORMATO ATUALIZADO: banco e número censurado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Conta</label>
                <select 
                  className="block w-full rounded-lg border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-800 dark:text-white shadow-sm focus:border-primary focus:ring-primary dark:focus:ring-indigo-600 transition-theme" 
                  value={accountId}
                  onChange={handleAccountChange}
                  required
                >
                  <option value="">Selecione uma conta</option>
                  {accounts && accounts.length > 0 ? (
                    accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {formatAccountDisplay(acc)}
                      </option>
                    ))
                  ) : (
                    // Fallback para contas estáticas com o novo formato
                    <>
                      <option value="Conta Corrente">Nubank - •••• 1234</option>
                      <option value="Cartão de Crédito">Itaú - •••• 5678</option>
                      <option value="Poupança">Caixa - •••• 9012</option>
                      <option value="Carteira">Carteira</option>
                    </>
                  )}
                </select>
              </div>
              
              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notas (Opcional)</label>
                <textarea 
                  rows="2" 
                  className="block w-full rounded-lg border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-800 dark:text-white shadow-sm focus:border-primary focus:ring-primary dark:focus:ring-indigo-600 transition-theme" 
                  placeholder="Detalhes adicionais..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
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
                Salvar Transação
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;