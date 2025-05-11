import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import MobileSidebar from '../components/layout/MobileSidebar';
import LoadTester from '../components/tests/LoadTester';

const TestPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="bg-gray-50 dark:bg-dark-100 min-h-screen transition-theme">
      <Sidebar />
      <Header title="Testes" onMenuClick={() => setMobileMenuOpen(true)} />
      <MobileSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      
      <div className="md:ml-64">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Testes de Sistema</h2>
              <p className="text-gray-600 dark:text-gray-300">Analise o desempenho da sua aplicação com diferentes volumes de dados</p>
            </div>
          </div>

          <LoadTester />
        </div>
      </div>
    </div>
  );
};

export default TestPage;