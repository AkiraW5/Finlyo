import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

const CategoriesChart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [topCategories, setTopCategories] = useState([]);
  
  useEffect(() => {
    // Se não houver dados ou referência ao canvas, não fazer nada
    if (!data || !data.length || !chartRef.current) return;
    
    // Destruir gráfico existente se houver
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Pegar apenas as 5 principais categorias para o gráfico
    // As demais serão agrupadas como "Outras"
    const maxCategories = 5;
    let chartData = [...data];
    
    if (chartData.length > maxCategories) {
      const topItems = chartData.slice(0, maxCategories - 1);
      const otherItems = chartData.slice(maxCategories - 1);
      
      const otherTotal = otherItems.reduce((sum, item) => sum + item.value, 0);
      if (otherTotal > 0) {
        topItems.push({
          name: 'Outras',
          value: otherTotal,
          color: '#94a3b8',
          formattedValue: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(otherTotal),
          percentage: ((otherTotal / data.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1),
          formattedPercentage: `${((otherTotal / data.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%`
        });
      }
      
      chartData = topItems;
    }
    
    // Atualizar lista de categorias para exibir no componente
    setTopCategories(chartData);
    
    const ctx = chartRef.current.getContext('2d');
    
    // Preparar dados para o gráfico
    const labels = chartData.map(item => item.name);
    const values = chartData.map(item => item.value);
    const backgroundColors = chartData.map(item => item.color);
    
    // Criar novo gráfico
    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: backgroundColors,
          borderWidth: 0,
          hoverOffset: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.raw;
                const total = context.chart.getDatasetMeta(0).total;
                const percentage = ((value / total) * 100).toFixed(1);
                return `${context.label}: R$ ${value.toLocaleString('pt-BR')} (${percentage}%)`;
              }
            }
          }
        },
        layout: {
          padding: 20
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
        <h3 className="font-semibold text-gray-800">Despesas por Categoria</h3>
      </div>
      <div className="flex flex-col md:flex-row">
        <div className="h-64 w-full md:w-1/2">
          <canvas ref={chartRef}></canvas>
        </div>
        <div className="w-full md:w-1/2 mt-4 md:mt-0 md:pl-4">
          <ul className="space-y-2">
            {topCategories.map((category, index) => (
              <li key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: category.color }}
                  ></span>
                  <span className="text-sm font-medium">{category.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{category.formattedValue}</div>
                  <div className="text-xs text-gray-500">{category.formattedPercentage}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CategoriesChart;