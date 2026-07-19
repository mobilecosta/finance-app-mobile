# Finance Pro Mobile 💰

Um aplicativo de gestão financeira pessoal moderno e elegante, desenvolvido com **Expo React Native** e **TypeScript**. Oferece uma experiência premium com tema escuro, autenticação segura e CRUD completo de transações.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.81-green.svg)
![Expo](https://img.shields.io/badge/Expo-54-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)

## 🎯 Visão Geral

**Finance Pro** é um aplicativo mobile que permite aos usuários gerenciar suas finanças pessoais de forma intuitiva e segura. Recentemente, o projeto foi reestruturado para separar o frontend do backend, permitindo maior escalabilidade e facilidade de manutenção.

- 📊 Dashboard com métricas de saldo, receitas e despesas
- 💳 Gerenciamento de contas e categorias
- 📝 CRUD completo de transações
- 🔐 Autenticação segura com e-mail/senha
- 📱 Interface responsiva e otimizada para mobile
- 🎨 Tema escuro premium com paleta azul/cyan

## 🏗️ Arquitetura do Sistema

O projeto agora está dividido em dois repositórios principais:

1.  **Frontend (Este repositório):** Desenvolvido em React Native/Expo.
2.  **Backend:** Desenvolvido em Express + Prisma + Supabase.
    - Repositório: [finance-backend](https://github.com/mobilecosta/finance-backend)

## 🚀 Stack Tecnológico

### Frontend (Mobile)
- **React Native 0.81** — Framework para desenvolvimento mobile nativo
- **Expo SDK 54** — Plataforma para desenvolvimento e distribuição
- **Expo Router 6** — Roteamento e navegação
- **NativeWind 4** — Tailwind CSS para React Native
- **React Query** — Gerenciamento de estado de servidor
- **Lucide React Native** — Ícones modernos

### Backend (API)
- **Node.js & Express** — Servidor de API REST
- **Prisma ORM** — Mapeamento objeto-relacional e gerenciamento de banco de dados
- **Supabase (PostgreSQL)** — Banco de dados relacional na nuvem
- **TypeScript** — Tipagem estática em todo o backend

## 🛠️ Configuração e Instalação

### 1. Clonar os Repositórios

```bash
# Frontend
git clone https://github.com/mobilecosta/finance-app-mobile.git

# Backend
git clone https://github.com/mobilecosta/finance-backend.git
```

### 2. Configurar o Backend

Navegue até o diretório do backend, instale as dependências e configure o `.env`:

```bash
cd finance-backend
pnpm install
# Configure seu DATABASE_URL do Supabase no arquivo .env
npx prisma db push
pnpm dev
```

### 3. Configurar o Frontend

Navegue até o diretório do frontend e instale as dependências:

```bash
cd finance-app-mobile
pnpm install
```

Certifique-se de que o `EXPO_PUBLIC_API_URL` no arquivo `.env` aponte para o endereço do backend:

```env
EXPO_PUBLIC_API_URL=https://finance-backend-mobile.vercel.app/
```

> Para desenvolvimento local, use: `EXPO_PUBLIC_API_URL=http://localhost:3000`

### 4. Iniciar o App

```bash
# Iniciar servidor backend local (necessário para autenticação e API)
pnpm dev:server

# Em outro terminal, iniciar o app (web)
pnpm dev:metro

# Ou inicie ambos simultaneamente
pnpm dev
```

> Para testar o login local, use as credenciais: `mobile.costa@gmail.com` / `30331@Wag`

## 📁 Estrutura do Projeto (Frontend)

```
finance-app-mobile/
├── app/                          # Rotas e telas (Expo Router)
├── components/                   # Componentes reutilizáveis
├── contexts/                     # Contextos (Auth, etc.)
├── hooks/                        # Hooks customizados
├── lib/                          
│   └── finance-api.ts           # Cliente de consumo da API Express
├── constants/                    # Constantes e temas
├── server/                       # Servidor backend local
│   ├── _core/                    # Core do servidor (OAuth, tRPC)
│   ├── routes/
│   │   ├── finance.ts           # Rotas financeiras (/api/finance/*)
│   │   └── auth.ts              # Rotas de autenticação (/api/auth/*)
│   └── services/                 # Lógica de negócio
├── assets/                       # Imagens e fontes
└── drizzle/                      # Schema do banco (Drizzle ORM)
```

## 🔌 API Endpoints

O frontend consome a API REST através do cliente em `lib/finance-api.ts`. Por padrão, o `EXPO_PUBLIC_API_URL` aponta para o backend hospedado em produção. Para desenvolvimento local, altere para `http://localhost:3000`.

**Endpoints de autenticação** (`/api/auth/*`) são públicos. **Endpoints financeiros** (`/api/finance/*`) exigem `Authorization: Bearer <token>`.

### Autenticação (`/api/auth`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/signup` | Cria um novo usuário |
| POST | `/api/auth/signin` | Autentica e retorna token + user |
| POST | `/api/auth/signout` | Encerra sessão |
| GET | `/api/auth/user` | Retorna dados do usuário logado |

```json
// POST /api/auth/signin
// Request: { "email": "user@email.com", "password": "123456" }
// Response: { "token": "jwt...", "user": { "id": "uuid", "email": "...", "name": "..." } }
```

### Contas (`/api/finance/accounts`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/finance/accounts` | Lista todas as contas do usuário |
| POST | `/api/finance/accounts` | Cria nova conta |
| PUT | `/api/finance/accounts/:id` | Atualiza conta |
| DELETE | `/api/finance/accounts/:id` | Remove conta |

```json
// POST /api/finance/accounts
// Request: { "name": "Conta Corrente", "type": "checking", "balance": 1000 }
// Response: { "id": 1, "name": "Conta Corrente", "type": "checking", "balance": "1000.00", "color": "#3b82f6", ... }
```

### Categorias (`/api/finance/categories`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/finance/categories` | Lista todas as categorias |
| POST | `/api/finance/categories` | Cria nova categoria |
| PUT | `/api/finance/categories/:id` | Atualiza categoria |
| DELETE | `/api/finance/categories/:id` | Remove categoria |

```json
// POST /api/finance/categories
// Request: { "name": "Alimentação", "type": "expense", "color": "#10b981" }
// Response: { "id": 1, "name": "Alimentação", "type": "expense", "color": "#10b981", ... }
```

### Transações (`/api/finance/transactions`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/finance/transactions` | Lista transações |
| POST | `/api/finance/transactions` | Cria transação (atualiza saldo da conta) |
| PUT | `/api/finance/transactions/:id` | Atualiza transação (ajusta saldo) |
| DELETE | `/api/finance/transactions/:id` | Remove transação (reverte saldo) |

```json
// POST /api/finance/transactions
// Request: { "accountId": 1, "categoryId": 1, "type": "expense", "amount": 150.00, "description": "Mercado", "date": "2026-07-19", "status": "completed" }
// Response: { "id": 1, "type": "expense", "amount": "150.00", "description": "Mercado", "category": {...}, "account": {...} }
```

### Dashboard (`/api/finance/dashboard/metrics`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/finance/dashboard/metrics?period=month` | Métricas do dashboard |

```json
// Response: { "totalBalance": 5000, "totalIncome": 10000, "totalExpense": 5000, "transactionCount": 42, "monthlyData": [...], "categoryDistribution": [...], "recentTransactions": [...] }
```

### Autenticação

Requisições às rotas `/api/finance/*` exigem o header:
```
Authorization: Bearer <token_jwt>
```

O token é obtido no login/cadastro (`/api/auth/signin`) e armazenado automaticamente via `lib/_core/auth.ts`. O cliente em `lib/finance-api.ts` lê o token e o envia em todas as chamadas para `/api/finance/*`.

> A rota de auth (`/api/auth/*`) utiiza o prefixo `/api` enquanto as rotas financeiras utilizam `/api/finance`.

## 🧪 Testes

Para executar testes unitários e de integração:

```bash
pnpm test
```

## 📦 Build & Deploy

Para gerar o APK/IPA do aplicativo, utilize o EAS CLI da Expo:

```bash
eas build --platform android --local
eas build --platform ios --local
```

---
Desenvolvido por [mobilecosta](https://github.com/mobilecosta)
