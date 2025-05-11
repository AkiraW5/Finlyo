import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { useUserSettingsContext } from '../../contexts/UserSettingsContext';

const IncomeExpenseChart = ({ data, showBalance }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { settings } = useUserSettingsContext();
  const isDarkMode = settings?.darkMode || false;

  useEffect(() => {
    if (!data || data.length === 0) return;
    
    const dates = data.map(item => item.date);
    const incomeData = data.map(item => item.income);
    const expenseData = data.map(item => item.expense);
    
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'Receitas',
            data: incomeData,
            backgroundColor: isDarkMode ? 'rgba(34, 197, 94, 0.7)' : 'rgba(16, 185, 129, 0.7)', // Verde ajustado para tema escuro
            borderWidth: 0,
            borderRadius: 4
          },
          {
            label: 'Despesas',
            data: expenseData,
            backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.7)' : 'rgba(239, 68, 68, 0.7)', // Vermelho
            borderWidth: 0,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: isDarkMode ? '#e5e7eb' : '#1f2937' // Cor do texto da legenda
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
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  if (showBalance) {
                    label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y);
                  } else {
                    label += '•••••';
                  }
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false,
              color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
            },
            title: {
              display: true,
              text: 'Dia do mês',
              color: isDarkMode ? '#e5e7eb' : '#1f2937'
            },
            ticks: {
              color: isDarkMode ? '#d1d5db' : '#4b5563' // Cor dos números no eixo X
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              color: isDarkMode ? '#d1d5db' : '#4b5563', // Cor dos números no eixo Y
              callback: function(value) {
                if (showBalance) {
                  return 'R$ ' + value.toLocaleString('pt-BR');
                } else {
                  return '•••••';
                }
              }
            }
          }
        }
      }
    });
    
    // Limpeza ao desmontar componente
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, showBalance, isDarkMode]);
  
  return (
    <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-300 p-4 transition-theme">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800 dark:text-white">Receitas vs Despesas</h3>
        <div className="flex space-x-2">
          <select className="text-sm border border-gray-300 dark:border-dark-400 rounded-lg px-2 py-1 bg-white dark:bg-dark-300 text-gray-800 dark:text-white">
            <option>Todos os dias</option>
            <option>Últimos 7 dias</option>
            <option>Últimos 15 dias</option>
          </select>
        </div>
      </div>
      <div className="h-64">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default IncomeExpenseChart;