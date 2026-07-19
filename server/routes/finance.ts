import { Router, type Request, type Response } from "express";
import * as financeService from "../services/finance.service";

const router = Router();

// Middleware: extrair userId do contexto (Manus auth)
function getUserId(req: Request): string | null {
  const ctx = (req as Request & { ctx?: { user?: { id?: number | string } } }).ctx;
  return ctx?.user?.id?.toString() ?? null;
}

function requireUser(req: Request, res: Response): string | null {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Não autenticado" });
    return null;
  }
  return userId;
}

// ─── Accounts ───────────────────────────────────────────────────────────────

router.get("/accounts", async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  try {
    const data = await financeService.getAccounts(userId);
    res.json(data);
  } catch (e: unknown) {
    res.status(500).json({ error: e instanceof Error ? e.message : "Erro interno" });
  }
});

router.post("/accounts", async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  try {
    const row = await financeService.createAccount(userId, req.body);
    res.status(201).json(row);
  } catch (e: unknown) {
    res.status(500).json({ error: e instanceof Error ? e.message : "Erro interno" });
  }
});

router.put("/accounts/:id", async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  try {
    await financeService.updateAccount(Number(req.params.id), userId, req.body);
    res.json({ success: true });
  } catch (e: unknown) {
    res.status(500).json({ error: e instanceof Error ? e.message : "Erro interno" });
  }
});

router.delete("/accounts/:id", async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  try {
    await financeService.deleteAccount(Number(req.params.id), userId);
    res.json({ success: true });
  } catch (e: unknown) {
    res.status(500).json({ error: e instanceof Error ? e.message : "Erro interno" });
  }
});

// ─── Categories ─────────────────────────────────────────────────────────────

router.get("/categories", async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  try {
    const data = await financeService.getCategories(userId);
    res.json(data);
  } catch (e: unknown) {
    res.status(500).json({ error: e instanceof Error ? e.message : "Erro interno" });
  }
});

router.post("/categories", async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  try {
    const row = await financeService.createCategory(userId, req.body);
    res.status(201).json(row);
  } catch (e: unknown) {
    res.status(500).json({ error: e instanceof Error ? e.message : "Erro interno" });
  }
});

router.put("/categories/:id", async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  try {
    await financeService.updateCategory(Number(req.params.id), userId, req.body);
    res.json({ success: true });
  } catch (e: unknown) {
    res.status(500).json({ error: e instanceof Error ? e.message : "Erro interno" });
  }
});

router.delete("/categories/:id", async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  try {
    await financeService.deleteCategory(Number(req.params.id), userId);
    res.json({ success: true });
  } catch (e: unknown) {
    res.status(500).json({ error: e instanceof Error ? e.message : "Erro interno" });
  }
});

// ─── Transactions ────────────────────────────────────────────────────────────

router.get("/transactions", async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  try {
    const { type, categoryId, accountId, startDate, endDate } = req.query as Record<string, string>;
    const data = await financeService.getTransactions(userId, { type, categoryId, accountId, startDate, endDate });
    res.json(data);
  } catch (e: unknown) {
    res.status(500).json({ error: e instanceof Error ? e.message : "Erro interno" });
  }
});

router.post("/transactions", async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  try {
    const { accountId, categoryId, type, amount, description, date, status, paymentMethod } = req.body;
    if (!accountId || !categoryId || !type || !amount || !date) {
      return res.status(400).json({ error: "accountId, categoryId, type, amount e date são obrigatórios" });
    }
    const row = await financeService.createTransaction(userId, {
      accountId: Number(accountId), categoryId: Number(categoryId),
      type, amount: String(amount), description, date, status, paymentMethod,
    });
    res.status(201).json(row);
  } catch (e: unknown) {
    res.status(500).json({ error: e instanceof Error ? e.message : "Erro interno" });
  }
});

router.put("/transactions/:id", async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  try {
    const { amount, description, status, date } = req.body;
    await financeService.updateTransaction(Number(req.params.id), userId, {
      amount: amount ? String(amount) : undefined, description, status, date,
    });
    res.json({ success: true });
  } catch (e: unknown) {
    res.status(500).json({ error: e instanceof Error ? e.message : "Erro interno" });
  }
});

router.delete("/transactions/:id", async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  try {
    await financeService.deleteTransaction(Number(req.params.id), userId);
    res.json({ success: true });
  } catch (e: unknown) {
    res.status(500).json({ error: e instanceof Error ? e.message : "Erro interno" });
  }
});

// ─── Dashboard ───────────────────────────────────────────────────────────────

function getPeriodRange(period?: string): { startDate: string; endDate: string } {
  const now = new Date();
  let start: Date;
  let end: Date = now;

  switch (period) {
    case "quarter":
      start = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      break;
    case "year":
      start = new Date(now.getFullYear(), 0, 1);
      break;
    case "month":
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
  }

  return {
    startDate: start.toISOString().split("T")[0]!,
    endDate: end.toISOString().split("T")[0]!,
  };
}

router.get("/dashboard/metrics", async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  try {
    const { startDate, endDate, period } = req.query as Record<string, string>;
    const range = period ? getPeriodRange(period) : { startDate, endDate };
    if (!range.startDate || !range.endDate) return res.status(400).json({ error: "startDate e endDate são obrigatórios" });
    const data = await financeService.getDashboardMetrics(userId, range.startDate, range.endDate);
    res.json(data);
  } catch (e: unknown) {
    res.status(500).json({ error: e instanceof Error ? e.message : "Erro interno" });
  }
});

router.get("/dashboard/monthly", async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  try {
    const { startDate, endDate, period } = req.query as Record<string, string>;
    const range = period ? getPeriodRange(period) : { startDate, endDate };
    if (!range.startDate || !range.endDate) return res.status(400).json({ error: "startDate e endDate são obrigatórios" });
    const data = await financeService.getMonthlyData(userId, range.startDate, range.endDate);
    res.json(data);
  } catch (e: unknown) {
    res.status(500).json({ error: e instanceof Error ? e.message : "Erro interno" });
  }
});

export default router;

