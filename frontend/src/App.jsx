import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Accounts from './components/Accounts';
import Budgets from './components/Budgets';
import Categories from './components/Categories';
import Reports from './components/Reports';
import './styles/tailwind.css';

// Configuração do Tailwind
const configScript = document.createElement('script');
configScript.innerHTML = `
  window.tailwind = window.tailwind || {};
  window.tailwind.config = {
    theme: {
      extend: {
        colors: {
          primary: '#4f46e5',
          secondary: '#10b981',
          expense: '#ef4444',
          income: '#10b981',
          dark: '#1e293b',
        }
      }
    }
  };
`;
document.head.appendChild(configScript);

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Dashboard} />
        <Route path="/transactions" component={Transactions} />
        <Route path="/accounts" component={Accounts} />
        <Route path="/budgets" component={Budgets} />
        <Route path="/categories" component={Categories} />
        <Route path="/reports" component={Reports} />
      </Switch>
    </Router>
  );
}

export default App;