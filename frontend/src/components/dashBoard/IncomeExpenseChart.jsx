import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const IncomeExpenseChart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  
  useEffect(() => {
    // Se não houver dados ou referência ao canvas, não fazer nada
    if (!data || !data.length || !chartRef.current) return;
    
    // Destruir gráfico existente se houver
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    const ctx = chartRef.current.getContext('2d');
    
    // Preparar dados para o gráfico
    const labels = data.map(item => item.date);
    const incomeData = data.map(item => item.income);
    const expenseData = data.map(item => item.expense);
    
    // Criar novo gráfico
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Receitas',
            data: incomeData,
            backgroundColor: 'rgba(16, 185, 129, 0.7)', // Verde
            borderWidth: 0,
            borderRadius: 4
          },
          {
            label: 'Despesas',
            data: expenseData,
            backgroundColor: 'rgba(239, 68, 68, 0.7)', // Vermelho
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
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y);
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            title: {
              display: true,
              text: 'Dia do mês'
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              callback: function(value) {
                return 'R$ ' + value.toLocaleString('pt-BR');
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
  }, [data]);
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">Receitas vs Despesas</h3>
        <div className="flex space-x-2">
          <span className="text-xs text-gray-500">Este mês</span>
        </div>
      </div>
      <div className="h-80">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default IncomeExpenseChart;