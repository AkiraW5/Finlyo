import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserSettings, updateUserSettings } from '../services/api';

const UserSettingsContext = createContext();

export const useUserSettingsContext = () => useContext(UserSettingsContext);

export const UserSettingsProvider = ({ children }) => {
  // Estado para as configurações do usuário
  const [settings, setSettings] = useState({
    currency: 'BRL',
    dateFormat: 'DD/MM/YYYY',
    language: 'pt-BR',
    theme: 'light', // Padrão é tema claro
    showBalance: true,
    hideAmounts: false,
    // ... outras configurações
  });
  
  // Estado de carregamento
  const [loading, setLoading] = useState(true);

  // Carregar configurações ao montar o componente
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const userSettings = await getUserSettings();
        if (userSettings) {
          setSettings(prev => ({ ...prev, ...userSettings }));
          
          // Aplicar tema ao body
          applyTheme(userSettings.theme || 'light');
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  // Função para aplicar o tema ao documento
  const applyTheme = (theme) => {
    if (theme === 'system') {
      // Verificar preferência do sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    } else {
      // Aplicar o tema selecionado
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  };

  // Função para atualizar configurações
  const updateSettings = async (newSettings) => {
    try {
      // Atualizar as configurações no servidor
      await updateUserSettings(newSettings);
      
      // Atualizar o estado
      setSettings(prev => ({
        ...prev,
        ...newSettings
      }));
      
      // Se o tema foi alterado, aplicá-lo
      if (newSettings.theme) {
        applyTheme(newSettings.theme);
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      return false;
    }
  };

  // Funções de formatação
  const formatCurrency = (value) => {
    if (!value && value !== 0) return 'R$ 0,00';
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    return new Intl.NumberFormat(settings.language, {
      style: 'currency',
      currency: settings.currency
    }).format(numValue);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    switch (settings.dateFormat) {
      case 'DD/MM/YYYY':
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
      case 'MM/DD/YYYY':
        return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
      case 'YYYY-MM-DD':
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      default:
        return date.toLocaleDateString(settings.language);
    }
  };

  // Ouvir mudanças na preferência do sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Função que será chamada quando a preferência do sistema mudar
    const handleChange = () => {
      if (settings.theme === 'system') {
        applyTheme('system');
      }
    };
    
    // Adicionar listener
    mediaQuery.addEventListener('change', handleChange);
    
    // Limpar listener
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.theme]);

  return (
    <UserSettingsContext.Provider 
      value={{ 
        settings, 
        updateSettings,
        formatCurrency, 
        formatDate,
        showBalance: settings.showBalance,
        loading,
        currentTheme: settings.theme
      }}
    >
      {children}
    </UserSettingsContext.Provider>
  );
};