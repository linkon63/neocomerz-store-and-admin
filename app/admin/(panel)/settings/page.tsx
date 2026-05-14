"use client";

import { useState } from "react";
import { AdminIcon, type AdminIconName } from "../../_components/admin-shell";

// ─── Types ────────────────────────────────────────────────────────────────────

type Section =
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

// ─── Secondary sidebar nav groups ────────────────────────────────────────────

const navGroups: {
  title: string;
  items: { id: Section; label: string; icon: AdminIconName }[];
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

const sectionMeta: Record<Section, { title: string; description: string }> = {
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

// ─── Shared primitives ────────────────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <span className="mb-1.5 block text-sm font-black text-slate-700">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </span>
  );
}

function TextInput({
  value, onChange, placeholder, type = "text", disabled,
}: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; disabled?: boolean;
}) {
  return (
    <input
      className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      type={type}
      value={value}
    />
  );
}

function StatusToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      aria-checked={checked}
      className={`inline-flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-colors ${
        checked ? "bg-blue-600" : "bg-slate-200"
      }`}
      onClick={() => onChange(!checked)}
      role="switch"
      type="button"
    >
      <span
        className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

// ─── Branches section ─────────────────────────────────────────────────────────

type Branch = { id: string; name: string; address: string; isActive: boolean };

function BranchesSection() {
  const [search, setSearch] = useState("");
  const [branches, setBranches] = useState<Branch[]>([
    { id: "1", name: "Main Branch", address: "Dhaka", isActive: true },
  ]);

  const filtered = branches.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800">Branch list</h2>
          <p className="text-sm font-medium text-slate-500">
            Displaying {filtered.length} branch
          </p>
        </div>
        <div className="flex gap-3">
          <button
            className="grid h-11 w-11 place-items-center rounded-lg border border-slate-300 bg-white hover:bg-slate-50"
            type="button"
          >
            <AdminIcon className="h-4 w-4" name="refresh" />
          </button>
          <button
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-black text-white hover:bg-blue-700"
            type="button"
          >
            <AdminIcon className="h-4 w-4" name="plus" />
            Add Branch
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200">
        <div className="border-b border-slate-200 p-4">
          <label className="flex h-11 max-w-xl items-center gap-3 rounded-lg border border-slate-300 px-4">
            <AdminIcon className="h-4 w-4 text-slate-400" name="search" />
            <input
              className="w-full bg-transparent text-sm font-medium outline-none"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Branches by name, address"
              value={search}
            />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left">
            <thead className="bg-slate-50">
              <tr>
                {["Name", "Address", "Status", "Actions"].map((h) => (
                  <th className="px-5 py-3.5 text-sm font-black text-slate-700" key={h}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((branch) => (
                <tr className="bg-white hover:bg-slate-50/60" key={branch.id}>
                  <td className="px-5 py-4 text-sm font-black text-slate-800">{branch.name}</td>
                  <td className="px-5 py-4 text-sm font-medium text-slate-600">{branch.address}</td>
                  <td className="px-5 py-4">
                    <StatusToggle
                      checked={branch.isActive}
                      onChange={(v) =>
                        setBranches((prev) =>
                          prev.map((b) => (b.id === branch.id ? { ...b, isActive: v } : b)),
                        )
                      }
                    />
                  </td>
                  <td className="px-5 py-4">
                    <button
                      className="grid h-8 w-8 place-items-center rounded-lg border border-slate-300 text-slate-500 hover:bg-slate-50"
                      type="button"
                    >
                      <AdminIcon className="h-4 w-4" name="edit" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ─── Placeholder for unbuilt sections ─────────────────────────────────────────

function PlaceholderSection({ title }: { title: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 py-20 text-center">
      <AdminIcon className="mx-auto mb-3 h-8 w-8 text-slate-300" name="settings" />
      <p className="font-black text-slate-400">{title}</p>
      <p className="mt-1 text-sm font-medium text-slate-400">Coming soon</p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>("branches");

  const meta = sectionMeta[activeSection];

  function renderContent() {
    if (activeSection === "branches") return <BranchesSection />;
    return <PlaceholderSection title={meta.title} />;
  }

  return (
    /* Negative margins cancel AdminShell padding — panels sit flush edge-to-edge */
    <div className="-mx-5 -my-7 flex min-h-screen sm:-mx-8 lg:-mx-10">

      {/* ── Secondary sidebar ── */}
      <aside className="w-[220px] shrink-0 overflow-y-auto border-r border-slate-200 bg-white">
        <nav className="py-3">
          {navGroups.map((group) => (
            <div className="mb-1" key={group.title}>
              <p className="px-5 pb-1 pt-4 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                {group.title}
              </p>
              {group.items.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    className={`flex w-full items-center gap-2.5 px-5 py-2.5 text-sm transition-colors ${
                      isActive
                        ? "bg-blue-50 font-black text-blue-700"
                        : "font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
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
      </aside>

      {/* ── Content area ── */}
      <div className="flex min-w-0 flex-1 flex-col bg-white">
        {/* Header: title + description */}
        <div className="border-b border-slate-200 px-8 py-6">
          <h1 className="text-3xl font-black text-slate-900">{meta.title}</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">{meta.description}</p>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-8 py-7">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
