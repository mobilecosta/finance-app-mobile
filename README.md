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

Certifique-se de que o `EXPO_PUBLIC_API_URL` no seu ambiente ou no arquivo `lib/finance-api.ts` aponta para o endereço do seu backend (padrão: `http://localhost:3000`).

### 4. Iniciar o App

```bash
pnpm dev:metro
```

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
└── assets/                       # Imagens e fontes
```

## 🔌 Integração com API

O frontend consome a API através do cliente centralizado em `lib/finance-api.ts`. Os endpoints principais incluem:

- `GET /api/finance/dashboard`: Resumo financeiro do usuário.
- `GET /api/finance/transactions`: Listagem de transações.
- `POST /api/finance/transactions`: Criação de novos registros.

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
