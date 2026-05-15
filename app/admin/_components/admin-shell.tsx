"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminIcon } from "./admin-icons";
import { menuGroups } from "./admin-nav-data";
import { useAdminAuth } from "../_hooks/use-admin-auth";

export { AdminIcon } from "./admin-icons";
export type { AdminIconName } from "./admin-icons";
export { PageHeader, StatusToggle, ProductThumb } from "./admin-ui";

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, isChecking, handleLogout } = useAdminAuth();

  if (isChecking) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#fbfbfc] text-slate-700">
        <div className="border border-slate-200 bg-white px-6 py-4 font-black">
          Checking admin session...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfbfc] text-[#111827]">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[312px] border-r border-slate-200 bg-white lg:block">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-5 py-5">
            <Link href="/admin/dashboard">
              <Image src="/logo.png" alt="NeoComerz" width={140} height={40} className="h-10 w-auto object-contain" priority />
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
                    const isCurrent = pathname === item.href;
                    return (
                      <Link
                        className={`flex h-10 items-center gap-3 px-3 text-sm font-bold text-slate-700 hover:bg-slate-50 ${
                          item.child ? "ml-5 font-medium" : ""
                        } ${isCurrent ? "bg-slate-100 text-slate-950" : ""}`}
                        href={item.href}
                        key={`${group.title}-${item.label}`}
                      >
                        <span className={item.child ? "text-slate-400" : "text-slate-500"}>
                          <AdminIcon name={item.icon} />
                        </span>
                        <span className="flex-1">{item.label}</span>
                        {!item.child && (
                          <AdminIcon className="h-4 w-4 text-slate-400" name="chevronRight" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="border-t border-slate-100 p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-blue-600 font-black text-white">
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
        <main className="mx-auto w-full max-w-[1720px] px-5 py-7 sm:px-8 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
