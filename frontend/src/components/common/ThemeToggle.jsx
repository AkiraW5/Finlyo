import React from 'react';
import { useUserSettingsContext } from '../../contexts/UserSettingsContext';

const ThemeToggle = () => {
  const { settings, updateSettings } = useUserSettingsContext();
  const currentTheme = settings.theme || 'light';

  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    updateSettings({ theme: newTheme });
  };

  return (
    <button 
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-100 dark:bg-dark-300 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-400 transition-colors"
      title={`Alternar para tema ${currentTheme === 'light' ? 'escuro' : 'claro'}`}
    >
      {currentTheme === 'light' ? (
        <i className="fas fa-moon"></i>
      ) : (
        <i className="fas fa-sun"></i>
      )}
    </button>
  );
};

export default ThemeToggle;