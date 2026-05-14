"use client";

import { AdminIcon, type AdminIconName } from "../admin-shell";

export type SiteSection =
  | "general"
  | "page-builder"
  | "contacts"
  | "manage-policy"
  | "campaigns";

export const siteNav: { id: SiteSection; label: string; icon: AdminIconName }[] = [
  { id: "general", label: "General", icon: "settings" },
  { id: "page-builder", label: "Page Builder", icon: "dashboard" },
  { id: "contacts", label: "Contact & Social Media", icon: "reviews" },
  { id: "manage-policy", label: "Manage Policy", icon: "orders" },
  { id: "campaigns", label: "Campaigns", icon: "discount" },
];

export const siteSectionMeta: Record<SiteSection, { title: string; description: string }> = {
  general: { title: "General", description: "Manage & customize your website content & interface." },
  "page-builder": { title: "Page Builder", description: "Manage & customize your website content & interface." },
  contacts: { title: "Contact & Social Media", description: "Manage & customize your website content & interface." },
  "manage-policy": { title: "Manage Policy", description: "Manage & customize your website content & interface." },
  campaigns: { title: "Campaigns List", description: "Manage & customize your website content & interface." },
};

export function SiteNav({
  active,
  onChange,
}: {
  active: SiteSection;
  onChange: (section: SiteSection) => void;
}) {
  return (
    <div className="px-4 py-5">
      <p className="mb-3 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
        Website
      </p>
      <nav className="space-y-0.5">
        {siteNav.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-blue-50 font-black text-blue-700"
                  : "font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
              key={item.id}
              onClick={() => onChange(item.id)}
              type="button"
            >
              <AdminIcon
                className={`h-4 w-4 shrink-0 ${isActive ? "text-blue-600" : "text-slate-400"}`}
                name={item.icon}
              />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
