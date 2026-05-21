"use client";

import { useEffect, useState } from "react";
import { AdminIcon } from "../../_components/admin-shell";
import { SettingsNav, settingsSectionMeta, type SettingsSection } from "../../_components/settings/settings-nav";
import { BranchesSection } from "../../_components/settings/branches-section";
import { PlaceholderSection } from "../../_components/settings/placeholder-section";
import { WebsiteSection } from "../../_components/settings/website-section";
import { Button, Card, Input, Select, Badge } from "../../_components/enterprise-ui";
import { apiRequest } from "../../../../lib/admin-api";

// ─── Reusable helpers ────────────────────────────────────────────────────────

function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
      <p className="mt-0.5 text-sm font-medium text-slate-500">{description}</p>
    </div>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-6 py-4">
        <h3 className="text-sm font-medium text-slate-800">{title}</h3>
        {description && <p className="mt-0.5 text-xs font-medium text-slate-500">{description}</p>}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      aria-checked={checked}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
        checked ? "bg-blue-600" : "bg-slate-200"
      }`}
      onClick={() => onChange(!checked)}
      role="switch"
      type="button"
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {description && <p className="mt-0.5 text-xs font-medium text-slate-500">{description}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function SaveBar({ onSave }: { onSave: () => void }) {
  return (
    <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
      <Button size="md" variant="neutral" type="button">
        Discard
      </Button>
      <Button size="md" variant="primary" type="button" onClick={onSave}>
        Save Changes
      </Button>
    </div>
  );
}

// ─── Section: Registers ──────────────────────────────────────────────────────

function RegistersSection() {
  return (
    <>
      <PageHeader title="Registers" description="Manage your POS registers." />
      <SectionCard title="Register List" description="All active POS registers in your store.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-left">
            <thead>
              <tr className="border-b border-slate-100">
                {["Name", "Branch", "Status", "Actions"].map((h) => (
                  <th className="pb-3 text-xs font-medium uppercase tracking-wide text-slate-500" key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { name: "Register 1", branch: "Main Branch", active: true },
                { name: "Register 2", branch: "Main Branch", active: false },
              ].map((r) => (
                <tr className="hover:bg-slate-50/60" key={r.name}>
                  <td className="py-3.5 text-sm font-medium text-slate-800">{r.name}</td>
                  <td className="py-3.5 text-sm font-medium text-slate-600">{r.branch}</td>
                  <td className="py-3.5">
                    <Badge variant={r.active ? "success" : "neutral"}>{r.active ? "Active" : "Inactive"}</Badge>
                  </td>
                  <td className="py-3.5">
                    <button className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
                      <AdminIcon className="h-4 w-4" name="edit" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </>
  );
}

// ─── Section: Site Settings ──────────────────────────────────────────────────

function SiteSettingsSection() {
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [guestCheckout, setGuestCheckout] = useState(true);
  const [reviewsEnabled, setReviewsEnabled] = useState(true);
  const [timezone, setTimezone] = useState("Asia/Dhaka");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSiteSettings() {
      try {
        setLoading(true);
        const res = await apiRequest<{ shopName?: string; slogan?: string }>("/settings");
        if (res) {
          setSeoTitle(res.shopName || "");
          setSeoDesc(res.slogan || "");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSiteSettings();
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await apiRequest("/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopName: seoTitle,
          slogan: seoDesc,
        }),
      });
      alert("SEO and Site settings successfully saved!");
    } catch (err) {
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="py-8 text-center text-sm text-slate-500">Loading site settings...</div>;
  }

  return (
    <>
      <PageHeader title="Site Settings" description="Manage & customize your website content & interface." />
      <div className="space-y-5">
        <SectionCard title="SEO" description="Improve your store's search engine visibility.">
          <div className="space-y-4">
            <div>
              <FieldLabel>Meta Title</FieldLabel>
              <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Your store name — tagline" />
              <p className="mt-1 text-xs text-slate-400">{seoTitle.length}/60 characters recommended</p>
            </div>
            <div>
              <FieldLabel>Meta Description</FieldLabel>
              <textarea
                className="min-h-[80px] w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                onChange={(e) => setSeoDesc(e.target.value)}
                placeholder="Brief description of your store for search engines..."
                value={seoDesc}
              />
              <p className="mt-1 text-xs text-slate-400">{seoDesc.length}/160 characters recommended</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Regional" description="Configure timezone and locale settings.">
          <div className="max-w-xs">
            <FieldLabel>Timezone</FieldLabel>
            <Select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              options={[
                { value: "Asia/Dhaka", label: "Asia/Dhaka (GMT+6)" },
                { value: "Asia/Kolkata", label: "Asia/Kolkata (GMT+5:30)" },
                { value: "UTC", label: "UTC (GMT+0)" },
                { value: "America/New_York", label: "America/New_York (GMT-5)" },
                { value: "Europe/London", label: "Europe/London (GMT+0)" },
              ]}
            />
          </div>
        </SectionCard>

        <SectionCard title="Features" description="Enable or disable store features.">
          <div className="divide-y divide-slate-100">
            <ToggleRow label="Maintenance Mode" description="Temporarily take your store offline for visitors." checked={maintenanceMode} onChange={setMaintenanceMode} />
            <ToggleRow label="Guest Checkout" description="Allow customers to checkout without creating an account." checked={guestCheckout} onChange={setGuestCheckout} />
            <ToggleRow label="Product Reviews" description="Allow customers to leave reviews on products." checked={reviewsEnabled} onChange={setReviewsEnabled} />
          </div>
        </SectionCard>

        <SaveBar onSave={handleSave} />
      </div>
    </>
  );
}

// ─── Section: Store Credit ───────────────────────────────────────────────────

function StoreCreditSection() {
  const [creditEnabled, setCreditEnabled] = useState(true);
  const [refundAuto, setRefundAuto] = useState(false);
  const [refundDays, setRefundDays] = useState("7");

  return (
    <>
      <PageHeader title="Store Credit & Refund" description="Configure store credit and refund policies." />
      <div className="space-y-5">
        <SectionCard title="Store Credit">
          <ToggleRow label="Enable Store Credit" description="Allow customers to earn and spend store credit." checked={creditEnabled} onChange={setCreditEnabled} />
        </SectionCard>
        <SectionCard title="Refund Policy">
          <div className="space-y-4">
            <ToggleRow label="Auto-approve Refunds" description="Automatically approve refund requests." checked={refundAuto} onChange={setRefundAuto} />
            <div className="max-w-xs">
              <FieldLabel>Refund Window (days)</FieldLabel>
              <Input type="number" value={refundDays} onChange={(e) => setRefundDays(e.target.value)} placeholder="7" />
            </div>
          </div>
        </SectionCard>
        <SaveBar onSave={() => {}} />
      </div>
    </>
  );
}

// ─── Section: Loyalty Program ────────────────────────────────────────────────

function LoyaltySection() {
  const [enabled, setEnabled] = useState(false);
  const [pointsPerUnit, setPointsPerUnit] = useState("1");
  const [redeemRate, setRedeemRate] = useState("100");

  return (
    <>
      <PageHeader title="Loyalty Program" description="Reward customers for their purchases." />
      <div className="space-y-5">
        <SectionCard title="Program Settings">
          <div className="space-y-4">
            <ToggleRow label="Enable Loyalty Program" description="Customers earn points on every purchase." checked={enabled} onChange={setEnabled} />
            {enabled && (
              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <div>
                  <FieldLabel required>Points per ৳1 spent</FieldLabel>
                  <Input type="number" value={pointsPerUnit} onChange={(e) => setPointsPerUnit(e.target.value)} placeholder="1" />
                </div>
                <div>
                  <FieldLabel required>Points needed for ৳1 discount</FieldLabel>
                  <Input type="number" value={redeemRate} onChange={(e) => setRedeemRate(e.target.value)} placeholder="100" />
                </div>
              </div>
            )}
          </div>
        </SectionCard>
        <SaveBar onSave={() => {}} />
      </div>
    </>
  );
}

// ─── Section: Billing ────────────────────────────────────────────────────────

function BillingSection() {
  return (
    <>
      <PageHeader title="Billing & Subscription" description="Manage your plan and payment details." />
      <div className="space-y-5">
        <SectionCard title="Current Plan">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-base font-semibold text-slate-800">Free Plan</p>
                <Badge variant="info">Active</Badge>
              </div>
              <p className="mt-1 text-sm font-medium text-slate-500">Up to 100 products · 1 branch · Basic analytics</p>
            </div>
            <Button variant="primary" size="md">Upgrade Plan</Button>
          </div>
        </SectionCard>
        <SectionCard title="Usage">
          {[
            { label: "Products", used: 24, limit: 100 },
            { label: "Orders this month", used: 87, limit: 500 },
            { label: "Storage", used: 1.2, limit: 5, unit: "GB" },
          ].map((item) => (
            <div className="mb-4 last:mb-0" key={item.label}>
              <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-600">
                <span>{item.label}</span>
                <span>{item.used}{item.unit ?? ""} / {item.limit}{item.unit ?? ""}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${Math.min((item.used / item.limit) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </SectionCard>
      </div>
    </>
  );
}

// ─── Section: Notifications ──────────────────────────────────────────────────

function NotificationsSection() {
  const [newOrder, setNewOrder] = useState(true);
  const [lowStock, setLowStock] = useState(true);
  const [newReview, setNewReview] = useState(false);
  const [newUser, setNewUser] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);

  return (
    <>
      <PageHeader title="Notification Settings" description="Choose what you want to be notified about." />
      <div className="space-y-5">
        <SectionCard title="Events" description="Get notified when these events occur.">
          <div className="divide-y divide-slate-100">
            <ToggleRow label="New Order" description="Notify when a new order is placed." checked={newOrder} onChange={setNewOrder} />
            <ToggleRow label="Low Stock Alert" description="Notify when product stock falls below threshold." checked={lowStock} onChange={setLowStock} />
            <ToggleRow label="New Review" description="Notify when a customer leaves a review." checked={newReview} onChange={setNewReview} />
            <ToggleRow label="New Customer" description="Notify when a new customer registers." checked={newUser} onChange={setNewUser} />
          </div>
        </SectionCard>
        <SectionCard title="Channels" description="How you want to receive notifications.">
          <div className="divide-y divide-slate-100">
            <ToggleRow label="Email Notifications" description="Receive notifications via email." checked={emailNotif} onChange={setEmailNotif} />
            <ToggleRow label="SMS Notifications" description="Receive notifications via SMS." checked={smsNotif} onChange={setSmsNotif} />
          </div>
        </SectionCard>
        <SaveBar onSave={() => {}} />
      </div>
    </>
  );
}

// ─── Section: Inventory Settings ─────────────────────────────────────────────

function InventorySettingsSection() {
  const [trackInventory, setTrackInventory] = useState(true);
  const [allowNegative, setAllowNegative] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState("5");

  return (
    <>
      <PageHeader title="Inventory Settings" description="Configure how inventory is tracked and managed." />
      <div className="space-y-5">
        <SectionCard title="Tracking">
          <div className="divide-y divide-slate-100">
            <ToggleRow label="Track Inventory" description="Enable stock tracking for all products." checked={trackInventory} onChange={setTrackInventory} />
            <ToggleRow label="Allow Negative Stock" description="Allow orders even when stock reaches zero." checked={allowNegative} onChange={setAllowNegative} />
          </div>
        </SectionCard>
        <SectionCard title="Alerts">
          <div className="max-w-xs">
            <FieldLabel required>Low Stock Threshold</FieldLabel>
            <Input type="number" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)} placeholder="5" />
            <p className="mt-1 text-xs text-slate-400">Alert when stock falls below this number.</p>
          </div>
        </SectionCard>
        <SaveBar onSave={() => {}} />
      </div>
    </>
  );
}

// ─── Section: POS Settings ───────────────────────────────────────────────────

function PosSettingsSection() {
  const [printReceipt, setPrintReceipt] = useState(true);
  const [cashDrawer, setCashDrawer] = useState(false);
  const [taxOnPos, setTaxOnPos] = useState(true);

  return (
    <>
      <PageHeader title="POS Settings" description="Configure your point of sale experience." />
      <div className="space-y-5">
        <SectionCard title="Hardware">
          <div className="divide-y divide-slate-100">
            <ToggleRow label="Auto-print Receipt" description="Automatically print receipt after each sale." checked={printReceipt} onChange={setPrintReceipt} />
            <ToggleRow label="Cash Drawer" description="Open cash drawer after each cash payment." checked={cashDrawer} onChange={setCashDrawer} />
          </div>
        </SectionCard>
        <SectionCard title="Tax">
          <ToggleRow label="Apply Tax on POS Sales" description="Include tax calculation in POS transactions." checked={taxOnPos} onChange={setTaxOnPos} />
        </SectionCard>
        <SaveBar onSave={() => {}} />
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

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
