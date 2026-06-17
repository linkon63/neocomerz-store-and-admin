import type { Locale } from "./config";

// Currency is EUR across the store; formatting (symbol position, separators)
// follows the active locale.
export function formatCurrency(
  amount: number,
  locale: Locale,
  currency = "EUR",
): string {
  return (
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    })
      .format(Number.isFinite(amount) ? amount : 0)
      // Intl inserts a (narrow) no-break space before the symbol; the custom
      // Gotham font renders U+00A0/U+202F with a huge advance width, so swap
      // them for a regular space.
      .replace(/[  ]/g, " ")
  );
}

export function formatDate(
  value: string | number | Date,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" },
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale, options).format(date);
}
