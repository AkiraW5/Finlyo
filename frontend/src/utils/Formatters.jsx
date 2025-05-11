// Formatar valores monetários com base nas preferências do usuário
export const formatCurrency = (value, settings) => {
    // Garantir que o valor seja um número
    if (typeof value !== 'number') {
      value = parseFloat(value) || 0;
    }
    
    // Formatar baseado na moeda escolhida pelo usuário
    const currencyFormat = {
      'BRL': { style: 'currency', currency: 'BRL' },
      'USD': { style: 'currency', currency: 'USD' },
      'EUR': { style: 'currency', currency: 'EUR' },
      'GBP': { style: 'currency', currency: 'GBP' }
    };
    
    const format = currencyFormat[settings?.currency] || currencyFormat['BRL'];
    
    // Se o usuário escolheu esconder valores
    if (settings?.hideAmounts) {
      return '• • • • •';
    }
    
    return new Intl.NumberFormat(settings?.language || 'pt-BR', format).format(value);
  };
  
  // Formatar data baseado na preferência do usuário
  export const formatDate = (dateString, settings) => {
    const date = new Date(dateString);
    
    switch(settings?.dateFormat) {
      case 'DD/MM/YYYY':
        return date.toLocaleDateString('pt-BR');
      case 'MM/DD/YYYY':
        return date.toLocaleDateString('en-US');
      case 'YYYY-MM-DD':
        return date.toISOString().split('T')[0];
      default:
        return date.toLocaleDateString('pt-BR');
    }
  };
  
  // Verificar se deve mostrar valores com base nas preferências de privacidade
  export const shouldShowBalance = (settings) => {
    return settings?.showBalance !== false;
  };