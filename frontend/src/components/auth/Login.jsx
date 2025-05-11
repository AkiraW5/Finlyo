import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUserSettingsContext } from '../../contexts/UserSettingsContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, currentUser } = useAuth();
  const { settings } = useUserSettingsContext();
  const navigate = useNavigate();
  const isMounted = useRef(true);

  // Verificar se o usuário já está autenticado
  useEffect(() => {
    if (currentUser) {
      navigate('/', { replace: true });
    }
  }, [currentUser, navigate]);

  // Cleanup para evitar memory leak
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      
      await login(email, password);
      
      if (isMounted.current) {
        navigate('/', { replace: true });
      }
    } catch (err) {
      console.error('Erro de login:', err);
      if (isMounted.current) {
        setError('Falha ao realizar login. Verifique suas credenciais.');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-dark-100 transition-theme">
      <div className="w-full max-w-md p-8 bg-white dark:bg-dark-200 rounded-xl shadow-lg dark:shadow-dark-400/10 transition-theme">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-primary dark:text-indigo-400">Controle Financeiro</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2 transition-theme">Faça login para acessar sua conta</p>
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900 dark:bg-opacity-20 text-red-700 dark:text-red-400 p-3 rounded-lg mb-4 transition-theme">
            <p className="flex items-center">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {error}
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-1 transition-theme" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-400 dark:bg-dark-300 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-indigo-600 transition-theme"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium transition-theme" htmlFor="password">
                Senha
              </label>
              <Link to="/forgot-password" className="text-sm text-primary dark:text-indigo-400 hover:underline transition-theme">
                Esqueceu a senha?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-400 dark:bg-dark-300 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-indigo-600 transition-theme"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-primary hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white font-medium py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-indigo-600 dark:focus:ring-offset-dark-200 transition-theme"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <i className="fas fa-spinner fa-spin mr-2"></i> Entrando...
              </span>
            ) : (
              "Entrar"
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600 dark:text-gray-300 transition-theme">
            Não tem uma conta?{" "}
            <Link to="/register" className="text-primary dark:text-indigo-400 hover:underline font-medium transition-theme">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;