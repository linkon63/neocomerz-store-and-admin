"use client";

import { useState } from "react";
import { SettingsNav, settingsSectionMeta, type SettingsSection } from "../../_components/settings/settings-nav";
import { BranchesSection } from "../../_components/settings/branches-section";
import { PlaceholderSection } from "../../_components/settings/placeholder-section";
import { WebsiteSection } from "../../_components/settings/website-section";

import { RegistersSection } from "../../_components/settings/registers-section";
import { SiteSettingsSection } from "../../_components/settings/site-settings-section";
import { StoreCreditSection } from "../../_components/settings/store-credit-section";
import { LoyaltySection } from "../../_components/settings/loyalty-section";
import { BillingSection } from "../../_components/settings/billing-section";
import { NotificationsSection } from "../../_components/settings/notifications-section";
import { InventorySettingsSection } from "../../_components/settings/inventory-settings-section";
import { PosSettingsSection } from "../../_components/settings/pos-settings-section";

const sectionComponents: Record<SettingsSection, React.ComponentType> = {
  branches: BranchesSection,
  registers: RegistersSection,
  "site-settings": SiteSettingsSection,
  website: WebsiteSection,
  "store-credit": StoreCreditSection,
  "loyalty-program": LoyaltySection,
  "gift-voucher": () => <PlaceholderSection title="Gift Voucher Settings" />,
  "customer-groups": () => <PlaceholderSection title="Customer Groups" />,
  discount: () => <PlaceholderSection title="Discount Settings" />,
  billing: BillingSection,
  "inventory-settings": InventorySettingsSection,
  "pos-settings": PosSettingsSection,
  notifications: NotificationsSection,
  message: () => <PlaceholderSection title="Message Settings" />,
};

export default function SettingsPage() {
  const [active, setActive] = useState<SettingsSection>("branches");
  const ActiveSection = sectionComponents[active];

  return (
    <div className="flex gap-8">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="sticky top-8 rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-medium text-slate-800">Settings</h2>
          </div>
          <SettingsNav active={active} onChange={setActive} />
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="mb-4 lg:hidden">
        <select
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none"
          onChange={(e) => setActive(e.target.value as SettingsSection)}
          value={active}
        >
          {(Object.keys(sectionComponents) as SettingsSection[]).map((key) => (
            <option key={key} value={key}>
              {settingsSectionMeta[key].title}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <ActiveSection />
      </div>
    </div>
  );
}
