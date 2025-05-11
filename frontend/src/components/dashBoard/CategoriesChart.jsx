import React, { useEffect, useRef, useContext } from 'react';
import Chart from 'chart.js/auto';
import { useUserSettingsContext } from '../../contexts/UserSettingsContext';

const CategoriesChart = ({ data, showBalance }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { settings } = useUserSettingsContext();
  const isDarkMode = settings?.darkMode || false;
  
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    // Preparar dados para o gráfico
    const labels = data.map(item => item.name);
    const values = data.map(item => item.value);
    const colors = data.map(item => item.color || '#94a3b8');
    
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderWidth: 1,
          borderColor: isDarkMode ? '#374151' : '#ffffff' // Ajuste da cor da borda para tema escuro
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
            labels: {
              color: isDarkMode ? '#e5e7eb' : '#1f2937' // Ajuste de cor das labels para tema escuro
            }
          },
          tooltip: {
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
            titleColor: isDarkMode ? '#e5e7eb' : '#1f2937',
            bodyColor: isDarkMode ? '#e5e7eb' : '#1f2937',
            borderColor: isDarkMode ? '#374151' : '#e5e7eb',
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                let label = context.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed !== null) {
                  if (showBalance) {
                    label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed);
                    
                    // Calcular e formatar a porcentagem corretamente com 2 casas decimais
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = ((context.parsed / total) * 100).toFixed(2);
                    label += ` (${percentage}%)`;
                  } else {
                    label += '••••• ';
                    
                    // Calcular e formatar a porcentagem corretamente com 2 casas decimais
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = ((context.parsed / total) * 100).toFixed(2);
                    label += `(${percentage}%)`;
                  }
                }
                return label;
              }
            }
          }
        },
        cutout: '70%'
      }
    });
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, showBalance, isDarkMode]);
  
  return (
    <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-300 p-4 transition-theme">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-gray-800 dark:text-white">Categorias de Despesas</h3>
      </div>
      
      <div className="h-64 relative">
        <canvas ref={chartRef}></canvas>
        {data && data.length > 0 && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="text-lg font-bold text-gray-800 dark:text-white">Total</div>
            <div className="text-xl text-gray-800 dark:text-white">
              {showBalance ? 
                data.reduce((total, item) => total + item.value, 0).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }) : 
                '•••••'
              }
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-2">
        {data && data.length > 0 ? (
          <div className="space-y-2 max-h-32 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-dark-400 scrollbar-track-transparent">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
                </div>
                <div className="text-sm font-medium dark:text-gray-200">
                  {showBalance ? (
                    <span>{item.formattedValue} <span className="text-gray-500 dark:text-gray-400">({parseFloat(item.percentage).toFixed(2)}%)</span></span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">•••••</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            <p>Nenhum dado disponível</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesChart;