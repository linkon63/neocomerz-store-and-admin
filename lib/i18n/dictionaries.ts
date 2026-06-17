import "server-only";
import type { Locale } from "./config";
import en from "@/lang/en.json";

// The English dictionary is the source of truth for the shape; other locales
// must mirror its keys. Using `typeof en` keeps `t()` keys honest at build time.
export type Messages = typeof en;

const dictionaries: Record<Locale, () => Promise<Messages>> = {
  en: async () => en,
  it: async () => (await import("@/lang/it.json")).default as Messages,
};

export async function getDictionary(locale: Locale): Promise<Messages> {
  return dictionaries[locale]();
}
