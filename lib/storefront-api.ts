"use client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1";

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  // Social-login avatar (e.g. Google profile picture); used as a fallback for avatarUrl.
  avatar?: string | null;
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

export async function login(email: string, password: string) {
  const data = await customerRequest<{ accessToken: string; user: CustomerUser }>(
    "/auth/login",
    {
      auth: false,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    },
  );
  return data;
}

export async function register(name: string, email: string, password: string) {
  const data = await customerRequest<{ accessToken: string; user: CustomerUser }>(
    "/auth/register",
    {
      auth: false,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    },
  );
  return data;
}

export async function googleLogin(googleAccessToken: string) {
  const data = await customerRequest<{ accessToken: string; user: CustomerUser }>(
    "/auth/google",
    {
      auth: false,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken: googleAccessToken }),
    },
  );
  return data;
}

export async function getMe() {
  const data = await customerRequest<CustomerUser>("/auth/me");
  // Fall back to the social-login avatar when no uploaded profile picture exists.
  return { ...data, avatarUrl: data.avatarUrl ?? data.avatar ?? null };
}

export async function updateProfileDetails(data: { name: string; email: string; phone?: string }) {
  return customerRequest<CustomerUser>("/auth/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function changePassword(data: { currentPassword: string; newPassword: string }) {
  return customerRequest<void>("/auth/change-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export async function getMyProfile(): Promise<CustomerProfile> {
  const data = await customerRequest<any>("/profile/me");
  return {
    id: data.id,
    name: data.user?.name ?? "",
    email: data.user?.email ?? "",
    phone: data.user?.phone ?? "",
    avatarUrl: data.avatarMedia?.url ?? null,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
  const formData = new FormData();
  formData.append("avatar", file);

  const data = await customerRequest<any>("/profile/avatar", {
    method: "POST",
    body: formData,
  });

  return { avatarUrl: data.avatarMedia?.url ?? null };
}

export async function deleteAvatar(): Promise<void> {
  return customerRequest<void>("/profile/avatar", {
    method: "DELETE",
  });
}

export interface CustomerNotification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export async function getNotifications(): Promise<CustomerNotification[]> {
  return customerRequest<CustomerNotification[]>("/notifications");
}

export async function markNotificationAsRead(id: string): Promise<void> {
  return customerRequest<void>(`/notifications/${id}/read`, {
    method: "PATCH",
  });
}

export async function markAllNotificationsAsRead(): Promise<void> {
  return customerRequest<void>("/notifications/read-all", {
    method: "PATCH",
  });
}

export async function deleteNotification(id: string): Promise<void> {
  return customerRequest<void>(`/notifications/${id}`, {
    method: "DELETE",
  });
}

export interface CreateWholesaleRequestItem {
  productId: string;
  variantId?: string;
  requestedQuantity: number;
  targetPrice?: number;
  note?: string;
}

export interface CreateWholesaleRequestDto {
  customerNote?: string;
  contactPhone?: string;
  items: CreateWholesaleRequestItem[];
}

export async function submitWholesaleRequest(dto: CreateWholesaleRequestDto): Promise<any> {
  return customerRequest<any>("/wholesale-requests", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}


