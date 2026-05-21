"use client";

import { AdminIcon, type AdminIconName } from "../admin-shell";

export type SettingsSection =
  | "branches"
  | "registers"
  | "site-settings"
  | "store-credit"
  | "loyalty-program"
  | "gift-voucher"
  | "customer-groups"
  | "discount"
  | "billing"
  | "inventory-settings"
  | "pos-settings"
  | "notifications"
  | "message";

export const settingsNavGroups: {
  title: string;
  items: { id: SettingsSection; label: string; icon: AdminIconName }[];
}[] = [
  {
    title: "General",
    items: [
      { id: "branches", label: "Branches", icon: "store" },
      { id: "registers", label: "Registers", icon: "pos" },
      { id: "site-settings", label: "Site Settings", icon: "settings" },
    ],
  },
  {
    title: "Finance",
    items: [
      { id: "store-credit", label: "Store Credit & Refund", icon: "discount" },
      { id: "loyalty-program", label: "Loyalty Program", icon: "tag" },
      { id: "gift-voucher", label: "Gift Voucher", icon: "voucher" },
      { id: "customer-groups", label: "Customer Groups", icon: "reviews" },
      { id: "discount", label: "Discount", icon: "discount" },
      { id: "billing", label: "Billing & Subscription", icon: "orders" },
    ],
  },
  {
    title: "Operations",
    items: [
      { id: "inventory-settings", label: "Inventory Settings", icon: "stock" },
      { id: "pos-settings", label: "POS Settings", icon: "pos" },
    ],
  },
  {
    title: "Communication",
    items: [
      { id: "notifications", label: "Notification Settings", icon: "settings" },
      { id: "message", label: "Message", icon: "reviews" },
    ],
  },
];

export const settingsSectionMeta: Record<
  SettingsSection,
  { title: string; description: string }
> = {
  branches: { title: "Branches", description: "A list of all of your branches." },
  registers: { title: "Registers", description: "Manage your POS registers." },
  "site-settings": { title: "Site Settings", description: "Manage & customize your website content & interface." },
  "store-credit": { title: "Store Credit & Refund", description: "Configure store credit and refund policies." },
  "loyalty-program": { title: "Loyalty Program", description: "Manage customer loyalty rewards." },
  "gift-voucher": { title: "Gift Voucher", description: "Configure gift voucher settings." },
  "customer-groups": { title: "Customer Groups", description: "Manage customer segments and groups." },
  discount: { title: "Discount", description: "Configure discount rules and codes." },
  billing: { title: "Billing & Subscription", description: "Manage your billing and subscription plan." },
  "inventory-settings": { title: "Inventory Settings", description: "Configure inventory management settings." },
  "pos-settings": { title: "POS Settings", description: "Configure point of sale settings." },
  notifications: { title: "Notification Settings", description: "Manage notification preferences." },
  message: { title: "Message", description: "Configure messaging settings." },
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
