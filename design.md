# Finance Pro Mobile — Design Document

## Concept
Aplicativo de gestão financeira pessoal com tema escuro premium, inspirado no projeto finance-app-angular. Design elegante com paleta azul/cyan sobre fundo slate escuro.

## Color Palette
- **Primary**: Azul (#3b82f6) — ações principais, botões, destaques
- **Secondary/Tint**: Cyan (#06b6d4) — elementos secundários
- **Success**: Verde (#10b981) — receitas, saldo positivo
- **Error**: Vermelho (#ef4444) — despesas, saldo negativo
- **Warning**: Amarelo (#f59e0b) — pendente, alertas
- **Background**: Slate escuro (#0f172a)
- **Surface**: Slate médio (#1e293b) — cards
- **Border**: (#334155)
- **Foreground**: (#f1f5f9) — texto principal
- **Muted**: (#94a3b8) — texto secundário

## Screen List
1. **Login** — Autenticação com email/senha e cadastro
2. **Dashboard (Home Tab)** — Cards de resumo + gráficos mensais
3. **Transactions Tab** — Lista de transações com filtros e CRUD
4. **Profile Tab** — Informações do usuário e logout

## Key User Flows
- **Login**: Tela de login → preenche email/senha → Dashboard
- **Cadastro**: Tela de login → "Criar conta" → preenche dados → Dashboard
- **Nova Transação**: Tab Transações → botão "+" → Modal com form → salva → lista atualizada
- **Editar Transação**: Lista → toca item → Modal de edição → salva
- **Deletar Transação**: Lista → swipe ou botão delete → confirmação → remove
- **Logout**: Tab Perfil → botão Sair → tela de Login

## Navigation Structure
```
app/
  _layout.tsx          ← Root com AuthProvider
  (auth)/
    login.tsx          ← Tela de login/cadastro
  (tabs)/
    _layout.tsx        ← Tab bar (Dashboard, Transações, Perfil)
    index.tsx          ← Dashboard
    transactions.tsx   ← Transações
    profile.tsx        ← Perfil
```

## Primary Content per Screen

### Dashboard
- Header com saudação e nome do usuário
- Cards de métricas: Saldo Total, Receitas, Despesas, Nº Transações
- Gráfico de barras: Receitas vs Despesas (últimos 6 meses)
- Lista das últimas 5 transações

### Transactions
- Barra de busca + filtros (tipo, período)
- FlatList de transações com ícone de categoria, valor, data, status
- FAB (Floating Action Button) para nova transação
- Modal de formulário: tipo, valor, descrição, data, categoria, conta, status

### Profile
- Avatar com iniciais do usuário
- Email e nome
- Botão de logout
- Informações do app (versão)
