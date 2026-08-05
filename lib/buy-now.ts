import type { CartItem } from "@/lib/types";

const BUY_NOW_KEY = "buyNowItem";

export function getBuyNowItem(): CartItem | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(BUY_NOW_KEY);
    return raw ? (JSON.parse(raw) as CartItem) : null;
  } catch {
    return null;
  }
}

export function setBuyNowItem(item: CartItem): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(BUY_NOW_KEY, JSON.stringify(item));
  } catch {
    // Ignore storage failures (e.g. private mode).
  }
}

export function clearBuyNowItem(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(BUY_NOW_KEY);
  } catch {
    // Ignore storage failures (e.g. private mode).
  }
}
