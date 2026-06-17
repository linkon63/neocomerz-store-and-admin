// Storefront locales. Admin (`app/admin`) is intentionally NOT localized.
export const locales = ["en", "it"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "it";

export const localeNames: Record<Locale, string> = {
  en: "English",
  it: "Italiano",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

// Cookie used to remember the visitor's chosen locale across requests.
export const LOCALE_COOKIE = "NEXT_LOCALE";
