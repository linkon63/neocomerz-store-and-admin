"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  apiRequest,
  clearAdminSession,
  resolveImageUrl,
  type AdminUser,
} from "../../../lib/admin-api";
export { PageHeader } from "./page-header";

export type AdminIconName =
  | "actions"
  | "brand"
  | "calendar"
  | "category"
  | "check"
  | "chevronRight"
  | "dashboard"
  | "discount"
  | "download"
  | "edit"
  | "filter"
  | "logout"
  | "orders"
  | "package"
  | "plus"
  | "pos"
  | "refresh"
  | "report"
  | "reviews"
  | "search"
  | "settings"
  | "stock"
  | "store"
  | "suppliers"
  | "tag"
  | "units"
  | "upload"
  | "variants"
  | "voucher"
  | "wholesale"
  | "x";

export function AdminIcon({
  name,
  className = "h-4 w-4",
}: {
  name: AdminIconName;
  className?: string;
}) {
  const iconProps = {
    className,
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 2,
    viewBox: "0 0 24 24",
    "aria-hidden": true,
  };

  const paths: Record<AdminIconName, ReactNode> = {
    actions: (
      <>
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
        <circle cx="5" cy="12" r="1" />
      </>
    ),
    brand: (
      <>
        <path d="M12 3l7 4v10l-7 4-7-4V7z" />
        <path d="M12 8v8" />
        <path d="M8.5 10.5l3.5-2 3.5 2" />
      </>
    ),
    calendar: (
      <>
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <rect height="18" rx="2" width="18" x="3" y="4" />
        <path d="M3 10h18" />
      </>
    ),
    category: (
      <>
        <rect height="7" rx="1" width="7" x="3" y="3" />
        <rect height="7" rx="1" width="7" x="14" y="3" />
        <rect height="7" rx="1" width="7" x="3" y="14" />
        <rect height="7" rx="1" width="7" x="14" y="14" />
      </>
    ),
    check: (
      <>
        <path d="M20 6L9 17l-5-5" />
      </>
    ),
    chevronRight: <path d="M9 18l6-6-6-6" />,
    dashboard: (
      <>
        <rect height="8" rx="1" width="8" x="3" y="3" />
        <rect height="5" rx="1" width="8" x="13" y="3" />
        <rect height="8" rx="1" width="8" x="13" y="13" />
        <rect height="5" rx="1" width="8" x="3" y="16" />
      </>
    ),
    discount: (
      <>
        <path d="M19 5L5 19" />
        <circle cx="7" cy="7" r="2" />
        <circle cx="17" cy="17" r="2" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12" />
        <path d="M7 10l5 5 5-5" />
        <path d="M5 21h14" />
      </>
    ),
    edit: (
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
      </>
    ),
    filter: (
      <>
        <path d="M4 6h16" />
        <path d="M7 12h10" />
        <path d="M10 18h4" />
      </>
    ),
    logout: (
      <>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="M16 17l5-5-5-5" />
        <path d="M21 12H9" />
      </>
    ),
    orders: (
      <>
        <path d="M6 2h12l2 4v16H4V6z" />
        <path d="M4 6h16" />
        <path d="M9 11h6" />
        <path d="M9 15h6" />
      </>
    ),
    package: (
      <>
        <path d="M21 8l-9-5-9 5 9 5z" />
        <path d="M3 8v8l9 5 9-5V8" />
        <path d="M12 13v8" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
    pos: (
      <>
        <rect height="16" rx="2" width="18" x="3" y="4" />
        <path d="M7 8h10" />
        <path d="M7 13h2" />
        <path d="M12 13h2" />
        <path d="M17 13h0" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 6v5h-5" />
        <path d="M4 18v-5h5" />
        <path d="M19 11a7 7 0 0 0-12-4l-3 3" />
        <path d="M5 13a7 7 0 0 0 12 4l3-3" />
      </>
    ),
    report: (
      <>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="M8 16v-5" />
        <path d="M12 16V8" />
        <path d="M16 16v-3" />
      </>
    ),
    reviews: (
      <>
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
        <path d="M8 9h8" />
        <path d="M8 13h5" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-4-4" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21h-4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-2.8-2.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1L7.1 4l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 2.8 2.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v4h-.1a1.7 1.7 0 0 0-1.7 1z" />
      </>
    ),
    stock: (
      <>
        <path d="M4 21V7l8-4 8 4v14" />
        <path d="M4 7l8 4 8-4" />
        <path d="M12 11v10" />
      </>
    ),
    store: (
      <>
        <path d="M3 9l1-5h16l1 5" />
        <path d="M5 9v11h14V9" />
        <path d="M9 20v-6h6v6" />
        <path d="M3 9h18" />
      </>
    ),
    suppliers: (
      <>
        <path d="M16 3h4v13h-4" />
        <path d="M4 17h12V7H4z" />
        <path d="M6 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
        <path d="M18 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
      </>
    ),
    tag: (
      <>
        <path d="M20 13L11 22 2 13V2h11z" />
        <circle cx="7.5" cy="7.5" r="1.5" />
      </>
    ),
    units: (
      <>
        <path d="M4 19h16" />
        <path d="M7 19V5" />
        <path d="M17 19V5" />
        <path d="M7 5h10" />
        <path d="M10 9h4" />
        <path d="M10 13h4" />
      </>
    ),
    upload: (
      <>
        <path d="M12 21V9" />
        <path d="M7 14l5-5 5 5" />
        <path d="M5 3h14" />
      </>
    ),
    variants: (
      <>
        <path d="M7 7h10" />
        <path d="M7 17h10" />
        <circle cx="7" cy="7" r="3" />
        <circle cx="17" cy="17" r="3" />
      </>
    ),
    voucher: (
      <>
        <path d="M3 7a2 2 0 0 1 2-2h14v5a2 2 0 0 0 0 4v5H5a2 2 0 0 1-2-2z" />
        <path d="M13 8v8" />
        <path d="M8 10h2" />
        <path d="M8 14h2" />
      </>
    ),
    wholesale: (
      <>
        <path d="M3 7h11v10H3z" />
        <path d="M14 10h4l3 3v4h-7z" />
        <circle cx="7" cy="18" r="1.6" />
        <circle cx="17" cy="18" r="1.6" />
      </>
    ),
    x: (
      <>
        <path d="M18 6L6 18" />
        <path d="M6 6l12 12" />
      </>
    ),
  };

  return <svg {...iconProps}>{paths[name]}</svg>;
}

type MenuItem = {
  label: string;
  href: string;
  icon: AdminIconName;
  children?: {
    label: string;
    href: string;
    icon: AdminIconName;
  }[];
};

const menuGroups: {
  title: string;
  items: MenuItem[];
}[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/admin/dashboard", icon: "dashboard" }],
  },
  {
    title: "Inventory & Procurement",
    items: [
      {
        label: "Product Catalog",
        href: "/admin/products",
        icon: "package",
        children: [
          { label: "Products", href: "/admin/products", icon: "package" },
          { label: "Categories", href: "/admin/categories", icon: "category" },
          { label: "Brands", href: "/admin/brands", icon: "brand" },
          { label: "Tags", href: "/admin/tags", icon: "tag" },
          { label: "Variant Options", href: "/admin/variant-options", icon: "variants" },
          { label: "Units of Measurement", href: "/admin/units", icon: "units" },
        ],
      },
    ],
  },
  {
    title: "Stock & inventory",
    items: [
      { label: "Stock Management", href: "/admin/stock", icon: "stock" },
    ],
  },
  {
    title: "Sales & Billing",
    items: [
      { label: "POS", href: "/admin/pos", icon: "pos" },
      { label: "Discount", href: "/admin/discounts", icon: "discount" },
      { label: "Gift Voucher", href: "/admin/gift-vouchers", icon: "voucher" },
    ],
  },
  {
    title: "Online Store",
    items: [
      {
        label: "E-Commerce",
        href: "/admin/orders",
        icon: "store",
        children: [
          { label: "New Orders", href: "/admin/orders", icon: "orders" },
          { label: "Canceled Orders", href: "/admin/orders/canceled", icon: "x" },
          { label: "Completed Orders", href: "/admin/orders/completed", icon: "check" },
          { label: "Wholesale Requests", href: "/admin/wholesale-requests", icon: "wholesale" },
          { label: "Reviews", href: "/admin/reviews", icon: "reviews" },
        ],
      },
      { label: "News & Blog", href: "/admin/news", icon: "report" },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        label: "Reports",
        href: "/admin/reports",
        icon: "report",
        children: [
          { label: "Sales Report", href: "/admin/reports/sales", icon: "report" },
          { label: "Discount Report", href: "/admin/reports/discount", icon: "discount" },
          { label: "Customer Report", href: "/admin/reports/customer", icon: "reviews" },
        ],
      },
    ],
  },
  {
    title: "Administration",
    items: [{ label: "Settings", href: "/admin/settings", icon: "settings" }],
  },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const initialOpen: Record<string, boolean> = {};
    menuGroups.forEach((group) => {
      group.items.forEach((item) => {
        if (item.children) {
          const hasActiveChild = item.children.some(
            (child) => pathname === child.href || pathname.startsWith(child.href + "/"),
          );
          const isActiveParent = pathname === item.href;
          if (hasActiveChild || isActiveParent) {
            initialOpen[item.label] = true;
          }
        }
      });
    });
    setOpenSubmenus((prev) => ({ ...prev, ...initialOpen }));
  }, [pathname]);

  const toggleSubmenu = (label: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  useEffect(() => {
    let isMounted = true;

    apiRequest<AdminUser>("/auth/me")
      .then((currentUser) => {
        if (!isMounted) return;

        if (currentUser.role?.name !== "admin") {
          clearAdminSession();
          router.replace("/admin/login");
          return;
        }

        setUser(currentUser);
      })
      .catch(() => {
        clearAdminSession();
        router.replace("/admin/login");
      })
      .finally(() => {
        if (isMounted) setIsChecking(false);
      });

    return () => {
      isMounted = false;
    };
  }, [router]);

  function handleLogout() {
    clearAdminSession();
    router.replace("/admin/login");
    router.refresh();
  }

  if (isChecking) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#fbfbfc] text-slate-700">
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-4 font-black shadow-sm">
          Checking admin session...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard min-h-screen bg-[#fbfbfc] text-[#111827]">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[312px] border-r border-slate-200 bg-white lg:block">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-5 py-5">
            <Link className="text-5xl font-black italic tracking-tight" href="/admin/dashboard">
              NeoComerz
            </Link>
          </div>
          <nav className="flex-1 overflow-y-auto px-3 pb-6 pt-5">
            {menuGroups.map((group) => (
              <div className="mb-7" key={group.title}>
                <p className="px-3 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                  {group.title}
                </p>
                <div className="mt-2 space-y-1">
                  {group.items.map((item) => {
                    const hasChildren = item.children && item.children.length > 0;
                    const isOpen = !!openSubmenus[item.label];
                    const isParentActive =
                      pathname === item.href ||
                      (item.children?.some((c) => pathname === c.href) ?? false);

                    if (hasChildren) {
                      return (
                        <div className="flex flex-col" key={`${group.title}-${item.label}`}>
                          <button
                            onClick={() => toggleSubmenu(item.label)}
                            className={`flex h-10 w-full cursor-pointer items-center gap-3 rounded-md px-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors ${
                              isParentActive ? "bg-slate-50 text-slate-950 font-extrabold" : ""
                            }`}
                            type="button"
                          >
                            <span className="text-slate-500">
                              <AdminIcon name={item.icon} />
                            </span>
                            <span className="flex-1 text-left">{item.label}</span>
                            <AdminIcon
                              className={`h-4 w-4 text-slate-400 transition-transform duration-300 ease-in-out ${
                                isOpen ? "rotate-90 text-slate-600" : ""
                              }`}
                              name="chevronRight"
                            />
                          </button>

                          <div
                            className={`grid transition-all duration-300 ease-in-out ${
                              isOpen
                                ? "grid-rows-[1fr] opacity-100 mt-1"
                                : "grid-rows-[0fr] opacity-0 pointer-events-none"
                            }`}
                          >
                            <div className="overflow-hidden">
                              <div className="space-y-1 pl-4 border-l border-slate-100 ml-5 py-1">
                                {item.children?.map((child) => {
                                  const isChildActive = pathname === child.href;
                                  return (
                                    <Link
                                      href={child.href}
                                      key={`${group.title}-${item.label}-${child.label}`}
                                      className={`flex h-9 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors ${
                                        isChildActive
                                          ? "bg-slate-100 text-slate-950 font-bold"
                                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                      }`}
                                    >
                                      <span className="text-slate-400">
                                        <AdminIcon name={child.icon} className="h-3.5 w-3.5" />
                                      </span>
                                      <span>{child.label}</span>
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    const isCurrent = pathname === item.href;
                    return (
                      <Link
                        className={`flex h-10 items-center gap-3 rounded-md px-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors ${
                          isCurrent ? "bg-slate-100 text-slate-950" : ""
                        }`}
                        href={item.href}
                        key={`${group.title}-${item.label}`}
                      >
                        <span className="text-slate-500">
                          <AdminIcon name={item.icon} />
                        </span>
                        <span className="flex-1">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
          <div className="border-t border-slate-100 p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-600 font-black text-white">
                {user?.name?.charAt(0).toUpperCase() ?? "A"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black">{user?.name ?? "Admin"}</p>
                <p className="truncate text-xs font-medium text-slate-500">
                  {user?.email ?? "Store admin"}
                </p>
              </div>
              <button
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-50"
                onClick={handleLogout}
                type="button"
              >
                <AdminIcon className="h-3.5 w-3.5" name="logout" />
                Exit
              </button>
            </div>
          </div>
        </div>
      </aside>
      <div className="lg:pl-[312px]">
        <main className="mx-auto w-full max-w-[1720px] px-2 sm:px-4">
          {children}
        </main>
      </div>
    </div>
  );
}

export function StatusToggle() {
  return (
    <span className="inline-flex h-8 w-14 items-center rounded-full bg-blue-600 p-1 shadow-sm">
      <span className="ml-auto h-6 w-6 rounded-full bg-white" />
    </span>
  );
}

export function ProductThumb({ color }: { color: string }) {
  return (
    <div className="relative h-12 w-16 overflow-hidden rounded bg-slate-50">
      <div className={`absolute bottom-3 left-4 h-6 w-9 rounded-full ${color}`} />
      <div className="absolute bottom-2 left-2 h-3 w-12 rounded-full bg-black/20" />
    </div>
  );
}
