"use client";

import { AdminIcon, type AdminIconName } from "../admin-shell";

export type SettingsSection =
  | "general"
  | "contacts"
  | "manage-policy"
  | "campaigns"
  | "branches"
  | "users"
  | "roles"
  | "activity-logs";

export const settingsNavGroups: {
  title: string;
  items: { id: SettingsSection; label: string; icon: AdminIconName }[];
}[] = [
  {
    title: "Store Settings",
    items: [
      { id: "general", label: "General & Branding", icon: "settings" },
      { id: "contacts", label: "Contact & Socials", icon: "reviews" },
      { id: "manage-policy", label: "Policy Pages", icon: "orders" },
      { id: "campaigns", label: "Banners & Campaigns", icon: "discount" },
      { id: "branches", label: "Store Branches", icon: "store" },
    ],
  },
  {
    title: "Access & Security",
    items: [
      { id: "users", label: "Users Management", icon: "user" },
      { id: "roles", label: "Roles & Permissions", icon: "variants" },
      { id: "activity-logs", label: "Activity Logs", icon: "refresh" },
    ],
  },
];

export const settingsSectionMeta: Record<
  SettingsSection,
  { title: string; description: string }
> = {
  general: { title: "General & Branding", description: "Store metadata, shipping rates, and branding copyrights." },
  contacts: { title: "Contact & Socials", description: "Manage customer helpline, support emails, and social links." },
  "manage-policy": { title: "Policy Pages", description: "Customize delivery, return, cancellation, and privacy terms." },
  campaigns: { title: "Banners & Campaigns", description: "Configure landing page promotional banners and active campaigns." },
  branches: { title: "Store Branches", description: "Manage physical store locations and contact details." },
  users: { title: "Users Management", description: "Create and manage system user accounts and credentials." },
  roles: { title: "Roles & Permissions", description: "Configure custom security roles and restrict API permission access." },
  "activity-logs": { title: "Activity Logs", description: "Chronological audit logs of actions taken by administrators." },
};

export function SettingsNav({
  active,
  onChange,
}: {
  active: SettingsSection;
  onChange: (section: SettingsSection) => void;
}) {
  return (
    <nav className="py-3">
      {settingsNavGroups.map((group) => (
        <div className="mb-1" key={group.title}>
          <p className="px-5 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            {group.title}
          </p>
          {group.items.map((item) => {
            const isActive = active === item.id;
            return (
              <button
                className={`flex w-full items-center gap-2.5 px-5 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-blue-50 font-semibold text-blue-700"
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
        </div>
      ))}
    </nav>
  );
}
