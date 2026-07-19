import { Platform } from "react-native";
import { getSessionToken } from "./_core/auth";

const getBaseUrl = () => {
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
  id: number;
  name: string;
  type: string;
  balance: string;
  color: string;
  icon: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface Category {
  id: number;
  name: string;
  type: "income" | "expense" | "both";
  color: string;
  icon: string;
  isActive?: boolean;
}

export interface Transaction {
  id: number;
  type: "income" | "expense";
  amount: string;
  description: string;
  date: string;
  status: "pending" | "completed" | "cancelled";
  categoryId: number;
  accountId: number;
  categories?: { id: number; name: string; color: string; icon: string };
  accounts?: { id: number; name: string; color: string };
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
  category: string;
  amount: number;
  percentage: number;
}

async function request<T>(path: string, options?: RequestInit & { prefix?: string }): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options?.headers as Record<string, string>) || {}),
  };

  if (Platform.OS !== "web") {
    const token = await getSessionToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const prefix = options?.prefix ?? "/api/finance";
  const url = `${BASE_URL}${prefix}${path}`;
  const res = await fetch(url, { headers, ...options });

  if (!res.ok) {
    const text = await res.text();
    let msg = text;
    try {
      const json = JSON.parse(text);
      msg = json.message || json.error || text;
    } catch {}
    throw new Error(msg);
  }

  const contentType = res.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return res.json() as Promise<T>;
  }
  return res.text() as unknown as Promise<T>;
}

// Auth
export const authApi = {
  signup: (email: string, password: string, fullName?: string) =>
    request<{ token: string; user: FinanceUser }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, fullName }),
      prefix: "/api",
    }),
  signin: (email: string, password: string) =>
    request<{ token: string; user: FinanceUser }>("/auth/signin", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      prefix: "/api",
    }),
  signout: () =>
    request<{ message: string }>("/auth/signout", { method: "POST", prefix: "/api" }),
  getCurrentUser: () =>
    request<FinanceUser>("/auth/user", { prefix: "/api" }),
};

// Accounts
export const accountsApi = {
  getAll: () => request<Account[]>("/accounts"),
  create: (data: { name: string; type?: string; balance?: number; color?: string; icon?: string }) =>
    request<Account>("/accounts", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Account>) =>
    request<Account>(`/accounts/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<{ message: string }>(`/accounts/${id}`, { method: "DELETE" }),
};

// Categories
export const categoriesApi = {
  getAll: () => request<Category[]>("/categories"),
  create: (data: { name: string; type?: string; color?: string; icon?: string }) =>
    request<Category>("/categories", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Category>) =>
    request<Category>(`/categories/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<{ message: string }>(`/categories/${id}`, { method: "DELETE" }),
};

// Transactions
export const transactionsApi = {
  getAll: (params?: Record<string, string>) => {
    if (!params || Object.keys(params).length === 0) return request<Transaction[]>("/transactions");
    const qs = "?" + new URLSearchParams(params).toString();
    return request<Transaction[]>(`/transactions${qs}`);
  },
  create: (data: { type: string; amount: string; description?: string; date: string; status?: string; categoryId: number; accountId: number }) =>
    request<Transaction>("/transactions", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Transaction>) =>
    request<Transaction>(`/transactions/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<{ message: string }>(`/transactions/${id}`, { method: "DELETE" }),
};

// Dashboard
export const dashboardApi = {
  getMetrics: (period?: "month" | "quarter" | "year") =>
    request<DashboardMetrics>(`/dashboard/metrics${period ? `?period=${period}` : ""}`),
};
