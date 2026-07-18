import { Platform } from "react-native";

const getBaseUrl = () => {
  if (Platform.OS === "web") return "";
  // Para dispositivos físicos/emuladores, usar o IP do servidor
  return process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";
};

export const BASE_URL = getBaseUrl();

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface FinanceUser {
  id: string;
  email: string;
  user_metadata?: { full_name?: string };
}

export interface Account {
  id: string;
  name: string;
  type: string;
  balance: string;
  color: string;
  icon: string;
}

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string;
}

export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: string;
  description: string;
  date: string;
  status: "pending" | "completed" | "cancelled";
  categoryId: string;
  accountId: string;
  categories?: { id: string; name: string; color: string; icon: string };
  accounts?: { id: string; name: string; color: string };
}

export interface DashboardMetrics {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export interface CategoryData {
  id: string;
  name: string;
  color: string;
  total: number;
  count: number;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  // Ajustado para o novo prefixo /api/finance do backend Express
  const url = `${BASE_URL}/api/finance${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
    credentials: "include",
    ...options,
  });
  const data = await res.json();
  return data as T;
}

// Auth
export const authApi = {
  signup: (email: string, password: string, fullName?: string) =>
    request<ApiResponse<{ user: FinanceUser }>>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, fullName }),
    }),
  signin: (email: string, password: string) =>
    request<ApiResponse<{ user: FinanceUser }>>("/auth/signin", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  signout: () =>
    request<ApiResponse>("/auth/signout", { method: "POST" }),
  getCurrentUser: () =>
    request<ApiResponse<FinanceUser>>("/auth/user"),
};

// Accounts
export const accountsApi = {
  getAll: (userId: string) => request<Account[]>(`/accounts?userId=${userId}`),
  create: (data: Omit<Account, "id"> & { userId: string }) =>
    request<Account>("/accounts", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Account>) =>
    request<Account>(`/accounts/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<{ success: boolean }>(`/accounts/${id}`, { method: "DELETE" }),
};

// Categories
export const categoriesApi = {
  getAll: (userId: string) => request<Category[]>(`/categories?userId=${userId}`),
  create: (data: Omit<Category, "id"> & { userId: string }) =>
    request<Category>("/categories", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Category>) =>
    request<Category>(`/categories/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<{ success: boolean }>(`/categories/${id}`, { method: "DELETE" }),
};

// Transactions
export const transactionsApi = {
  getAll: (userId: string, params?: Record<string, string>) => {
    const queryParams = { ...params, userId };
    const qs = "?" + new URLSearchParams(queryParams).toString();
    return request<Transaction[]>(`/transactions${qs}`);
  },
  create: (data: Omit<Transaction, "id" | "categories" | "accounts"> & { userId: string }) =>
    request<Transaction>("/transactions", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Transaction>) =>
    request<Transaction>(`/transactions/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<{ success: boolean }>(`/transactions/${id}`, { method: "DELETE" }),
};

// Dashboard
export const dashboardApi = {
  getDashboard: (userId: string) =>
    request<any>(`/dashboard?userId=${userId}`),
  getMetrics: (userId: string, startDate: string, endDate: string) =>
    request<DashboardMetrics>(`/dashboard/metrics?userId=${userId}&startDate=${startDate}&endDate=${endDate}`),
  getMonthly: (userId: string, startDate: string, endDate: string) =>
    request<MonthlyData[]>(`/dashboard/monthly?userId=${userId}&startDate=${startDate}&endDate=${endDate}`),
  getByCategory: (userId: string, startDate: string, endDate: string, type?: string) => {
    const params = new URLSearchParams({ userId, startDate, endDate });
    if (type) params.append("type", type);
    return request<CategoryData[]>(`/dashboard/by-category?${params.toString()}`);
  },
};
