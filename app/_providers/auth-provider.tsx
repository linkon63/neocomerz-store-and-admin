"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import {
  type CustomerUser,
  getCustomerUser,
  setCustomerSession,
  clearCustomerSession,
  login as apiLogin,
  register as apiRegister,
  googleLogin as apiGoogleLogin,
  getMe,
  updateProfileDetails,
  getCustomerToken,
  getMyProfile,
} from "@/lib/storefront-api";

interface AuthContextValue {
  user: CustomerUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (googleAccessToken: string) => Promise<void>;
  logout: () => void;
  updateProfile: (name: string, email: string, phone?: string) => Promise<void>;
  refreshUser: () => Promise<void>;
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

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken, user: loggedInUser } = await apiLogin(email, password);
    setCustomerSession(accessToken, loggedInUser);
    setUser(loggedInUser);
    setShowAuthModal(false);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { accessToken, user: registeredUser } = await apiRegister(name, email, password);
    setCustomerSession(accessToken, registeredUser);
    setUser(registeredUser);
    setShowAuthModal(false);
  }, []);

  const loginWithGoogle = useCallback(async (googleAccessToken: string) => {
    const { accessToken, user: googleUser } = await apiGoogleLogin(googleAccessToken);
    // Surface the Google profile picture as the display avatar.
    const normalized = { ...googleUser, avatarUrl: googleUser.avatarUrl ?? googleUser.avatar ?? null };
    setCustomerSession(accessToken, normalized);
    setUser(normalized);
    setShowAuthModal(false);
  }, []);

  const logout = useCallback(() => {
    clearCustomerSession();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (name: string, email: string, phone?: string) => {
    const updatedUser = await updateProfileDetails({ name, email, phone });
    const token = getCustomerToken() || "";
    setCustomerSession(token, updatedUser);
    setUser(updatedUser);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const fresh = await getMe();
      try {
        const profile = await getMyProfile();
        // Prefer an uploaded avatar, but keep the Google picture when none exists.
        fresh.avatarUrl = profile.avatarUrl ?? fresh.avatarUrl ?? null;
      } catch {}
      const token = getCustomerToken() || "";
      setCustomerSession(token, fresh);
      setUser(fresh);
    } catch {}
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
        loginWithGoogle,
        logout,
        updateProfile,
        refreshUser,
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
