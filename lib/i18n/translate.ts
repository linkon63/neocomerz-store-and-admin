// Resolve a dotted key (e.g. "product.addToCart") against a nested messages
// object and interpolate {var} placeholders. Works on both server and client.
export type TranslateVars = Record<string, string | number>;

export function resolveKey(messages: unknown, key: string): string | undefined {
  let current: unknown = messages;
  for (const part of key.split(".")) {
    if (current && typeof current === "object" && part in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof current === "string" ? current : undefined;
}

export function interpolate(template: string, vars?: TranslateVars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

export function createTranslator(messages: unknown) {
  return function t(key: string, vars?: TranslateVars): string {
    const template = resolveKey(messages, key);
    if (template === undefined) {
      // Fall back to the key so missing translations are visible but non-fatal.
      return key;
    }
    return interpolate(template, vars);
  };
}

export type Translator = ReturnType<typeof createTranslator>;
