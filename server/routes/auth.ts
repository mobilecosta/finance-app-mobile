import { Router, type Request, type Response } from "express";

const router = Router();

interface StoredUser {
  email: string;
  password: string;
  fullName?: string;
  id: string;
}

const users = new Map<string, StoredUser>();

users.set("mobile.costa@gmail.com", {
  email: "mobile.costa@gmail.com",
  password: "30331@Wag",
  fullName: "Mobile Costa",
  id: "1",
});

function getUserFromToken(authHeader: string | undefined): StoredUser | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice("Bearer ".length).trim();
  if (!token.startsWith("test-token-")) return null;
  const email = token.slice("test-token-".length);
  return users.get(email) ?? null;
}

router.post("/signup", (req: Request, res: Response) => {
  const { email, password, fullName } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email e senha são obrigatórios" });
  }
  if (users.has(email)) {
    return res.status(409).json({ error: "Usuário já existe" });
  }
  const id = String(users.size + 1);
  users.set(email, { email, password, fullName, id });
  return res.json({
    token: `test-token-${email}`,
    user: { id, email, user_metadata: { full_name: fullName ?? null } },
  });
});

router.post("/signin", (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email e senha são obrigatórios" });
  }
  const stored = users.get(email);
  if (!stored || stored.password !== password) {
    return res.status(401).json({ error: "Credenciais inválidas" });
  }
  return res.json({
    token: `test-token-${email}`,
    user: {
      id: stored.id,
      email: stored.email,
      user_metadata: { full_name: stored.fullName ?? null },
    },
  });
});

router.post("/signout", (_req: Request, res: Response) => {
  return res.json({ message: "Logged out" });
});

router.get("/user", (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const user = getUserFromToken(authHeader);
  if (!user) {
    return res.status(401).json({ error: "Token inválido ou não fornecido" });
  }
  return res.json({
    id: user.id,
    email: user.email,
    user_metadata: { full_name: user.fullName ?? null },
  });
});

export default router;
