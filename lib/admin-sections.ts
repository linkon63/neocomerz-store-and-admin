import type { AdminUser } from "./admin-api";

/**
 * Top-level admin-panel sections a role can be granted. The `key` matches the
 * Permission.name seeded on the backend (see prisma/seed-auth.ts). The superadmin
 * implicitly has every section; other staff only see the sections their role grants.
 * Keep this list in sync with ADMIN_SECTION_KEYS on the backend.
 */
export type AdminSectionKey =
  | "dashboard"
  | "products"
  | "stock"
  | "sales"
  | "orders"
  | "reports"
  | "settings";

export type AdminSection = {
  key: AdminSectionKey;
  label: string;
  description: string;
  /** Route prefixes that belong to this section. */
  prefixes: string[];
};

export const ADMIN_SECTIONS: AdminSection[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    description: "Overview, KPIs and charts",
    prefixes: ["/admin/dashboard"],
  },
  {
    key: "products",
    label: "Product Catalog",
    description: "Products, categories, brands, tags, variants & units",
    prefixes: [
      "/admin/products",
      "/admin/categories",
      "/admin/brands",
      "/admin/tags",
      "/admin/variant-options",
      "/admin/units",
    ],
  },
  {
    key: "stock",
    label: "Stock Management",
    description: "Inventory and stock levels",
    prefixes: ["/admin/stock"],
  },
  {
    key: "sales",
    label: "Sales & Billing",
    description: "Discounts, coupons and gift vouchers",
    prefixes: ["/admin/discounts", "/admin/coupons", "/admin/gift-vouchers"],
  },
  {
    key: "orders",
    label: "Online Store & Orders",
    description: "Orders, wholesale requests, reviews and news",
    prefixes: [
      "/admin/orders",
      "/admin/wholesale-requests",
      "/admin/reviews",
      "/admin/news",
    ],
  },
  {
    key: "reports",
    label: "Reports",
    description: "Sales, discount and customer reports",
    prefixes: ["/admin/reports"],
  },
  {
    key: "settings",
    label: "Settings",
    description: "Shop settings, campaigns, contact and policies",
    prefixes: ["/admin/settings"],
  },
];

export const SUPERADMIN_ROLE = "superadmin";

/** Routes outside the grantable sections. */
export const STAFF_ROUTE = "/admin/staff"; // superadmin only
export const ACCOUNT_ROUTE = "/admin/account"; // any authenticated staff member

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(prefix + "/");
}

export function isSuperadmin(user: AdminUser | null | undefined): boolean {
  return user?.role?.name === SUPERADMIN_ROLE;
}

/**
 * Whether a user may enter the admin panel at all. Any staff member (a user with
 * a role) qualifies — the superadmin, the built-in admin, and any custom role
 * such as "Manager". Customers have no role and are rejected.
 */
export function canEnterAdminPanel(user: AdminUser | null | undefined): boolean {
  return Boolean(user?.role);
}

/** Section key a given admin path belongs to, or null for non-section routes. */
export function sectionForPath(pathname: string): AdminSectionKey | null {
  const match = ADMIN_SECTIONS.find((section) =>
    section.prefixes.some((prefix) => matchesPrefix(pathname, prefix)),
  );
  return match ? match.key : null;
}

/** The set of section keys this user is allowed to see. */
export function allowedSectionKeys(
  user: AdminUser | null | undefined,
): Set<AdminSectionKey> {
  if (isSuperadmin(user)) {
    return new Set(ADMIN_SECTIONS.map((s) => s.key));
  }
  const granted = new Set((user?.role?.permissions ?? []).map((p) => p.name));
  return new Set(
    ADMIN_SECTIONS.filter((s) => granted.has(s.key)).map((s) => s.key),
  );
}

/** Whether the user may open a given admin route. */
export function canAccessPath(
  user: AdminUser | null | undefined,
  pathname: string,
): boolean {
  if (matchesPrefix(pathname, STAFF_ROUTE)) return isSuperadmin(user);
  if (matchesPrefix(pathname, ACCOUNT_ROUTE)) return true;

  const section = sectionForPath(pathname);
  if (!section) return true; // unknown/neutral admin route (e.g. /admin itself)
  return allowedSectionKeys(user).has(section);
}

/** The first route this user is allowed to land on. */
export function firstAllowedRoute(user: AdminUser | null | undefined): string {
  const allowed = allowedSectionKeys(user);
  const firstSection = ADMIN_SECTIONS.find((s) => allowed.has(s.key));
  if (firstSection) return firstSection.prefixes[0];
  if (isSuperadmin(user)) return STAFF_ROUTE;
  // Staff member with no granted sections can still manage their own account.
  return ACCOUNT_ROUTE;
}
