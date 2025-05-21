# Finlyo - Sistema de Gestão Financeira Pessoal

<div align="center">
  <img src="frontend/finlyo-icon.png" alt="Finlyo Logo" width="200"/>
  <br>
  <h3>Controle suas finanças com simplicidade e eficiência</h3>
</div>

![License](https://img.shields.io/badge/license-Custom--BY--NC--SA-blue.svg )
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Node](https://img.shields.io/badge/node-v16+-blue.svg)
![React](https://img.shields.io/badge/react-v18-blue.svg)

## 📋 Visão Geral

Finlyo é uma aplicação full-stack moderna para gestão financeira pessoal, desenvolvida com React no frontend e Node.js/Express no backend. O sistema permite aos usuários gerenciar transações, contas, orçamentos, metas financeiras e categorias, oferecendo uma solução completa para controle financeiro.

<div align="center">
  <img src="https://i.imgur.com/LXjv5Dy.png" alt="Finlyo Dashboard Preview" width="80%"/>
</div>

## ✨ Funcionalidades

- **Dashboard Intuitivo**: Visualização clara das finanças com gráficos e estatísticas
- **Gestão de Transações**: Registro e categorização de receitas e despesas
- **Múltiplas Contas**: Suporte a contas bancárias, cartões de crédito e investimentos
- **Orçamentos Personalizados**: Definição de limites por categoria
- **Metas Financeiras**: Acompanhamento de objetivos de economia
- **Relatórios Detalhados**: Análise de gastos e tendências
- **Autenticação Segura**: Sistema completo com JWT, recuperação de senha e perfis de usuário
- **Design Responsivo**: Experiência otimizada em dispositivos móveis e desktop

## 🔧 Tecnologias Utilizadas

### Frontend
- **React**: Biblioteca para construção de interfaces
- **Context API**: Gerenciamento de estado
- **React Router**: Navegação entre páginas
- **Tailwind CSS**: Framework CSS para design responsivo
- **Chart.js**: Visualização de dados em gráficos

### Backend
- **Node.js**: Ambiente de execução JavaScript
- **Express**: Framework web para API RESTful
- **Sequelize**: ORM para interação com banco de dados
- **MySQL**: Banco de dados relacional
- **JWT**: Autenticação e autorização
- **Bcrypt**: Criptografia de senhas

## 🏗️ Arquitetura

O projeto segue uma arquitetura moderna de aplicação web:

```
finlyo/
├── frontend/               # Aplicação React (SPA)
│   ├── public/             # Arquivos estáticos
│   └── src/                # Código-fonte React
│       ├── components/     # Componentes reutilizáveis
│       ├── contexts/       # Context API para gerenciamento de estado
│       ├── pages/          # Páginas da aplicação
│       └── services/       # Serviços para comunicação com API
│
├── backend/                # API RESTful em Node.js/Express
│   ├── src/
│   │   ├── controllers/    # Controladores para lógica de negócios
│   │   ├── models/         # Modelos Sequelize
│   │   ├── routes/         # Rotas da API
│   │   ├── middlewares/    # Middlewares para autenticação e validação
│   │   ├── config/         # Configurações do sistema
│   │   └── app.js          # Configuração do Express
│   └── server.js           # Ponto de entrada do servidor
│
└── docker-compose.yml      # Configuração para containerização
```

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js (v16 ou superior)
- MySQL (v8 ou superior)
- npm ou yarn

### Configuração do Backend

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/finlyo.git
   cd finlyo
   ```

2. Configure o ambiente do backend:
   ```bash
   cd backend
   npm install
   ```

3. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env
   # Edite o arquivo .env com suas configurações
   ```

4. Inicie o servidor:
   ```bash
   npm start
   ```

### Configuração do Frontend

1. Em um novo terminal, navegue até o diretório do frontend:
   ```bash
   cd frontend
   npm install
   ```

2. Inicie a aplicação React:
   ```bash
   npm run dev
   ```

3. Acesse a aplicação em seu navegador:
   ```
   http://localhost:3000
   ```

### Usando Docker (Opcional)

Para executar todo o ambiente com Docker:

```bash
docker-compose up -d
```

## 🛣️ Roadmap

- [ ] Importação/exportação de dados
- [x] Suporte a múltiplas moedas
- [ ] Aplicativo móvel nativo
- [ ] Integração com bancos via Open Banking
- [x] Modo offline com sincronização

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Faça commit das alterações (`git commit -m 'Adiciona nova funcionalidade'`)
4. Faça push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob uma [Licença Personalizada](LICENSE.md).

## 👨‍💻 Autor

**Felipe Benedito Rodrigues**

- GitHub: [@AkiraW5](https://github.com/AkiraW5)

---

<div align="center">
  <p>⭐ Se este projeto foi útil para você, considere dar uma estrela! ⭐</p>
  <p>Desenvolvido com ❤️ e ☕</p>
</div>
