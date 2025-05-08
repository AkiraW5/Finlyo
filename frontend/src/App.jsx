import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Accounts from './components/Accounts';
import Goals from './components/Goal';
import Categories from './components/Categories';
import Reports from './components/Reports';
import Budget from './components/Budget';
import Settings from './components/Settings';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './styles/tailwind.css';

// Componente para proteger rotas
const PrivateRoute = ({ component: Component, ...rest }) => {
  const { currentUser, loading } = useAuth();
  
  return (
    <Route
      {...rest}
      render={(props) => {
        if (loading) {
          return (
            <div className="flex justify-center items-center h-screen">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
            </div>
          );
        }
        
        return currentUser ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        );
      }}
    />
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Switch>
          {/* Rotas públicas */}
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          
          {/* Rotas privadas */}
          <PrivateRoute exact path="/" component={Dashboard} />
          <PrivateRoute path="/transactions" component={Transactions} />
          <PrivateRoute path="/accounts" component={Accounts} />
          <PrivateRoute path="/categories" component={Categories} />
          <PrivateRoute path="/budget" component={Budget} />
          <PrivateRoute path="/goals" component={Goals} />
          <PrivateRoute path="/reports" component={Reports} />
          <PrivateRoute path="/settings" component={Settings} />
          
          {/* Rota de fallback para página não encontrada */}
          <Route path="*">
            <Redirect to="/" />
          </Route>
        </Switch>
      </Router>
    </AuthProvider>
  );
}

export default App;