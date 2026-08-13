import { NextResponse, type NextRequest } from "next/server";

const BACKEND_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:5010/api/v1";


const verifiedTokens = new Map<string, number>();
const VERIFY_TTL_MS = 60_000;


async function isTokenValid(token: string): Promise<boolean> {
  const now = Date.now();
  const lastVerifiedAt = verifiedTokens.get(token);

  if (lastVerifiedAt !== undefined && now - lastVerifiedAt < VERIFY_TTL_MS) {
    return true;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });

    if (response.ok) {
      verifiedTokens.set(token, now);
    }

    return response.ok;
  } catch {
    return true;
  }
}

// Delete the session cookies
function clearSessionCookies(response: NextResponse) {
  response.cookies.set("admin_access_token", "", { path: "/admin", maxAge: 0 });
  response.cookies.set("admin_user", "", { path: "/admin", maxAge: 0 });
}

// Send the admin to the login page
function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);

  const response = NextResponse.redirect(loginUrl);
  clearSessionCookies(response);
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("admin_access_token")?.value;

  const isLoginPage = pathname === "/admin/login";


  if (isLoginPage) {
    if (token && (await isTokenValid(token))) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return clearSessionCookies(NextResponse.next());
  }

  // Every other /admin page needs a valid session.
  if (!token || !(await isTokenValid(token))) {
    return redirectToLogin(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
