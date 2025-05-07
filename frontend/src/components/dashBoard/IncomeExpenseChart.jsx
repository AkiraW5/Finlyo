import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js';

const IncomeExpenseChart = () => {
  const chartRef = useRef(null);
  
  useEffect(() => {
    if (chartRef && chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
          datasets: [
            {
              label: 'Receitas',
              data: [4500, 4800, 5000, 4900, 5100, 5200],
              backgroundColor: '#10b981',
              borderRadius: 4
            },
            {
              label: 'Despesas',
              data: [3200, 3500, 3800, 3600, 3700, 3741],
              backgroundColor: '#ef4444',
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                drawBorder: false
              },
              ticks: {
                callback: function(value) {
                  return 'R$ ' + value.toLocaleString('pt-BR');
                }
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          },
          plugins: {
            legend: {
              position: 'top',
              align: 'end',
              labels: {
                usePointStyle: true,
                boxWidth: 6
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  label += 'R$ ' + context.raw.toLocaleString('pt-BR');
                  return label;
                }
              }
            }
          }
        }
      });
    }
  }, []);
  
  return (
    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">Receitas vs Despesas</h3>
        <div className="flex space-x-2">
          <button className="px-3 py-1 text-xs bg-indigo-50 text-indigo-700 rounded-full">Mensal</button>
          <button className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">Anual</button>
        </div>
      </div>
      <div className="h-64">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default IncomeExpenseChart;