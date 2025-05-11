import React, { useState, useEffect } from 'react';
import { loadTest } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useUserSettingsContext } from '../../contexts/UserSettingsContext';

const LoadTester = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [config, setConfig] = useState({
    requests: 10,
    concurrency: 2,
    endpoint: 'transactions',
    method: 'GET',
    delay: 100,
    payloadSize: 1, // Tamanho do payload em KB
    complexValidation: false, // Acionar validações complexas
    monitorResources: false // Monitorar recursos do servidor
  });
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [errorSummary, setErrorSummary] = useState({});
  const [responseTimesData, setResponseTimesData] = useState([]);
  const [serverMetrics, setServerMetrics] = useState(null);
  const { settings } = useUserSettingsContext();
  const isDarkMode = settings?.darkMode || false;

  // Monitoramento de recursos do servidor
  useEffect(() => {
    let metricsInterval;
    
    if (isRunning && config.monitorResources) {
      metricsInterval = setInterval(async () => {
        try {
          // Endpoint hipotético para buscar métricas do servidor
          const metrics = await loadTest.get('server-metrics');
          setServerMetrics(metrics);
          
          addLog(`📊 Métricas - CPU: ${metrics.cpu.toFixed(1)}%, RAM: ${metrics.memory.toFixed(1)}MB, MySQL I/O: ${metrics.dbIO.toFixed(1)}MB/s`);
        } catch (error) {
          console.error("Erro ao buscar métricas do servidor:", error);
        }
      }, 2000); // A cada 2 segundos
    }
    
    return () => {
      if (metricsInterval) clearInterval(metricsInterval);
    };
  }, [isRunning, config.monitorResources]);

  const addLog = (message) => {
    setLogs(prev => [`${new Date().toISOString().split('T')[1].split('.')[0]} - ${message}`, ...prev].slice(0, 50));
  };

  const handleConfigChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              (name === 'requests' || name === 'concurrency' || name === 'delay' || name === 'payloadSize') ? 
              parseInt(value, 10) : value
    }));
  };

  // Função para gerar um payload de tamanho específico (em KB)
  const generateLargePayload = (sizeInKB) => {
    // Cada caractere é aproximadamente 1 byte, então 1KB = ~1000 caracteres
    const charactersPerKB = 1000;
    
    // Criar um objeto com múltiplos campos para simular um payload real
    const data = {
      title: 'Teste de carga com payload grande',
      description: 'Este é um payload de teste com tamanho configurável',
      timestamp: new Date().toISOString(),
      items: []
    };
    
    // Gerar itens até atingir aproximadamente o tamanho desejado
    const itemsNeeded = Math.ceil((sizeInKB * charactersPerKB) / 100); // ~100 chars por item
    
    for (let i = 0; i < itemsNeeded; i++) {
      data.items.push({
        id: i,
        name: `Item ${i}`,
        value: Math.random() * 1000,
        description: `Descrição detalhada do item ${i} para aumentar o tamanho do payload`
      });
    }
    
    return data;
  };
  
  // Função para gerar dados que acionam validações complexas
  const generateComplexValidationData = (endpoint, index) => {
    switch (endpoint) {
      case 'transactions':
        return {
          description: "".padStart(1001, 'A'), // Descrição muito longa (validação de tamanho)
          amount: Math.random() > 0.5 ? -999999.99 : 999999.99, // Valores extremos
          date: '2030-99-99', // Data inválida
          categoryId: Math.random() > 0.5 ? 9999 : null, // ID inexistente ou nulo
          accountId: Math.random() > 0.5 ? 0 : NaN, // ID inválido
          type: Math.random() > 0.7 ? 'invalid_type' : ['income', 'expense'][Math.floor(Math.random() * 2)]
        };
      case 'accounts':
        return {
          name: Math.random() > 0.3 ? "".padStart(256, 'B') : "", // Nome muito longo ou vazio
          type: ['invalid', 'checking', 'savings', null][Math.floor(Math.random() * 4)],
          balance: Math.random() > 0.5 ? "NaN" : Math.floor(Math.random() * 10000000) / 100
        };
      case 'categories':
        return {
          name: Math.random() > 0.3 ? "".padStart(256, 'C') : "", // Nome muito longo ou vazio
          type: ['invalid', 'income', 'expense', null][Math.floor(Math.random() * 4)],
          color: Math.random() > 0.5 ? "não é uma cor" : '#GGHHII'
        };
      case 'budgets':
        return {
          month: Math.random() > 0.5 ? 13 : 0, // Mês inválido
          year: Math.random() > 0.5 ? 1899 : 2100, // Ano passado ou futuro demais
          categoryId: Math.random() > 0.5 ? 9999 : -1, // ID inexistente ou negativo
          amount: Math.random() > 0.5 ? "NaN" : -5000 // Valor negativo ou não-numérico
        };
      default:
        return { name: "".padStart(500, 'X'), invalid_field: true };
    }
  };

  const runLoadTest = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setResults(null);
    setLogs([]);
    setProgress(0);
    setErrorSummary({});
    setResponseTimesData([]);
    setServerMetrics(null);
    
    // Registrar configurações do teste
    addLog(`📝 Iniciando teste com payload de ${config.payloadSize}KB e validação complexa ${config.complexValidation ? 'ATIVADA' : 'DESATIVADA'}`);
    
    const startTime = performance.now();
    let successful = 0;
    let failed = 0;
    let totalResponseTime = 0;
    let errorCollection = {};
    const responseTimes = [];
    
    addLog(`Iniciando teste: ${config.requests} requisições para ${config.endpoint} (${config.method})`);

    try {
      // Criar um array com o número total de requisições
      const requests = Array.from({ length: config.requests }, (_, i) => i + 1);
      
      // Processar em lotes baseados na concorrência
      for (let i = 0; i < requests.length; i += config.concurrency) {
        const batch = requests.slice(i, i + config.concurrency);
        const batchNumber = Math.ceil((i+1)/config.concurrency);
        
        addLog(`Processando lote ${batchNumber} de ${Math.ceil(config.requests/config.concurrency)}`);
        
        // Atualizar progresso
        setProgress(Math.round((i / requests.length) * 100));
        
        const batchStartTime = performance.now();
        const batchPromises = batch.map(async (reqNum) => {
          const reqStart = performance.now();
          try {
            let response;
            switch (config.method) {
              case 'GET':
                response = await loadTest.get(config.endpoint);
                break;
              case 'POST':
                const postData = generateTestData(config.endpoint, reqNum);
                response = await loadTest.post(config.endpoint, postData);
                break;
              case 'PUT':
                const putData = generateTestData(config.endpoint, reqNum);
                response = await loadTest.put(config.endpoint, reqNum, putData);
                break;
              case 'DELETE':
                response = await loadTest.delete(config.endpoint, reqNum);
                break;
              default:
                throw new Error(`Método ${config.method} não suportado`);
            }
            
            const reqTime = performance.now() - reqStart;
            totalResponseTime += reqTime;
            addLog(`✅ Requisição #${reqNum} completada em ${reqTime.toFixed(0)}ms`);
            return { success: true, time: reqTime, id: reqNum };
          } catch (error) {
            const reqTime = performance.now() - reqStart;
            const errorMessage = error.response?.data?.message || error.message;
            const statusCode = error.response?.status || 'unknown';
            const errorKey = `${statusCode}: ${errorMessage}`;
            
            // Adicionar ao registro de erros
            errorCollection[errorKey] = (errorCollection[errorKey] || 0) + 1;
            
            addLog(`❌ Requisição #${reqNum} falhou: ${statusCode} - ${errorMessage}`);
            return { 
              success: false, 
              time: reqTime, 
              error: errorMessage,
              statusCode,
              id: reqNum 
            };
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        successful += batchResults.filter(r => r.success).length;
        failed += batchResults.filter(r => !r.success).length;
        
        // Registrar tempos de resposta do lote para gráficos
        const batchTime = performance.now() - batchStartTime;
        responseTimes.push({
          lote: batchNumber,
          tempoMedio: batchResults.reduce((acc, curr) => acc + curr.time, 0) / batch.length,
          tempoTotal: batchTime,
          sucessos: batchResults.filter(r => r.success).length,
          falhas: batchResults.filter(r => !r.success).length
        });
        
        // Atualizar gráfico em tempo real
        setResponseTimesData([...responseTimes]);
        setErrorSummary(errorCollection);
        
        // Aplicar delay entre os lotes se especificado
        if (config.delay > 0 && i + config.concurrency < requests.length) {
          addLog(`Aguardando ${config.delay}ms antes do próximo lote...`);
          await new Promise(resolve => setTimeout(resolve, config.delay));
        }
      }
      
      const totalTime = performance.now() - startTime;
      
      // Finalizar o progresso
      setProgress(100);
      
      // Resumo dos erros
      if (Object.keys(errorCollection).length > 0) {
        addLog(`\n📊 Resumo dos erros encontrados:`);
        Object.entries(errorCollection).forEach(([error, count]) => {
          addLog(`   ${error} - ${count} ocorrência(s)`);
        });
      }
      
      // Adicionar métricas de tamanho de payload aos resultados
      setResults({
        totalRequests: config.requests,
        successful,
        failed,
        totalTime,
        avgResponseTime: totalResponseTime / config.requests,
        requestsPerSecond: (successful / (totalTime / 1000)).toFixed(2),
        errorDetails: errorCollection,
        payloadDetails: config.method !== 'GET' ? {
          size: config.payloadSize,
          totalDataTransferred: (config.payloadSize * config.requests / 1024).toFixed(2) + ' MB'
        } : null
      });
      
      addLog(`Teste finalizado em ${(totalTime / 1000).toFixed(1)}s com ${config.method !== 'GET' ? config.payloadSize + 'KB por requisição' : 'sem payload'}`);
    } catch (error) {
      addLog(`Erro no teste: ${error.message}`);
      setProgress(0);
    } finally {
      setIsRunning(false);
    }
  };

  // Função para gerar dados de teste baseados no endpoint
  const generateTestData = (endpoint, index) => {
    // Se validação complexa estiver ativada, gere dados para testar validação
    if (config.complexValidation) {
      return generateComplexValidationData(endpoint, index);
    }
    
    // Caso contrário, gere dados normais + payload grande se configurado
    let baseData = {};
    
    switch (endpoint) {
        case 'transactions':
            baseData = {
                description: `Transação de teste ${index}`,
                amount: Math.floor(Math.random() * 1000) / 100,
                date: new Date().toISOString().split('T')[0],
                categoryId: {id: 1 },  // ID simples
                accountId: {id: 2 },                                  // ID simples
                type: Math.random() > 0.5 ? 'income' : 'expense'
            };
            break;
      case 'accounts':
        baseData = {
          name: `Conta de teste ${index}`,
          type: ['checking', 'savings', 'investment', 'credit'][Math.floor(Math.random() * 4)],
          balance: Math.floor(Math.random() * 10000) / 100
        };
        break;
      case 'categories':
        baseData = {
          name: `Categoria de teste ${index}`,
          type: Math.random() > 0.5 ? 'income' : 'expense',
          color: '#' + Math.floor(Math.random()*16777215).toString(16)
        };
        break;
      case 'budgets':
        baseData = {
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          categoryId: Math.floor(Math.random() * 5) + 1,
          amount: Math.floor(Math.random() * 5000) / 100
        };
        break;
      default:
        baseData = { name: `Teste ${index}`, createdAt: new Date().toISOString() };
    }
    
    // Se o payload for maior que 1KB, adicione dados extras
    if (config.payloadSize > 1) {
      baseData.extraData = generateLargePayload(config.payloadSize - 1);
    }
    
    return baseData;
  };

  return (
    <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-300 p-6 transition-theme">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Teste de Carga do Sistema</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Configuração</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Endpoint</label>
            <select
              name="endpoint"
              value={config.endpoint}
              onChange={handleConfigChange}
              className="block w-full rounded-lg border-gray-300 dark:border-dark-400 dark:bg-dark-300 shadow-sm focus:border-primary focus:ring-primary dark:focus:ring-indigo-600 dark:text-white transition-theme"
              disabled={isRunning}
            >
              <option value="transactions">Transações</option>
              <option value="accounts">Contas</option>
              <option value="categories">Categorias</option>
              <option value="budgets">Orçamentos</option>
              <option value="goals">Metas</option>
              <option value="users">Usuários</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Método</label>
            <select
              name="method"
              value={config.method}
              onChange={handleConfigChange}
              className="block w-full rounded-lg border-gray-300 dark:border-dark-400 dark:bg-dark-300 shadow-sm focus:border-primary focus:ring-primary dark:focus:ring-indigo-600 dark:text-white transition-theme"
              disabled={isRunning}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Número de Requisições
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({config.requests})</span>
            </label>
            <input
              type="range"
              name="requests"
              value={config.requests}
              onChange={handleConfigChange}
              min="1"
              max="100"
              className="block w-full"
              disabled={isRunning}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Concorrência
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({config.concurrency})</span>
            </label>
            <input
              type="range"
              name="concurrency"
              value={config.concurrency}
              onChange={handleConfigChange}
              min="1"
              max="10"
              className="block w-full"
              disabled={isRunning}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Delay entre lotes (ms)
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({config.delay}ms)</span>
            </label>
            <input
              type="range"
              name="delay"
              value={config.delay}
              onChange={handleConfigChange}
              min="0"
              max="1000"
              step="50"
              className="block w-full"
              disabled={isRunning}
            />
          </div>

          {/* Nova configuração: Tamanho do Payload */}
          {(config.method === 'POST' || config.method === 'PUT') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tamanho do Payload (KB)
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({config.payloadSize}KB)</span>
              </label>
              <input
                type="range"
                name="payloadSize"
                value={config.payloadSize}
                onChange={handleConfigChange}
                min="1"
                max="100"
                step="1"
                className="block w-full"
                disabled={isRunning}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {config.payloadSize === 1 ? 'Mínimo (~1KB)' : ''} 
                {config.payloadSize >= 50 ? '⚠️ Payloads grandes podem impactar a performance!' : ''}
              </span>
            </div>
          )}
          
          {/* Nova configuração: Validações Complexas */}
          {(config.method === 'POST' || config.method === 'PUT') && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="complexValidation"
                name="complexValidation"
                checked={config.complexValidation}
                onChange={handleConfigChange}
                className="h-4 w-4 text-primary focus:ring-primary dark:focus:ring-indigo-600 border-gray-300 dark:border-dark-400 rounded"
                disabled={isRunning}
              />
              <label htmlFor="complexValidation" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Testar validações complexas
                <span className="block text-xs text-gray-500 dark:text-gray-400">Envia dados inválidos para testar robustez do backend</span>
              </label>
            </div>
          )}
          
          {/* Nova configuração: Monitoramento de Recursos */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="monitorResources"
              name="monitorResources"
              checked={config.monitorResources}
              onChange={handleConfigChange}
              className="h-4 w-4 text-primary focus:ring-primary dark:focus:ring-indigo-600 border-gray-300 dark:border-dark-400 rounded"
              disabled={isRunning}
            />
            <label htmlFor="monitorResources" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Monitorar recursos do servidor
              <span className="block text-xs text-gray-500 dark:text-gray-400">Requer configuração do endpoint server-metrics no backend</span>
            </label>
          </div>
          
          <div className="pt-4">
            <button
              onClick={runLoadTest}
              disabled={isRunning}
              className={`w-full py-2 px-4 rounded-lg flex items-center justify-center ${
                isRunning 
                  ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
                  : 'bg-primary hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white'
              } transition-theme`}
            >
              {isRunning ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Executando...
                </>
              ) : (
                <>
                  <i className="fas fa-play mr-2"></i>
                  Iniciar Teste
                </>
              )}
            </button>
          </div>
          
          {/* Barra de Progresso */}
          {isRunning && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Progresso</span>
                <span className="text-sm font-medium text-primary dark:text-indigo-400">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-dark-400 rounded-full h-2.5">
                <div 
                  className="bg-primary dark:bg-indigo-500 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
        
        <div>
          {serverMetrics && (
            <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-10 p-4 rounded-lg mb-4">
              <h3 className="text-md font-semibold text-blue-800 dark:text-blue-400 mb-2">Métricas do Servidor</h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white dark:bg-dark-300 p-2 rounded shadow-sm">
                  <p className="text-xs text-gray-500 dark:text-gray-400">CPU</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{serverMetrics.cpu.toFixed(1)}%</p>
                </div>
                <div className="bg-white dark:bg-dark-300 p-2 rounded shadow-sm">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Memória</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">{serverMetrics.memory.toFixed(1)} MB</p>
                </div>
                <div className="bg-white dark:bg-dark-300 p-2 rounded shadow-sm">
                  <p className="text-xs text-gray-500 dark:text-gray-400">MySQL I/O</p>
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{serverMetrics.dbIO.toFixed(1)} MB/s</p>
                </div>
              </div>
            </div>
          )}

          {results && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Resultados</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-dark-300 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total de Requisições</p>
                  <p className="text-2xl font-bold dark:text-white">{results.totalRequests}</p>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900 dark:bg-opacity-20 p-4 rounded-lg">
                  <p className="text-xs text-green-600 dark:text-green-400">Bem Sucedidas</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{results.successful}</p>
                </div>
                
                {results.failed > 0 && (
                  <div className="bg-red-50 dark:bg-red-900 dark:bg-opacity-20 p-4 rounded-lg">
                    <p className="text-xs text-red-600 dark:text-red-400">Falhas</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{results.failed}</p>
                  </div>
                )}
                
                <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 p-4 rounded-lg">
                  <p className="text-xs text-blue-600 dark:text-blue-400">Req/segundo</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{results.requestsPerSecond}</p>
                </div>
                
                <div className="bg-indigo-50 dark:bg-indigo-900 dark:bg-opacity-20 p-4 rounded-lg">
                  <p className="text-xs text-indigo-600 dark:text-indigo-400">Tempo Médio</p>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{results.avgResponseTime.toFixed(0)} ms</p>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20 p-4 rounded-lg">
                  <p className="text-xs text-purple-600 dark:text-purple-400">Tempo Total</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{(results.totalTime / 1000).toFixed(1)} s</p>
                </div>
              </div>

              {/* Payload Details */}
              {results.payloadDetails && (
                <div className="bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 p-4 rounded-lg mb-4">
                  <h3 className="text-md font-semibold text-yellow-800 dark:text-yellow-400 mb-2">Informações de Payload</h3>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-400">
                    <li>Tamanho por requisição: <span className="font-medium">{results.payloadDetails.size} KB</span></li>
                    <li>Total transferido: <span className="font-medium">{results.payloadDetails.totalDataTransferred}</span></li>
                  </ul>
                </div>
              )}
              
              {/* Resumo de Erros */}
              {results.failed > 0 && (
                <div className="mb-6">
                  <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-2">Resumo de Erros</h3>
                  <div className="bg-red-50 dark:bg-red-900 dark:bg-opacity-20 p-4 rounded-lg">
                    <ul className="text-sm text-red-600 dark:text-red-400">
                      {Object.entries(results.errorDetails).map(([error, count], index) => (
                        <li key={index} className="mb-1">
                          <span className="font-medium">{count}x</span> - {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              {/* Gráfico de Desempenho */}
              {responseTimesData.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-2">Desempenho por Lote</h3>
                  <div className="bg-white dark:bg-dark-300 border border-gray-100 dark:border-dark-400 rounded-lg p-4" style={{ height: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={responseTimesData}
                        margin={{ top: 10, right: 0, left: -25, bottom: 0 }}
                      >
                        <XAxis 
                          dataKey="lote" 
                          label={{ value: 'Lote', position: 'bottom' }}
                          tick={{ fill: isDarkMode ? '#d1d5db' : '#4b5563' }} 
                        />
                        <YAxis 
                          label={{ value: 'Tempo (ms)', angle: -90, position: 'left' }}
                          tick={{ fill: isDarkMode ? '#d1d5db' : '#4b5563' }}  
                        />
                        <Tooltip 
                          formatter={(value) => [`${value.toFixed(0)} ms`, '']}
                          labelFormatter={(label) => `Lote ${label}`}
                          contentStyle={{ 
                            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                            borderColor: isDarkMode ? '#374151' : '#e5e7eb',
                            color: isDarkMode ? '#e5e7eb' : '#1f2937'
                          }}
                        />
                        <Bar 
                          dataKey="tempoMedio" 
                          name="Tempo Médio" 
                          fill={isDarkMode ? '#818cf8' : '#6366f1'}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Log de Execução</h2>
          <div className="bg-gray-900 text-gray-100 p-3 rounded-lg h-[300px] overflow-y-auto font-mono text-xs">
            {logs.length === 0 ? (
              <div className="text-gray-500">Os logs serão exibidos aqui durante o teste...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="py-1 border-b border-gray-800 last:border-0">{log}</div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Informações para implementação no backend */}
      {config.monitorResources && (
        <div className="mt-6 p-4 border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-400 mb-2">⚠️ Implementação necessária no backend</h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-2">
            Para utilizar o monitoramento de recursos do servidor, crie um endpoint <code className="bg-white dark:bg-dark-300 px-1 py-0.5 rounded">
            /api/server-metrics</code> que retorne:
          </p>
          <pre className="bg-gray-800 text-green-400 p-3 rounded text-xs overflow-auto">
{`{
  "cpu": 23.5,        // Percentual de uso da CPU
  "memory": 512.3,    // Uso de memória em MB
  "dbIO": 5.2         // I/O do MySQL em MB/s
}`}
          </pre>
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
            Dica: No Node.js, use <code className="bg-white dark:bg-dark-300 px-1 py-0.5 rounded">os-utils</code> 
            para métricas de CPU, <code className="bg-white dark:bg-dark-300 px-1 py-0.5 rounded">process.memoryUsage()</code> 
            para memória e um pacote MySQL que suporte estatísticas de conexão.
          </p>
        </div>
      )}
    </div>
  );
};

export default LoadTester;