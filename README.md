# Controle Financeiro

Este projeto é uma aplicação de controle financeiro que permite aos usuários gerenciar suas finanças pessoais de forma eficiente. A aplicação é dividida em duas partes principais: o frontend e o backend.

## Estrutura do Projeto

- **frontend/**: Contém a interface do usuário da aplicação.
  - **public/**: Arquivos públicos acessíveis, incluindo o HTML principal, CSS e JavaScript.
    - **index.html**: Página principal da aplicação.
    - **css/**: Contém os estilos CSS.
    - **js/**: Contém a lógica JavaScript.
  - **src/**: Contém os componentes React e serviços.
    - **components/**: Componentes da interface do usuário, como Dashboard, Transactions, Budgets, Categories e Reports.
    - **services/**: Serviços para interagir com a API do backend e gerenciar autenticação.

- **backend/**: Contém a lógica do servidor e a API.
  - **src/**: Código-fonte do backend.
    - **controllers/**: Controladores que gerenciam a lógica de negócios para usuários, transações, categorias e orçamentos.
    - **models/**: Modelos de dados que definem a estrutura dos dados no banco de dados.
    - **routes/**: Rotas que conectam as requisições HTTP aos controladores correspondentes.
    - **middlewares/**: Middleware para autenticação e validação de dados.
    - **config/**: Configurações do banco de dados e variáveis de ambiente.
    - **app.js**: Ponto de entrada do backend, configurando o aplicativo Express.

## Instalação

1. Clone o repositório:
   ```
   git clone <URL_DO_REPOSITORIO>
   ```

2. Navegue até o diretório do frontend e instale as dependências:
   ```
   cd controle-financeiro/frontend
   npm install
   ```

3. Navegue até o diretório do backend e instale as dependências:
   ```
   cd ../backend
   npm install
   ```

4. Configure as variáveis de ambiente no arquivo `.env` no diretório do backend.

5. Inicie o servidor backend:
   ```
   npm start
   ```

6. Inicie o frontend:
   ```
   cd ../frontend
   npm start
   ```

## Uso

Após iniciar o servidor, você pode acessar a aplicação no navegador em `http://localhost:3000`. A partir daí, você pode registrar-se, fazer login e começar a gerenciar suas finanças.

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## Licença

Este projeto está licenciado sob a MIT License.