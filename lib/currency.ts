export const CURRENCY_SYMBOLS: Record<string, string> = {
  BDT: "৳",
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  SAR: "﷼",
  AED: "د.إ",
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1";

let cachedCurrency: string = "BDT";
let fetchPromise: Promise<void> | null = null;

export function ensureCurrencyLoaded(): Promise<void> {
  if (fetchPromise) return fetchPromise;
  fetchPromise = fetch(`${API_BASE_URL}/settings`)
    .then((res) => (res.status === 200 ? res.text() : null))
    .then((text) => (text ? JSON.parse(text) : null))
    .then((data) => {
      if (data?.currency) cachedCurrency = data.currency;
    })
    .catch(() => {});
  return fetchPromise;
}

export function getCurrencyCode(): string {
  return cachedCurrency;
}

export function getCurrencySymbol(code?: string): string {
  return CURRENCY_SYMBOLS[code ?? cachedCurrency] ?? CURRENCY_SYMBOLS.BDT ?? "৳";
}

export function formatCurrency(
  value?: string | number | null,
  symbol?: string,
): string {
  if (value === undefined || value === null || value === "") return "-";
  const sym = symbol ?? getCurrencySymbol();
  return `${sym}${Number(value).toLocaleString("en", {
    maximumFractionDigits: 2,
  })}`;
}
