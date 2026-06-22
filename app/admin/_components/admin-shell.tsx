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
export { PageHeader, StatusToggle, ProductThumb } from "./admin-ui";

import { AdminIcon, type AdminIconName } from "./admin-icons";
export { AdminIcon } from "./admin-icons";
export type { AdminIconName } from "./admin-icons";



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

