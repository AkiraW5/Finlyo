import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // URL base da API

// Função para realizar o login do usuário
export const login = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, { email, password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token); // Armazenar o token no localStorage
        }
        return response.data;
    } catch (error) {
        throw new Error(error.response.data.message || 'Erro ao realizar login');
    }
};

// Função para realizar o logout do usuário
export const logout = () => {
    localStorage.removeItem('token'); // Remover o token do localStorage
};

// Função para verificar se o usuário está autenticado
export const isAuthenticated = () => {
    return !!localStorage.getItem('token'); // Retorna true se o token existir
};

// Função para obter o token do usuário
export const getToken = () => {
    return localStorage.getItem('token'); // Retorna o token armazenado
};