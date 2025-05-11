import React, { useState, useEffect } from 'react';

const TransactionModal = ({ isOpen, onClose, onSubmit, transaction = null, accounts = [], categories = [], formatCurrency, formatDate }) => {
  const [transactionType, setTransactionType] = useState('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState('');
  const [account, setAccount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [notes, setNotes] = useState('');
  // Estados para transferências
  const [isInternalTransfer, setIsInternalTransfer] = useState(false);
  const [destinationAccountId, setDestinationAccountId] = useState('');
  // Novos estados para investimentos
  const [isInvestment, setIsInvestment] = useState(false);
  const [investmentAccountId, setInvestmentAccountId] = useState('');

  // Função para detectar categorias de transferência
  const checkIfTransferCategory = () => {
    if (!categoryId || !categories || categories.length === 0) return false;
    
    const selectedCategory = categories.find(cat => cat.id.toString() === categoryId.toString());
    if (!selectedCategory) return false;
    
    // Verificar por várias possíveis grafias
    const possibleNames = ['transferência', 'transferencia', 'transferências', 'transferencias', 'transfer'];
    const categoryNameLower = selectedCategory.name.toLowerCase();
    
    return possibleNames.some(name => categoryNameLower.includes(name));
  };

  // Função para detectar categorias de investimento
  const checkIfInvestmentCategory = () => {
    if (!categoryId || !categories || categories.length === 0) return false;
    
    const selectedCategory = categories.find(cat => cat.id.toString() === categoryId.toString());
    if (!selectedCategory) return false;
    
    // Verificar por palavras relacionadas a investimentos
    const investmentTerms = ['investimento', 'ação', 'ações', 'tesouro direto', 'fundo', 'cdb', 'lci', 'lca', 'aplicação'];
    const categoryNameLower = selectedCategory.name.toLowerCase();
    
    return investmentTerms.some(term => categoryNameLower.includes(term));
  };

  // Verificar se é uma categoria de transferência
  const isTransferCategory = checkIfTransferCategory();
  
  // Preencher formulário com dados da transação existente
  useEffect(() => {
    if (transaction) {
      // Preencher com os dados da transação existente
      setTransactionType(transaction.type || 'expense');
      setDescription(transaction.description || '');

      // Formatar o valor para exibição apenas se existir uma transação
      if (transaction.amount) {
        const formattedAmount = ensureNumber(transaction.amount).toFixed(2).replace('.', ',');
        setAmount(formattedAmount);
      }

      setCategory(transaction.category || '');
      setCategoryId(transaction.categoryId || '');
      setDate(transaction.date || '');
      setAccount(transaction.account || '');
      setAccountId(transaction.accountId || '');
      setNotes(transaction.notes || '');
      setIsInternalTransfer(transaction.isInternalTransfer || false);
      setDestinationAccountId(transaction.destinationAccountId || '');
      // Carregar dados de investimento se existirem
      setIsInvestment(transaction.isInvestment || false);
      setInvestmentAccountId(transaction.investmentAccountId || '');
    } else {
      // Configurar valores padrão para nova transação
      resetForm();
      // Definir a data padrão como hoje
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
    }
  }, [transaction]);

  const ensureNumber = (value) => {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    // Converter string formatada (1.234,56) para número (1234.56)
    const parsed = parseFloat(value.replace(/\./g, '').replace(',', '.'));
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleAmountChange = (e) => {
    let value = e.target.value;
    
    // Remove todos os caracteres não numéricos
    value = value.replace(/\D/g, '');
    
    // Se não houver valor, mantenha o campo vazio
    if (!value) {
      setAmount('');
      return;
    }
    
    // Converte para centavos para formatar corretamente
    const valueInCents = parseInt(value, 10);
    
    // Formata para reais com vírgula (exemplo: 1.234,56)
    const formattedValue = (valueInCents / 100).toFixed(2).replace('.', ',');
    setAmount(formattedValue);
  };

  // Atualizado para detectar tanto transferências quanto investimentos
  const handleCategoryChange = (e) => {
    const selectedId = e.target.value;
    setCategoryId(selectedId);
    
    // Se o ID foi selecionado, encontrar o nome da categoria correspondente
    if (selectedId && categories && categories.length > 0) {
      const selectedCategory = categories.find(c => c.id.toString() === selectedId);
      if (selectedCategory) {
        setCategory(selectedCategory.name);
        
        // Verificar se é uma categoria de transferência
        const possibleTransferNames = ['transferência', 'transferencia', 'transferências', 'transferencias', 'transfer'];
        const isTransfer = possibleTransferNames.some(name => selectedCategory.name.toLowerCase().includes(name));
        
        if (isTransfer) {
          setIsInternalTransfer(false);
          setDestinationAccountId('');
          setIsInvestment(false);
          setInvestmentAccountId('');
        } 
        // Verificar se é uma categoria de investimento (apenas para despesas)
        else if (transactionType === 'expense') {
          const investmentTerms = ['investimento', 'ação', 'ações', 'tesouro direto', 'fundo', 'cdb', 'lci', 'lca', 'aplicação'];
          const isInvest = investmentTerms.some(term => selectedCategory.name.toLowerCase().includes(term));
          
          setIsInvestment(isInvest);
          if (!isInvest) {
            setInvestmentAccountId('');
          }
        } else {
          setIsInvestment(false);
          setInvestmentAccountId('');
        }
      }
    } else {
      setCategory('');
      setIsInvestment(false);
      setInvestmentAccountId('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Converter o valor formatado para número
    const amountValue = amount ? ensureNumber(amount) : 0;
    
    // Preparar os dados da transação
    const transactionData = {
      type: transactionType,
      description,
      amount: amountValue,
      category,
      categoryId,
      date,
      account,
      accountId,
      notes
    };

    // Adicionar informações de investimento se for o caso
    if (isInvestment && transactionType === 'expense') {
      transactionData.isInvestment = true;
      if (investmentAccountId) {
        transactionData.investmentAccountId = investmentAccountId;
        
        // Encontrar o nome da conta de investimento
        const investAcc = accounts.find(a => a.id.toString() === investmentAccountId);
        if (investAcc) {
          transactionData.investmentAccount = investAcc.name;
          
          // Criar a transação complementar (entrada na conta de investimento)
          const complementaryTransaction = {
            type: 'income', // Sempre entrada
            description: `Investimento em ${investAcc.name}`,
            amount: amountValue,
            category, // Manter a mesma categoria
            categoryId,
            date,
            account: investAcc.name,
            accountId: investmentAccountId,
            notes: notes ? `${notes} (Investimento automático)` : 'Investimento automático',
            isInvestment: true,
            sourceAccountId: accountId,
            sourceAccount: account,
            isComplementaryTransaction: true // Marcar como transação complementar
          };
          
          // Enviar as duas transações para o componente pai
          onSubmit([transactionData, complementaryTransaction]);
          resetForm();
          return; // Retornar para não executar o onSubmit abaixo
        }
      }
    }

    // Adicionar informações de transferência se for o caso
    if (isTransferCategory) {
      transactionData.isInternalTransfer = isInternalTransfer;
      if (isInternalTransfer) {
        transactionData.destinationAccountId = destinationAccountId;
        
        // Encontrar o nome da conta de destino
        const destAccount = accounts.find(a => a.id.toString() === destinationAccountId);
        if (destAccount) {
          transactionData.destinationAccount = destAccount.name;
        }
        
        // Atualizar descrição para mostrar a transferência
        if (!description || description === 'Transferência') {
          const sourceAccount = accounts.find(a => a.id.toString() === accountId);
          const sourceAccountName = sourceAccount ? sourceAccount.name : 'conta';
          const destAccountName = destAccount ? destAccount.name : 'outra conta';
          transactionData.description = `Transferência de ${sourceAccountName} para ${destAccountName}`;
        }

        // Criar a transação complementar (entrada na conta de destino)
        if (destAccount) {
          // Criar a transação de entrada
          const complementaryTransaction = {
            type: 'income', // Sempre entrada
            description: `Transferência de ${account} para ${destAccount.name}`,
            amount: amountValue,
            category,
            categoryId,
            date,
            account: destAccount.name,
            accountId: destinationAccountId,
            notes: notes ? `${notes} (Transferência automática)` : 'Transferência automática',
            isInternalTransfer: true,
            sourceAccountId: accountId,
            sourceAccount: account,
            isComplementaryTransaction: true // Marcar como transação complementar
          };

          // Enviar as duas transações para o componente pai
          onSubmit([transactionData, complementaryTransaction]);
          resetForm();
          return; // Retornar para não executar o onSubmit abaixo
        }
      }
    }

    // Enviar os dados para o componente pai
    onSubmit(transactionData);
    resetForm();
  };

  const resetForm = () => {
    setTransactionType('expense');
    setAmount('');
    setDescription('');
    setCategory('');
    setCategoryId('');
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
    setAccount('');
    setAccountId('');
    setNotes('');
    setIsInternalTransfer(false);
    setDestinationAccountId('');
    setIsInvestment(false);
    setInvestmentAccountId('');
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

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  // Formata a exibição da conta com banco na frente e número censurado
  const formatAccountDisplay = (account) => {
    // Se não tiver número da conta ou banco, usa o nome da conta
    if (!account.accountNumber && !account.bankName) {
      return account.name;
    }
    
    const bankName = account.bankName || "";
    const maskedNumber = account.accountNumber ? `•••• ${account.accountNumber.slice(-4)}` : "";
    
    // Formato: Banco - •••• 1234
    return bankName && maskedNumber 
      ? `${bankName} - ${maskedNumber}`
      : bankName || account.name;
  };

  // Filtrar contas para não mostrar cartões de crédito como destino de transferência
  const availableDestinationAccounts = accounts.filter(acc => 
    acc.type !== 'credit' && acc.id.toString() !== accountId
  );

  // Filtrar contas de investimento
  const investmentAccounts = accounts.filter(acc => acc.type === 'investment');
  
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
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            {transaction ? 'Editar Transação' : 'Nova Transação'}
          </h3>
          <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          {/* Transaction type selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
            <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-dark-400">
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
                  // Resetar também os estados de investimento
                  setIsInvestment(false);
                  setInvestmentAccountId('');
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
          </div>

          {/* Amount */}
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 dark:text-gray-400">R$</span>
              </div>
              <input
                type="text"
                id="amount"
                inputMode="decimal"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-400 rounded-lg bg-gray-50 dark:bg-dark-300 text-gray-800 dark:text-white focus:ring-primary focus:border-primary dark:focus:ring-indigo-600 transition-theme"
                value={amount}
                onChange={handleAmountChange}
                placeholder='0,00'
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
            <input
              type="text"
              id="description"
              className="block w-full px-3 py-2 border border-gray-300 dark:border-dark-400 rounded-lg bg-gray-50 dark:bg-dark-300 text-gray-800 dark:text-white focus:ring-primary focus:border-primary dark:focus:ring-indigo-600 transition-theme"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Exemplo: Supermercado, Salário, etc."
              required
            />
          </div>

          {/* Category */}
          <div className="mb-4">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
            <select
              id="category"
              className="block w-full px-3 py-2 border border-gray-300 dark:border-dark-400 rounded-lg bg-gray-50 dark:bg-dark-300 text-gray-800 dark:text-white focus:ring-primary focus:border-primary dark:focus:ring-indigo-600 transition-theme"
              value={categoryId}
              onChange={handleCategoryChange}
              required
            >
              <option value="">Selecione uma categoria</option>
              {filteredCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Campos específicos para transferência */}
          {isTransferCategory && (
            <div className="mb-4 p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-dark-300">
              <div className="mb-3">
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary focus:ring-primary dark:border-dark-500 dark:bg-dark-400 dark:focus:ring-indigo-600 mr-2"
                    checked={isInternalTransfer}
                    onChange={(e) => setIsInternalTransfer(e.target.checked)}
                  />
                  Transferência entre minhas contas
                </label>
              </div>

              {isInternalTransfer && (
                <div className="mt-2">
                  <label htmlFor="destinationAccount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Conta de destino
                  </label>
                  <select
                    id="destinationAccount"
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-dark-400 rounded-lg bg-gray-50 dark:bg-dark-300 text-gray-800 dark:text-white focus:ring-primary focus:border-primary dark:focus:ring-indigo-600 transition-theme"
                    value={destinationAccountId}
                    onChange={(e) => setDestinationAccountId(e.target.value)}
                    required={isInternalTransfer}
                  >
                    <option value="">Selecione a conta de destino</option>
                    {availableDestinationAccounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {formatAccountDisplay(acc)}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Apenas contas bancárias são mostradas como destino (cartões de crédito não são incluídos)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Campos específicos para investimentos */}
          {isInvestment && transactionType === 'expense' && (
            <div className="mb-4 p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-dark-300">
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Conta de Investimento
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Selecione a conta de investimento para onde este valor será aplicado
                </p>
                
                <select
                  id="investmentAccount"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-dark-400 rounded-lg bg-gray-50 dark:bg-dark-300 text-gray-800 dark:text-white focus:ring-primary focus:border-primary dark:focus:ring-indigo-600 transition-theme"
                  value={investmentAccountId}
                  onChange={(e) => setInvestmentAccountId(e.target.value)}
                  required={isInvestment}
                >
                  <option value="">Selecione a conta de investimento</option>
                  {investmentAccounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} {acc.broker ? `(${acc.broker})` : ''}
                    </option>
                  ))}
                </select>
                
                {investmentAccounts.length === 0 && (
                  <p className="mt-1 text-xs text-amber-500 dark:text-amber-400">
                    Você não tem contas de investimento cadastradas. A transação será salva sem vinculação a uma conta de investimento.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Date */}
          <div className="mb-4">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data</label>
            <input
              type="date"
              id="date"
              className="block w-full px-3 py-2 border border-gray-300 dark:border-dark-400 rounded-lg bg-gray-50 dark:bg-dark-300 text-gray-800 dark:text-white focus:ring-primary focus:border-primary dark:focus:ring-indigo-600 transition-theme"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Account */}
          <div className="mb-4">
            <label htmlFor="account" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Conta</label>
            <select
              id="account"
              className="block w-full px-3 py-2 border border-gray-300 dark:border-dark-400 rounded-lg bg-gray-50 dark:bg-dark-300 text-gray-800 dark:text-white focus:ring-primary focus:border-primary dark:focus:ring-indigo-600 transition-theme"
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
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notas (Opcional)</label>
            <textarea 
              rows="2" 
              id="notes"
              className="block w-full px-3 py-2 border border-gray-300 dark:border-dark-400 rounded-lg bg-gray-50 dark:bg-dark-300 text-gray-800 dark:text-white focus:ring-primary focus:border-primary dark:focus:ring-indigo-600 resize-none transition-theme"
              placeholder="Observações ou detalhes adicionais"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>
          
          {/* Submit button */}
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
              className="px-4 py-2 bg-primary hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-lg transition-colors"
            >
              {transaction ? 'Atualizar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;