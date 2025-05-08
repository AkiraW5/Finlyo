import React, { useState, useEffect, useRef } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register, currentUser } = useAuth();  // Adicionar currentUser aqui
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
    
    // Código de validação permanece igual
    if (password !== confirmPassword) {
      return setError('As senhas não coincidem');
    }
    
    if (password.length < 6) {
      return setError('A senha deve ter pelo menos 6 caracteres');
    }
    
    try {
      setError('');
      setLoading(true);
      
      // Fazer registro e redirecionar após sucesso
      await register(name, email, password);
      
      // Redirecionar para a página principal
      if (isMounted.current) {
        history.replace('/');
      }
    } catch (err) {
      if (isMounted.current) {
        setError('Falha ao criar conta. ' + (err.message || 'Tente novamente mais tarde.'));
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
          <h2 className="text-3xl font-bold text-primary">Criar Conta</h2>
          <p className="text-gray-600 mt-2">Comece a controlar suas finanças hoje</p>
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
            <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="name">
              Nome Completo
            </label>
            <input
              id="name"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
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
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="confirmPassword">
              Confirmar Senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
                <i className="fas fa-spinner fa-spin mr-2"></i> Cadastrando...
              </span>
            ) : (
              "Criar Conta"
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Já tem uma conta?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Entre aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;