import { getDb } from "../db";
import { accounts, categories, transactions } from "../../drizzle/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import type { Transaction } from "../../drizzle/schema";

// ─── Accounts ───────────────────────────────────────────────────────────────

export async function getAccounts(userId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(accounts).where(eq(accounts.userId, userId));
}

export async function createAccount(userId: string, data: {
  name: string; type: string; balance?: string; color?: string; icon?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(accounts).values({
    userId,
    name: data.name,
    type: data.type,
    balance: data.balance ?? "0",
    color: data.color ?? "#3b82f6",
    icon: data.icon ?? "wallet.pass",
  });
}

export async function updateAccount(id: number, userId: string, data: Partial<{
  name: string; type: string; balance: string; color: string; icon: string;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(accounts).set({ ...data, updatedAt: new Date() }).where(
    and(eq(accounts.id, id), eq(accounts.userId, userId))
  );
}

export async function deleteAccount(id: number, userId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(accounts).where(and(eq(accounts.id, id), eq(accounts.userId, userId)));
}

// ─── Categories ─────────────────────────────────────────────────────────────

export async function getCategories(userId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).where(eq(categories.userId, userId));
}

export async function createCategory(userId: string, data: {
  name: string; type: string; color?: string; icon?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(categories).values({
    userId,
    name: data.name,
    type: data.type,
    color: data.color ?? "#3b82f6",
    icon: data.icon ?? "tag.fill",
  });
}

export async function updateCategory(id: number, userId: string, data: Partial<{
  name: string; type: string; color: string; icon: string;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(categories).set({ ...data, updatedAt: new Date() }).where(
    and(eq(categories.id, id), eq(categories.userId, userId))
  );
}

export async function deleteCategory(id: number, userId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(categories).where(and(eq(categories.id, id), eq(categories.userId, userId)));
}

// ─── Transactions ────────────────────────────────────────────────────────────

export async function getTransactions(userId: string, filters?: {
  type?: string; categoryId?: string; accountId?: string;
  startDate?: string; endDate?: string;
}) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.date));

  if (!filters) return rows;

  return rows.filter((t: Transaction) => {
    if (filters.type && t.type !== filters.type) return false;
    if (filters.categoryId && String(t.categoryId) !== filters.categoryId) return false;
    if (filters.accountId && String(t.accountId) !== filters.accountId) return false;
    if (filters.startDate && t.date < filters.startDate) return false;
    if (filters.endDate && t.date > filters.endDate) return false;
    return true;
  });
}

export async function createTransaction(userId: string, data: {
  accountId: number; categoryId: number; type: string;
  amount: string; description?: string; date: string;
  status?: string; paymentMethod?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(transactions).values({
    userId,
    accountId: data.accountId,
    categoryId: data.categoryId,
    type: data.type,
    amount: data.amount,
    description: data.description,
    date: data.date,
    status: data.status ?? "completed",
    paymentMethod: data.paymentMethod,
  });
}

export async function updateTransaction(id: number, userId: string, data: Partial<{
  amount: string; description: string; status: string; date: string;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(transactions).set({ ...data, updatedAt: new Date() }).where(
    and(eq(transactions.id, id), eq(transactions.userId, userId))
  );
}

export async function deleteTransaction(id: number, userId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export async function getDashboardMetrics(userId: string, startDate: string, endDate: string) {
  const db = await getDb();
  if (!db) return { totalIncome: 0, totalExpense: 0, balance: 0, transactionCount: 0 };

  const rows = await db.select().from(transactions).where(
    and(
      eq(transactions.userId, userId),
      gte(transactions.date, startDate),
      lte(transactions.date, endDate)
    )
  );

  const totalIncome = rows
    .filter((t: Transaction) => t.type === "income")
    .reduce((s: number, t: Transaction) => s + parseFloat(String(t.amount)), 0);
  const totalExpense = rows
    .filter((t: Transaction) => t.type === "expense")
    .reduce((s: number, t: Transaction) => s + parseFloat(String(t.amount)), 0);

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    transactionCount: rows.length,
  };
}

export async function getMonthlyData(userId: string, startDate: string, endDate: string) {
  const db = await getDb();
  if (!db) return [];

  const rows = await db.select().from(transactions).where(
    and(
      eq(transactions.userId, userId),
      gte(transactions.date, startDate),
      lte(transactions.date, endDate)
    )
  );

  const byMonth: Record<string, { income: number; expense: number }> = {};
  for (const t of rows as Transaction[]) {
    const month = t.date.substring(0, 7);
    if (!byMonth[month]) byMonth[month] = { income: 0, expense: 0 };
    const amt = parseFloat(String(t.amount));
    if (t.type === "income") byMonth[month]!.income += amt;
    else byMonth[month]!.expense += amt;
  }

  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, d]) => ({
      month,
      income: d.income,
      expense: d.expense,
      balance: d.income - d.expense,
    }));
}
