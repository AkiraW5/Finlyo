import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useUserSettingsContext } from '../../contexts/UserSettingsContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: Token + Nova senha
  const [loading, setLoading] = useState(false);
  const { settings } = useUserSettingsContext();

  const handleRequestCode = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      setMessage('');
      
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      
      setMessage('Código de recuperação gerado. Use-o para redefinir sua senha.');
      setResetToken(response.data.resetToken || ''); // Em produção, o usuário digitaria o código recebido
      setStep(2);
    } catch (err) {
      setError('Erro ao solicitar código. Verifique o email e tente novamente.');
      console.error('Erro ao solicitar código:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      setMessage('');
      
      await axios.post('http://localhost:5000/api/auth/reset-password', { 
        email, 
        token: resetToken, 
        newPassword 
      });
      
      setMessage('Senha redefinida com sucesso!');
      setTimeout(() => {
        window.location.href = '/login'; // Redirecionar para login após 2 segundos
      }, 2000);
    } catch (err) {
      setError('Erro ao redefinir senha. Verifique o código e tente novamente.');
      console.error('Erro ao redefinir senha:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-dark-100 transition-theme">
      <div className="w-full max-w-md p-8 bg-white dark:bg-dark-200 rounded-xl shadow-lg dark:shadow-dark-400/10 transition-theme">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-primary dark:text-indigo-400 transition-theme">Recuperação de Senha</h2>
          {step === 1 ? (
            <p className="text-gray-600 dark:text-gray-300 mt-2 transition-theme">Digite seu email para receber o código</p>
          ) : (
            <p className="text-gray-600 dark:text-gray-300 mt-2 transition-theme">Digite o código recebido e sua nova senha</p>
          )}
        </div>
        
        {message && (
          <div className="bg-green-50 dark:bg-green-900 dark:bg-opacity-20 text-green-700 dark:text-green-400 p-3 rounded-lg mb-4 transition-theme">
            <p>{message}</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900 dark:bg-opacity-20 text-red-700 dark:text-red-400 p-3 rounded-lg mb-4 transition-theme">
            <p>{error}</p>
          </div>
        )}
        
        {step === 1 ? (
          <form onSubmit={handleRequestCode}>
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
            
            <button
              type="submit"
              className="w-full bg-primary hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white font-medium py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-indigo-600 dark:focus:ring-offset-dark-200 transition-theme"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Solicitar Código"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-1 transition-theme" htmlFor="token">
                Código de Verificação
              </label>
              <input
                id="token"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-400 dark:bg-dark-300 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-indigo-600 transition-theme"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-1 transition-theme" htmlFor="newPassword">
                Nova Senha
              </label>
              <input
                id="newPassword"
                type="password"
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-400 dark:bg-dark-300 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-indigo-600 transition-theme"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-primary hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white font-medium py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-indigo-600 dark:focus:ring-offset-dark-200 transition-theme"
              disabled={loading}
            >
              {loading ? "Processando..." : "Redefinir Senha"}
            </button>
          </form>
        )}
        
        <div className="mt-6 text-center">
          <Link to="/login" className="text-primary dark:text-indigo-400 hover:underline font-medium transition-theme">
            Voltar para o Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;