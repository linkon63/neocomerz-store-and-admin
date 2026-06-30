"use client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1";

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
}

export function getCustomerToken(): string | null {
  if (typeof document === "undefined") return null;
  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("customer_access_token="))
      ?.split("=")[1] ?? null
  );
}

export function getCustomerUser(): CustomerUser | null {
  if (typeof document === "undefined") return null;
  const raw = document.cookie
    .split("; ")
    .find((row) => row.startsWith("customer_user="))
    ?.split("=")[1];
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as CustomerUser;
  } catch {
    return null;
  }
}

export function setCustomerSession(accessToken: string, user: CustomerUser) {
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `customer_access_token=${accessToken}; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `customer_user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearCustomerSession() {
  document.cookie = "customer_access_token=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "customer_user=; path=/; max-age=0; SameSite=Lax";
}

type RequestOptions = RequestInit & {
  auth?: boolean;
};

async function customerRequest<T>(
  path: string,
  { auth = true, headers, ...options }: RequestOptions = {},
): Promise<T> {
  const token = getCustomerToken();
  const requestHeaders = new Headers(headers);
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 10000);

  if (auth && token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: requestHeaders,
      signal: controller.signal,
    });

    const contentType = response.headers.get("content-type");
    const payload = contentType?.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const message =
        typeof payload === "object" && payload && "message" in payload
          ? Array.isArray(payload.message)
            ? payload.message.join(", ")
            : String(payload.message)
          : `Request failed with status ${response.status}`;

      throw new Error(message);
    }

    return payload as T;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("Backend API did not respond. Start the backend server and try again.");
    }
    throw err instanceof Error ? err : new Error("API request failed");
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function login(phone: string, password: string) {
  const data = await customerRequest<{ accessToken: string; user: CustomerUser }>(
    "/auth/login",
    {
      auth: false,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    },
  );
  return data;
}

export async function register(firstName: string, lastName: string, phone: string, password: string) {
  const data = await customerRequest<{ accessToken: string; user: CustomerUser }>(
    "/auth/register",
    {
      auth: false,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, phone, password }),
    },
  );
  return data;
}

export async function getMe() {
  return customerRequest<CustomerUser>("/auth/me");
}
