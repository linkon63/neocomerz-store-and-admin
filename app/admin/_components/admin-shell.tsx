"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useMemo } from "react";
import { AdminIcon } from "./admin-icons";
import { menuGroups } from "./admin-nav-data";
import { useAdminAuth } from "../_hooks/use-admin-auth";
import { MangoLogo } from "../../store/_components/store-shell";

export { AdminIcon } from "./admin-icons";
export type { AdminIconName } from "./admin-icons";
export { PageHeader, StatusToggle, ProductThumb } from "./admin-ui";

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, isChecking, handleLogout } = useAdminAuth();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupTitle]: !prev[groupTitle],
    }));
  };

  const initialExpandedGroups = useMemo(() => {
    const expanded: Record<string, boolean> = {};
    menuGroups.forEach((group) => {
      const hasActiveChild = group.items.some((item) => pathname === item.href);
      if (hasActiveChild) {
        expanded[group.title] = true;
      }
    });
    return expanded;
  }, [pathname]);

  const mergedExpandedGroups = useMemo(() => {
    return { ...initialExpandedGroups, ...expandedGroups };
  }, [initialExpandedGroups, expandedGroups]);

  if (isChecking || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#fbfbfc] text-slate-700">
        <div className="border border-slate-200 bg-white px-6 py-4">
          Checking admin session...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfbfc] text-[#111827] neocomerz-admin">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[312px] border-r border-slate-200 bg-white lg:block">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-5 py-5 border-b border-stone-100">
            <Link href="/admin/dashboard" className="transition-opacity hover:opacity-90">
              <MangoLogo />
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 pb-6 pt-5">
            {menuGroups.map((group) => {
              const groupParentItems = group.items.filter((item) => !item.child);
              const isGroupExpanded = mergedExpandedGroups[group.title] ?? groupParentItems.length > 0;

              return (
                <div className="mb-7" key={group.title}>
                  <p className="px-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {group.title}
                  </p>
                  <div className="mt-2 space-y-1">
                    {group.items.map((item) => {
                      const isCurrent = pathname === item.href;
                      const hasChildren = group.items.some((i) => i.child && i.href.startsWith(item.href));

                      if (item.child && !isGroupExpanded) return null;

                      return (
                        <div key={`${group.title}-${item.label}`}>
                          {hasChildren && !item.child ? (
                            <button
                               onClick={() => toggleGroup(group.title)}
                              className={`flex w-full h-10 items-center gap-3 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors ${
                                isCurrent ? "bg-slate-100 text-slate-950" : ""
                              }`}
                            >
                              <span className="text-slate-500">
                                <AdminIcon name={item.icon} />
                              </span>
                              <span className="flex-1 text-left">{item.label}</span>
                              <AdminIcon
                                className={`h-4 w-4 text-slate-400 transition-transform ${
                                  isGroupExpanded ? "rotate-90" : ""
                                }`}
                                name="chevronRight"
                              />
                            </button>
                          ) : (
                            <Link
                              className={`flex h-10 items-center gap-3 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors ${
                                item.child ? "ml-5 font-medium" : ""
                              } ${isCurrent ? "bg-slate-100 text-slate-950" : ""}`}
                              href={item.href}
                            >
                              <span className={item.child ? "text-slate-400" : "text-slate-500"}>
                                <AdminIcon name={item.icon} />
                              </span>
                              <span className="flex-1">{item.label}</span>
                              {!item.child && hasChildren && (
                                <AdminIcon
                                  className={`h-4 w-4 text-slate-400 transition-transform ${
                                    isGroupExpanded ? "rotate-90" : ""
                                  }`}
                                  name="chevronRight"
                                />
                              )}
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>

          <div className="border-t border-slate-100 p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-[#2E7D32] font-semibold text-white shadow-xs">
                {user?.name?.charAt(0).toUpperCase() ?? "A"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{user?.name ?? "Admin"}</p>
                <p className="truncate text-xs font-medium text-slate-500">
                  {user?.email ?? "Store admin"}
                </p>
              </div>
              <button
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
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
        <main className="mx-auto w-full max-w-[1720px] px-5 py-7 sm:px-8 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
