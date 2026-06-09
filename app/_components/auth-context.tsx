"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: { id: string; name: string } | null;
};

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
  logout: () => void;
  authModal: "login" | "register" | "forgot-password" | null;
  openAuthModal: (mode: "login" | "register" | "forgot-password") => void;
  closeAuthModal: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "humana-auth-token";

function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

function storeToken(token: string, rememberMe: boolean) {
  if (rememberMe) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

export function getToken(): string | null {
  return getStoredToken();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      const token = getStoredToken();
      if (!token) {
        setTimeout(() => setIsLoading(false), 0);
        return;
      }

      try {
        const res = await fetch("/api/v1/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          clearStoredToken();
        }
      } catch {
        clearStoredToken();
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  const login = useCallback(async (email: string, password: string, rememberMe: boolean) => {
    const res = await fetch("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      const message = Array.isArray(data.message) ? data.message[0] : (data.message || "Login failed");
      throw new Error(message);
    }
    const roleName = data.user?.role?.name?.toLowerCase();
    if (roleName && roleName !== "user") {
      throw new Error("Only customers can log in here");
    }
    storeToken(data.accessToken, rememberMe);
    setUser(data.user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await fetch("/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      const message = Array.isArray(data.message) ? data.message[0] : (data.message || "Registration failed");
      throw new Error(message);
    }
    storeToken(data.accessToken, false);
    setUser(data.user);
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    const res = await fetch("/api/v1/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) {
      const message = Array.isArray(data.message) ? data.message[0] : (data.message || "Request failed");
      throw new Error(message);
    }
    return data.message || "Check your email for reset instructions";
  }, []);

  const [authModal, setAuthModal] = useState<"login" | "register" | "forgot-password" | null>(null);

  const openAuthModal = useCallback((mode: "login" | "register" | "forgot-password") => {
    setAuthModal(mode);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModal(null);
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        forgotPassword,
        logout,
        authModal,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
