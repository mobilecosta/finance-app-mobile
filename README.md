# Finance Pro Mobile 💰

Um aplicativo de gestão financeira pessoal moderno e elegante, desenvolvido com **Expo React Native** e **TypeScript**. Oferece uma experiência premium com tema escuro, autenticação segura e CRUD completo de transações.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.81-green.svg)
![Expo](https://img.shields.io/badge/Expo-54-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)

## 🎯 Visão Geral

**Finance Pro** é um aplicativo mobile que permite aos usuários gerenciar suas finanças pessoais de forma intuitiva e segura. Com um design premium em tema escuro, o app oferece:

- 📊 Dashboard com métricas de saldo, receitas e despesas
- 💳 Gerenciamento de contas e categorias
- 📝 CRUD completo de transações
- 🔐 Autenticação segura com email/senha
- 📱 Interface responsiva e otimizada para mobile
- 🎨 Tema escuro premium com paleta azul/cyan

## 🚀 Stack Tecnológico

### Frontend
- **React Native 0.81** — Framework para desenvolvimento mobile nativo
- **Expo SDK 54** — Plataforma para desenvolvimento e distribuição
- **Expo Router 6** — Roteamento e navegação
- **TypeScript 5.9** — Tipagem estática
- **NativeWind 4** — Tailwind CSS para React Native
- **React Query** — Gerenciamento de estado de servidor
- **React Hook Form** — Gerenciamento de formulários

### Backend
- **Express.js** — Framework Node.js
- **Drizzle ORM** — ORM type-safe
- **MySQL** — Banco de dados relacional
- **tRPC** — RPC type-safe entre cliente e servidor

### Autenticação & Segurança
- **Manus OAuth** — Autenticação segura
- **JWT** — Token-based authentication
- **Expo Secure Store** — Armazenamento seguro de credenciais

## 📋 Requisitos

- **Node.js** 18+ e **pnpm** 9+
- **Expo CLI** instalado globalmente
- **MySQL** 5.7+ (para desenvolvimento local)
- **Dispositivo iOS/Android** ou emulador

## 🛠️ Instalação

### 1. Clonar o repositório

```bash
git clone https://github.com/mobilecosta/finance-app-mobile.git
cd finance-app-mobile
```

### 2. Instalar dependências

```bash
pnpm install
```

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Servidor
DATABASE_URL=mysql://user:password@localhost:3306/finance_app
NODE_ENV=development
PORT=3000

# Manus (Opcional)
MANUS_API_URL=https://api.manus.im
```

### 4. Executar migrações do banco de dados

```bash
pnpm db:push
```

### 5. Iniciar o servidor de desenvolvimento

```bash
pnpm dev
```

Este comando inicia:
- **Metro Bundler** (porta 8081) — Bundler React Native
- **Express Server** (porta 3000) — Backend API

### 6. Abrir o app no Expo Go

No seu dispositivo ou emulador:
- **iOS**: Abra Expo Go e escaneie o QR code exibido no terminal
- **Android**: Abra Expo Go e escaneie o QR code
- **Web**: Acesse `http://localhost:8081` no navegador

## 📁 Estrutura do Projeto

```
finance-app-mobile/
├── app/                          # Rotas e telas (Expo Router)
│   ├── (auth)/
│   │   └── login.tsx            # Tela de login/cadastro
│   ├── (tabs)/
│   │   ├── index.tsx            # Dashboard
│   │   ├── transactions.tsx     # Tela de transações
│   │   ├── profile.tsx          # Tela de perfil
│   │   └── _layout.tsx          # Tab bar layout
│   ├── _layout.tsx              # Root layout com providers
│   └── oauth/
│       └── callback.tsx         # OAuth callback
├── components/                   # Componentes reutilizáveis
│   ├── screen-container.tsx     # SafeArea wrapper
│   ├── themed-view.tsx          # View com tema
│   └── ui/
│       └── icon-symbol.tsx      # Mapeamento de ícones
├── contexts/                     # React Context
│   └── auth-context.tsx         # Contexto de autenticação
├── lib/                          # Utilitários e hooks
│   ├── finance-api.ts           # Cliente de API Finance
│   ├── trpc.ts                  # Cliente tRPC
│   ├── theme-provider.tsx       # Provedor de tema
│   └── utils.ts                 # Funções utilitárias
├── server/                       # Backend Express
│   ├── _core/
│   │   ├── index.ts             # Entrada do servidor
│   │   ├── context.ts           # Contexto tRPC
│   │   ├── auth.ts              # Autenticação
│   │   └── env.ts               # Variáveis de ambiente
│   ├── routes/
│   │   └── finance.ts           # Rotas de Finance
│   ├── services/
│   │   └── finance.service.ts   # Lógica de negócio
│   └── db.ts                    # Conexão com banco
├── drizzle/                      # Schema e migrações
│   ├── schema.ts                # Definição de tabelas
│   └── migrations/              # Arquivos SQL de migração
├── assets/                       # Imagens e ícones
├── theme.config.js              # Configuração de tema
├── app.config.ts                # Configuração do Expo
├── tailwind.config.js           # Configuração Tailwind
└── package.json                 # Dependências do projeto
```

## 🎨 Design & Tema

O projeto utiliza um tema escuro premium com paleta de cores finance:

| Token | Cor | Uso |
|-------|-----|-----|
| **primary** | #3b82f6 (Azul) | Botões, ações principais |
| **background** | #0f172a (Slate escuro) | Fundo de telas |
| **surface** | #1e293b (Slate médio) | Cards, superfícies |
| **foreground** | #f1f5f9 (Cinza claro) | Texto principal |
| **success** | #10b981 (Verde) | Receitas, saldo positivo |
| **error** | #ef4444 (Vermelho) | Despesas, saldo negativo |
| **warning** | #f59e0b (Amarelo) | Pendente, alertas |

## 📱 Telas Principais

### 1. **Login** (`app/(auth)/login.tsx`)
- Autenticação com email/senha
- Cadastro de novos usuários
- Validação de formulário
- Feedback de erros

### 2. **Dashboard** (`app/(tabs)/index.tsx`)
- Saudação personalizada
- Card de saldo do mês
- Cards de métricas (receitas, despesas, transações, saldo)
- Lista das 5 transações mais recentes
- Pull-to-refresh

### 3. **Transações** (`app/(tabs)/transactions.tsx`)
- Lista completa de transações
- Busca por descrição/categoria
- Filtros por tipo (receita/despesa)
- Modal de CRUD (criar, editar, deletar)
- Seleção de categoria, conta e status
- Confirmação de exclusão

### 4. **Perfil** (`app/(tabs)/profile.tsx`)
- Exibição de dados do usuário
- Avatar com iniciais
- Informações de conta
- Versão do app
- Botão de logout com confirmação

## 🔌 API Finance

O servidor Express fornece endpoints RESTful para gerenciar finanças:

### Autenticação
```
POST   /api/auth/signup         # Criar nova conta
POST   /api/auth/signin         # Fazer login
POST   /api/auth/signout        # Fazer logout
GET    /api/auth/user           # Obter usuário autenticado
```

### Contas
```
GET    /api/accounts            # Listar contas do usuário
POST   /api/accounts            # Criar nova conta
PUT    /api/accounts/:id        # Atualizar conta
DELETE /api/accounts/:id        # Deletar conta
```

### Categorias
```
GET    /api/categories          # Listar categorias
POST   /api/categories          # Criar nova categoria
PUT    /api/categories/:id      # Atualizar categoria
DELETE /api/categories/:id      # Deletar categoria
```

### Transações
```
GET    /api/transactions        # Listar transações (com filtros)
POST   /api/transactions        # Criar nova transação
PUT    /api/transactions/:id    # Atualizar transação
DELETE /api/transactions/:id    # Deletar transação
```

### Dashboard
```
GET    /api/dashboard/metrics   # Métricas do período
GET    /api/dashboard/monthly   # Dados mensais
```

## 🗄️ Schema do Banco de Dados

### Tabela: `users`
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openId VARCHAR(64) UNIQUE NOT NULL,
  name TEXT,
  email VARCHAR(320),
  loginMethod VARCHAR(64),
  role ENUM('user', 'admin') DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: `accounts`
```sql
CREATE TABLE accounts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId VARCHAR(64) NOT NULL,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(30) DEFAULT 'checking',
  balance DECIMAL(12, 2) DEFAULT 0,
  color VARCHAR(20) DEFAULT '#3b82f6',
  icon VARCHAR(50) DEFAULT 'wallet.pass',
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Tabela: `categories`
```sql
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId VARCHAR(64) NOT NULL,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) DEFAULT 'expense',
  color VARCHAR(20) DEFAULT '#3b82f6',
  icon VARCHAR(50) DEFAULT 'tag.fill',
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Tabela: `transactions`
```sql
CREATE TABLE transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId VARCHAR(64) NOT NULL,
  accountId INT NOT NULL,
  categoryId INT NOT NULL,
  type VARCHAR(20) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  description TEXT,
  date VARCHAR(10) NOT NULL,
  status VARCHAR(20) DEFAULT 'completed',
  paymentMethod VARCHAR(50),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🔐 Autenticação

O app utiliza **Manus OAuth** para autenticação segura:

1. **Signup**: Usuário cria conta com email/senha
2. **Signin**: Usuário faz login com credenciais
3. **Token**: Servidor retorna JWT token
4. **Storage**: Token armazenado seguramente com `Expo Secure Store`
5. **Requests**: Token incluído em headers de requisições autenticadas

### AuthContext

O contexto `AuthContext` gerencia o estado de autenticação:

```typescript
interface AuthContextType {
  user: FinanceUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  signin: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, fullName?: string) => Promise<boolean>;
  signout: () => Promise<void>;
  error: string | null;
}
```

## 🎯 Fluxos de Usuário

### Fluxo de Login
```
Usuário → Tela Login → Email/Senha → AuthContext.signin() → API /auth/signin → Token → Dashboard
```

### Fluxo de Cadastro
```
Usuário → Tela Login (toggle) → Nome/Email/Senha → AuthContext.signup() → API /auth/signup → Token → Dashboard
```

### Fluxo de Nova Transação
```
Dashboard/Transações → Botão "+" → Modal Form → Selecionar Categoria/Conta → Confirmar → API POST /transactions → Atualizar Lista
```

### Fluxo de Editar Transação
```
Lista Transações → Tap Item → Modal Form (preenchido) → Editar Dados → Confirmar → API PUT /transactions/:id → Atualizar Lista
```

### Fluxo de Deletar Transação
```
Lista Transações → Botão Delete → Confirmação → API DELETE /transactions/:id → Remover da Lista
```

## 🧪 Testes

Para executar testes:

```bash
pnpm test
```

Testes incluem:
- Autenticação (login, cadastro, logout)
- CRUD de transações
- Validação de formulários
- Cálculo de métricas

## 📦 Build & Deploy

### Build para iOS

```bash
eas build --platform ios
```

### Build para Android

```bash
eas build --platform android
```

### Build Local (APK)

```bash
eas build --platform android --local
```

### Publicar no Manus

1. Clique no botão **Publish** na Management UI
2. Aguarde o build ser gerado
3. Escaneie o QR code para testar
4. Distribua o APK/IPA conforme necessário

## 🐛 Troubleshooting

### Erro: "Database not available"
- Verifique se MySQL está rodando
- Confirme `DATABASE_URL` em `.env`
- Execute `pnpm db:push` para criar tabelas

### Erro: "Cannot find module"
- Execute `pnpm install` novamente
- Limpe cache: `rm -rf node_modules && pnpm install`

### Erro: "Metro bundler not responding"
- Reinicie o servidor: `pnpm dev`
- Limpe cache: `pnpm dev -- --reset-cache`

### App não conecta ao backend
- Verifique se servidor está rodando (porta 3000)
- Confirme `BASE_URL` em `lib/finance-api.ts`
- Teste endpoint: `curl http://localhost:3000/api/health`

## 📚 Recursos Adicionais

- [Expo Documentation](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [NativeWind](https://www.nativewind.dev)
- [Drizzle ORM](https://orm.drizzle.team)
- [tRPC](https://trpc.io)

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

**mobilecosta** — Desenvolvedor Full Stack

- GitHub: [@mobilecosta](https://github.com/mobilecosta)
- Repositório: [finance-app-mobile](https://github.com/mobilecosta/finance-app-mobile)

## 🙏 Agradecimentos

- Expo team pela excelente plataforma
- React Native community
- Manus platform por infraestrutura e deployment

---

**Desenvolvido com ❤️ usando Expo React Native**
