"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  ensureCurrencyLoaded,
  getCurrencyCode,
  getCurrencySymbol,
  formatCurrency,
} from "./currency";

type CurrencyContextValue = {
  currency: string;
  symbol: string;
  formatCurrency: (value?: string | number | null) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ensureCurrencyLoaded().then(() => setReady(true));
  }, []);

  const value: CurrencyContextValue = {
    currency: getCurrencyCode(),
    symbol: getCurrencySymbol(),
    formatCurrency: (value) => formatCurrency(value, getCurrencySymbol()),
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    return {
      currency: getCurrencyCode(),
      symbol: getCurrencySymbol(),
      formatCurrency: (value) => formatCurrency(value, getCurrencySymbol()),
    };
  }
  return ctx;
}
