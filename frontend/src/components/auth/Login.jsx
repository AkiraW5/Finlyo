import React, { useState, useEffect, useRef } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, currentUser } = useAuth();  // Adicionar currentUser aqui
  const history = useHistory();
  const isMounted = useRef(true);

  // Verificar se o usuário já está autenticado ao carregar o componente
  useEffect(() => {
    if (currentUser) {
      history.replace('/');
    }
  }, [currentUser, history]);

  // Adicionar cleanup para evitar memory leak
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
      
      // Fazer login e redirecionar após sucesso
      await login(email, password);
      
      // Redirecionar para a página principal se o componente ainda estiver montado
      if (isMounted.current) {
        history.replace('/');
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
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-primary">Controle Financeiro</h2>
          <p className="text-gray-600 mt-2">Faça login para acessar sua conta</p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">
            <p className="flex items-center">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {error}
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-gray-700 text-sm font-medium" htmlFor="password">
                Senha
              </label>
              <Link to="/reset-password" className="text-sm text-primary hover:underline">
                Esqueceu a senha?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-primary hover:bg-indigo-700 text-white font-medium py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
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
          <p className="text-gray-600">
            Não tem uma conta?{" "}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;