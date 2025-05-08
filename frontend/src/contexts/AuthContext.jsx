import React, { createContext, useState, useEffect, useContext } from 'react';

// Constante para a URL base da API
const API_URL = 'http://localhost:5000/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar se o usuário já está logado (no carregamento inicial)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Verificar token com o backend
          const response = await fetch(`${API_URL}/auth/verify`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setCurrentUser(userData);
          } else {
            // Token inválido ou expirado
            localStorage.removeItem('token');
          }
        }
      } catch (err) {
        console.error("Erro ao verificar autenticação:", err);
        setError("Falha ao verificar autenticação");
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Função de login
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Falha ao realizar login');
      }
      
      localStorage.setItem('token', data.token);
      setCurrentUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Função de registro
  const register = async (name, email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Falha ao registrar conta');
      }
      
      localStorage.setItem('token', data.token);
      setCurrentUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};