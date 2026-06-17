"use client";

import { createContext, useContext, useMemo } from "react";
import type { Locale } from "./config";
import { createTranslator, type Translator } from "./translate";
import { setApiLocale } from "@/lib/admin-api";

type I18nContextValue = {
  locale: Locale;
  messages: unknown;
  t: Translator;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: unknown;
  children: React.ReactNode;
}) {
  // Keep the API helper's locale in sync for customer-facing requests.
  setApiLocale(locale);

  const value = useMemo<I18nContextValue>(
    () => ({ locale, messages, t: createTranslator(messages) }),
    [locale, messages],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return ctx;
}

// Convenience hook when only the active locale is needed.
export function useLocale(): Locale {
  return useI18n().locale;
}
