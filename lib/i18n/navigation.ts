"use client";

import { useRouter } from "next/navigation";
import { isLocale, locales, LOCALE_COOKIE, type Locale } from "./config";
import { useLocale } from "./I18nProvider";

// Persist the chosen locale so the middleware honours it on the next request.
// Lives outside any component so it isn't flagged by the immutability lint rule.
export function setLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}`;
}

// Prefix an internal, app-relative href with a locale (e.g. "/shop" -> "/it/shop").
// External URLs, anchors, mailto/tel, and already-prefixed paths pass through.
export function localizeHref(href: string, locale: Locale): string {
  if (!href.startsWith("/")) return href; // external, #anchor, mailto:, tel:, relative
  if (href.startsWith("//")) return href; // protocol-relative external

  const [pathPart, rest] = splitPath(href);
  const segments = pathPart.split("/").filter(Boolean);

  if (segments.length > 0 && isLocale(segments[0])) {
    segments[0] = locale; // replace an existing locale prefix
  } else {
    segments.unshift(locale);
  }

  return `/${segments.join("/")}${rest}`;
}

// Strip a leading locale segment from a pathname ("/it/shop" -> "/shop").
export function stripLocale(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && isLocale(segments[0])) {
    segments.shift();
  }
  return `/${segments.join("/")}`;
}

// Detect the active locale from a pathname, if present.
export function localeFromPathname(pathname: string): Locale | undefined {
  const first = pathname.split("/").filter(Boolean)[0];
  return isLocale(first) ? first : undefined;
}

function splitPath(href: string): [string, string] {
  const matchIndex = href.search(/[?#]/);
  if (matchIndex === -1) return [href, ""];
  return [href.slice(0, matchIndex), href.slice(matchIndex)];
}

export { locales };

// Router wrapper whose push/replace automatically prefix the active locale.
// Plain closures (no useCallback) so the React 19 compiler can optimize freely.
export function useLocalizedRouter() {
  const router = useRouter();
  const locale = useLocale();

  return {
    ...router,
    push: (href: string, options?: Parameters<typeof router.push>[1]) =>
      router.push(localizeHref(href, locale), options),
    replace: (href: string, options?: Parameters<typeof router.replace>[1]) =>
      router.replace(localizeHref(href, locale), options),
  };
}
