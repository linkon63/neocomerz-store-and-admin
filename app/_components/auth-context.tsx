"use client";

import { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<Pick<User, "name" | "email">> & { phone?: string }) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5010/api/v1";
const TOKEN_KEY = "customer_access_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const savedToken = sessionStorage.getItem(TOKEN_KEY);
      if (!savedToken) {
        setIsLoading(false);
        return;
      }

      setToken(savedToken);
      try {
        const res = await fetch(`${BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${savedToken}` },
        });

        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          // Token is stale — clear it
          sessionStorage.removeItem(TOKEN_KEY);
          setToken(null);
        }
      } catch (err) {
        console.error("Failed to restore session:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error((errData as { message?: string }).message || "Invalid credentials");
    }

    const data = await res.json();
    sessionStorage.setItem(TOKEN_KEY, data.accessToken);
    setToken(data.accessToken);
    setUser(data.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error((errData as { message?: string }).message || "Registration failed");
    }

    const data = await res.json();
    sessionStorage.setItem(TOKEN_KEY, data.accessToken);
    setToken(data.accessToken);
    setUser(data.user);
  };

  const updateProfile = async (data: Partial<Pick<User, "name" | "email">> & { phone?: string }) => {
    if (!token) throw new Error("Not authenticated");

    const res = await fetch(`${BASE_URL}/auth/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error((errData as { message?: string }).message || "Failed to update profile");
    }

    const updatedUser = await res.json();
    setUser(updatedUser);
  };

  const logout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
