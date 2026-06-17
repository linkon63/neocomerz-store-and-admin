import "server-only";
import type { Locale } from "./config";
import { getDictionary } from "./dictionaries";
import { createTranslator, type Translator } from "./translate";

// Server-side translator for Server Components. Reads the locale from the
// route's `params` and returns a `t()` with the same signature as the client.
export async function getTranslator(locale: Locale): Promise<Translator> {
  const messages = await getDictionary(locale);
  return createTranslator(messages);
}
