import { useState, useEffect } from 'react';
import { getUserSettings } from '../services/api';

// Hook personalizado para gerenciar configurações do usuário
export const useUserSettings = () => {
  const [settings, setSettings] = useState({
    // Preferências padrão
    currency: 'BRL',
    dateFormat: 'DD/MM/YYYY',
    theme: 'light',
    language: 'pt-BR',
    showBalance: true,
    hideAmounts: false
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Buscar configurações do usuário
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        const userSettings = await getUserSettings();
        
        if (userSettings) {
          setSettings(prev => ({
            ...prev,
            ...userSettings
          }));
        }
      } catch (error) {
        console.error("Erro ao carregar configurações do usuário:", error);
        setError('Não foi possível carregar suas preferências');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  return { settings, loading, error, setSettings };
};