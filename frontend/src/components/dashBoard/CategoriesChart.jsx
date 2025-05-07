import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js';

const CategoriesChart = () => {
  const chartRef = useRef(null);
  
  useEffect(() => {
    if (chartRef && chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Saúde', 'Outros'],
          datasets: [{
            data: [748.90, 1800, 180, 370.50, 100, 541.70],
            backgroundColor: [
              '#ef4444',
              '#3b82f6',
              '#8b5cf6',
              '#f59e0b',
              '#10b981',
              '#64748b'
            ],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: {
              position: 'right',
              labels: {
                boxWidth: 10,
                padding: 10,
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: R$ ${value.toLocaleString('pt-BR')} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    }
  }, []);
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">Despesas por Categoria</h3>
        <button className="text-primary text-sm font-medium">Ver todas</button>
      </div>
      <div className="h-64">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default CategoriesChart;