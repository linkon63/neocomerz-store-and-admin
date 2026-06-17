import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE, defaultLocale, isLocale } from "@/lib/i18n/config";

const LOCALE_MAX_AGE = 60 * 60 * 24 * 365;

// Cookieless visitors default to the store's default locale (Italian). We do
// NOT negotiate Accept-Language — this is an Italian-first store, so an English
// browser still lands on `it` until the visitor switches (which sets the cookie).
function detectLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(cookieLocale)) return cookieLocale;
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
