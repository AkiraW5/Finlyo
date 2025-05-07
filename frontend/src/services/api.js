import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Configurar timeout para evitar espera excessiva
axios.defaults.timeout = 5000;

// Interceptadores para melhorar o tratamento de erros
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ECONNABORTED') {
      console.error('Timeout na requisição. O servidor está rodando?');
    } else if (!error.response) {
      console.error('Não foi possível conectar ao servidor. Verifique se o backend está ativo.');
    }
    return Promise.reject(error);
  }
);
// Transações
export const getTransactions = async () => {
  try {
    const response = await axios.get(`${API_URL}/transactions`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    throw error;
  }
};

export const createTransaction = async (transactionData) => {
  try {
    const response = await axios.post(`${API_URL}/transactions`, transactionData);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    throw error;
  }
};

export const updateTransaction = async (id, transactionData) => {
  try {
    const response = await axios.put(`${API_URL}/transactions/${id}`, transactionData);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    throw error;
  }
};

export const deleteTransaction = async (id) => {
  try {
    await axios.delete(`${API_URL}/transactions/${id}`);
    return true;
  } catch (error) {
    console.error('Erro ao excluir transação:', error);
    throw error;
  }
};

// Função para obter todos os orçamentos
export const getBudgets = async () => {
    try {
        const response = await axios.get(`${API_URL}/budgets`);
        return response.data;
    } catch (error) {
        throw new Error('Erro ao obter orçamentos: ' + error.message);
    }
};

// NOVAS FUNÇÕES ADICIONADAS:

// Função para criar um novo orçamento
export const createBudget = async (budgetData) => {
    try {
        const response = await axios.post(`${API_URL}/budgets`, budgetData);
        return response.data;
    } catch (error) {
        throw new Error('Erro ao criar orçamento: ' + error.message);
    }
};

// Função para atualizar um orçamento existente
export const updateBudget = async (id, budgetData) => {
    try {
        const response = await axios.put(`${API_URL}/budgets/${id}`, budgetData);
        return response.data;
    } catch (error) {
        throw new Error('Erro ao atualizar orçamento: ' + error.message);
    }
};

// Função para excluir um orçamento
export const deleteBudget = async (id) => {
    try {
        await axios.delete(`${API_URL}/budgets/${id}`);
    } catch (error) {
        throw new Error('Erro ao excluir orçamento: ' + error.message);
    }
};

// Função para obter relatórios (para o componente Reports.jsx)
export const getReports = async () => {
    try {
        const response = await axios.get(`${API_URL}/reports`);
        return response.data;
    } catch (error) {
        throw new Error('Erro ao obter relatórios: ' + error.message);
    }
};

// Função para obter todas as contas
export const getAccounts = async () => {
    try {
        const response = await axios.get(`${API_URL}/accounts`);
        return response.data;
    } catch (error) {
        throw new Error('Erro ao obter contas: ' + error.message);
    }
};

// Função para criar uma nova conta
export const createAccount = async (accountData) => {
    try {
        const response = await axios.post(`${API_URL}/accounts`, accountData);
        return response.data;
    } catch (error) {
        throw new Error('Erro ao criar conta: ' + error.message);
    }
};

// Função para atualizar uma conta existente
export const updateAccount = async (id, accountData) => {
    try {
        const response = await axios.put(`${API_URL}/accounts/${id}`, accountData);
        return response.data;
    } catch (error) {
        throw new Error('Erro ao atualizar conta: ' + error.message);
    }
};

// Função para excluir uma conta
export const deleteAccount = async (id) => {
    try {
        await axios.delete(`${API_URL}/accounts/${id}`);
    } catch (error) {
        throw new Error('Erro ao excluir conta: ' + error.message);
    }
};

// Função para obter todas as categorias
export const getCategories = async () => {
    try {
        const response = await axios.get(`${API_URL}/categories`);
        return response.data;
    } catch (error) {
        throw new Error('Erro ao obter categorias: ' + error.message);
    }
};

// Função para criar uma nova categoria
export const createCategory = async (categoryData) => {
    try {
        const response = await axios.post(`${API_URL}/categories`, categoryData);
        return response.data;
    } catch (error) {
        throw new Error('Erro ao criar categoria: ' + error.message);
    }
};

// Função para atualizar uma categoria existente
export const updateCategory = async (id, categoryData) => {
    try {
        const response = await axios.put(`${API_URL}/categories/${id}`, categoryData);
        return response.data;
    } catch (error) {
        throw new Error('Erro ao atualizar categoria: ' + error.message);
    }
};

// Função para excluir uma categoria
export const deleteCategory = async (id) => {
    try {
        await axios.delete(`${API_URL}/categories/${id}`);
    } catch (error) {
        throw new Error('Erro ao excluir categoria: ' + error.message);
    }
};

// Função para obter transações por categoria
export const getCategoryTransactions = async (categoryId) => {
    try {
        const response = await axios.get(`${API_URL}/categories/${categoryId}/transactions`);
        return response.data;
    } catch (error) {
        throw new Error('Erro ao obter transações da categoria: ' + error.message);
    }
};

export const createContribution = async (contributionData) => {
    try {
      const response = await axios.post('/api/contributions', contributionData);
      return response.data;
    } catch (error) {
      console.error("Erro ao criar contribuição:", error);
      throw error;
    }
  };
  
  // Também adicione essa função para buscar contribuições
  export const getContributions = async () => {
    try {
      const response = await axios.get('/api/contributions');
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar contribuições:", error);
      throw error;
    }
  };