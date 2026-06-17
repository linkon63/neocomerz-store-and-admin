import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE, defaultLocale, isLocale } from "@/lib/i18n/config";

const LOCALE_MAX_AGE = 60 * 60 * 24 * 365;

// Negotiate a locale from the Accept-Language header against our supported set.
function localeFromAcceptLanguage(header: string | null): string | undefined {
  if (!header) return undefined;
  const accepted = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of accepted) {
    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
  }
  return undefined;
}

function detectLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(cookieLocale)) return cookieLocale;

  const headerLocale = localeFromAcceptLanguage(request.headers.get("accept-language"));
  if (headerLocale) return headerLocale;

  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Admin: unprefixed, single-language, auth-gated ---
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("admin_access_token")?.value;

    if (pathname === "/admin/login" && token) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    if (pathname !== "/admin/login" && !token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // --- Storefront: locale-prefixed (en/it) ---
  const firstSegment = pathname.split("/").filter(Boolean)[0];

  // Already locale-prefixed: pass through, keeping the cookie in sync.
  if (isLocale(firstSegment)) {
    const response = NextResponse.next();
    if (request.cookies.get(LOCALE_COOKIE)?.value !== firstSegment) {
      response.cookies.set(LOCALE_COOKIE, firstSegment, { path: "/", maxAge: LOCALE_MAX_AGE });
    }
    return response;
  }

  // Otherwise redirect to the detected locale, preserving path + query.
  const locale = detectLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;

  const response = NextResponse.redirect(url);
  response.cookies.set(LOCALE_COOKIE, locale, { path: "/", maxAge: LOCALE_MAX_AGE });
  return response;
}

export const config = {
  // Runs on admin (auth) and storefront (locale) paths. Excludes API/proxy
  // rewrite routes, Next internals, and any file with an extension.
  matcher: [
    "/((?!api|brands|products|categories|campaigns|avatars|uploads|image-proxy|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
