"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import {
  type CustomerUser,
  getCustomerUser,
  setCustomerSession,
  clearCustomerSession,
  login as apiLogin,
  register as apiRegister,
  getMe,
} from "@/lib/storefront-api";

interface AuthContextValue {
  user: CustomerUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  login: (phone: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const cached = getCustomerUser();
    if (cached) {
      setUser(cached);
      setLoading(false);
      getMe()
        .then((fresh) => setUser(fresh))
        .catch(() => {
          clearCustomerSession();
          setUser(null);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (phone: string, password: string) => {
    const { accessToken, user: loggedInUser } = await apiLogin(phone, password);
    setCustomerSession(accessToken, loggedInUser);
    setUser(loggedInUser);
    setShowAuthModal(false);
  }, []);

  const register = useCallback(async (firstName: string, lastName: string, phone: string, password: string) => {
    const { accessToken, user: registeredUser } = await apiRegister(firstName, lastName, phone, password);
    setCustomerSession(accessToken, registeredUser);
    setUser(registeredUser);
    setShowAuthModal(false);
  }, []);

  const logout = useCallback(() => {
    clearCustomerSession();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        showAuthModal,
        setShowAuthModal,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
