import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tailwind.css';
import App from './App';

// Pegando o elemento container
const container = document.getElementById('root');

// Criando uma raiz React 18
const root = createRoot(container);

// Renderizando o app nessa raiz
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);