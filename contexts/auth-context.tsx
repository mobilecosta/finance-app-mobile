import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi, type FinanceUser } from "@/lib/finance-api";
import { setSessionToken, removeSessionToken } from "@/lib/_core/auth";

interface AuthContextType {
  user: FinanceUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  signin: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, fullName?: string) => Promise<boolean>;
  signout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FinanceUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const userData = await authApi.getCurrentUser();
        setUser(userData);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const signin = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      setLoading(true);
      const result = await authApi.signin(email, password);
      if (result.token) {
        await setSessionToken(result.token);
      }
      if (result.user) {
        setUser(result.user);
        return true;
      }
      return false;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Falha ao entrar");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, fullName?: string): Promise<boolean> => {
    try {
      setError(null);
      setLoading(true);
      const result = await authApi.signup(email, password, fullName);
      if (result.token) {
        await setSessionToken(result.token);
      }
      if (result.user) {
        setUser(result.user);
        return true;
      }
      return false;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Falha ao criar conta");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const signout = useCallback(async () => {
    try {
      setLoading(true);
      await authApi.signout();
      await removeSessionToken();
      setUser(null);
    } catch {
      await removeSessionToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, signin, signup, signout, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useFinanceAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useFinanceAuth must be used within AuthProvider");
  return ctx;
}

