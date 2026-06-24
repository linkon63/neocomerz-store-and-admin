"use client";

import { useCurrency } from "../../lib/currency-context";

export function PriceDisplay({ value }: { value: string | number | null | undefined }) {
  const { formatCurrency } = useCurrency();
  return <>{formatCurrency(value)}</>;
}
