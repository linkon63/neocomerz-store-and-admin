"use client";

import { useState } from "react";
import { AdminIcon, type AdminIconName } from "../../_components/admin-shell";
import { Button, Card, Input, Select, Badge } from "../../_components/enterprise-ui";

// ─── Types ────────────────────────────────────────────────────────────────────

type SiteSection = "general" | "contacts" | "manage-policy" | "campaigns";
type PolicyTab = "delivery" | "refund" | "cancellation" | "privacy" | "terms";
type EmailField = { id: string; title: string; email: string };
type PhoneField = { id: string; title: string; number: string };
type Campaign = { id: string; name: string; slug: string; description: string; isActive: boolean };

// ─── Nav ──────────────────────────────────────────────────────────────────────

const siteNav: { id: SiteSection; label: string; icon: AdminIconName; description: string }[] = [
  { id: "general", label: "General", icon: "settings", description: "Store info, branding & integrations" },
  { id: "contacts", label: "Contact & Social", icon: "reviews", description: "Emails, phones & social links" },
  { id: "manage-policy", label: "Policy Pages", icon: "orders", description: "Legal & policy content" },
  { id: "campaigns", label: "Campaigns", icon: "discount", description: "Marketing campaigns" },
];

// ─── Shared helpers ───────────────────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
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

function ToggleRow({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div>
        <p className="text-sm font-black text-slate-700">{label}</p>
        {description && <p className="mt-0.5 text-xs font-medium text-slate-500">{description}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-6 py-4">
        <h3 className="text-sm font-black text-slate-800">{title}</h3>
        {description && <p className="mt-0.5 text-xs font-medium text-slate-500">{description}</p>}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function SaveBar() {
  return (
    <div className="flex justify-end gap-3 border-t border-slate-100 pt-5 mt-6">
      <Button size="md" variant="neutral" type="button">Discard</Button>
      <Button size="md" variant="primary" type="button">Save Changes</Button>
    </div>
  );
}

// ─── General Panel ────────────────────────────────────────────────────────────

function GeneralPanel() {
  const [storeName, setStoreName] = useState("");
  const [currency, setCurrency] = useState("BDT");
  const [language, setLanguage] = useState("en");
  const [logoMode, setLogoMode] = useState<"light" | "dark">("light");
  const [logos, setLogos] = useState<{ icon: File | null; full: File | null; text: File | null }>({ icon: null, full: null, text: null });
  const [displayTopBar, setDisplayTopBar] = useState(true);
  const [topBarText, setTopBarText] = useState("");
  const [hideOutOfStock, setHideOutOfStock] = useState(false);
  const [insideCharge, setInsideCharge] = useState("");
  const [outsideCharge, setOutsideCharge] = useState("");
  const [googleTagId, setGoogleTagId] = useState("");
  const [pixelId, setPixelId] = useState("");
  const [copyright, setCopyright] = useState("");
  const [enableSteadfast, setEnableSteadfast] = useState(false);
  const [courierKey, setCourierKey] = useState("");
  const [courierSecret, setCourierSecret] = useState("");
  const [deliveryType, setDeliveryType] = useState("Home Delivery");

  const logoSlots: { key: keyof typeof logos; label: string; hint: string }[] = [
    { key: "icon", label: "Icon Only", hint: "Square, min 64×64px" },
    { key: "full", label: "Icon + Text", hint: "Horizontal, min 200×60px" },
    { key: "text", label: "Text Only", hint: "Transparent background" },
  ];

  return (
    <div className="space-y-5">
      {/* Basic Info */}
      <SectionCard title="Basic Information" description="Your store name, currency, and default language.">
        <div className="space-y-4">
          <div>
            <FieldLabel required>Store Name</FieldLabel>
            <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="e.g. NeoComerz" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel required>Default Currency</FieldLabel>
              <Select value={currency} onChange={(e) => setCurrency(e.target.value)} options={[
                { value: "BDT", label: "BDT — Bangladeshi Taka" },
                { value: "USD", label: "USD — US Dollar" },
                { value: "EUR", label: "EUR — Euro" },
                { value: "GBP", label: "GBP — British Pound" },
              ]} />
            </div>
            <div>
              <FieldLabel required>Default Language</FieldLabel>
              <Select value={language} onChange={(e) => setLanguage(e.target.value)} options={[
                { value: "en", label: "English" },
                { value: "bn", label: "Bengali" },
              ]} />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Branding */}
      <SectionCard title="Branding" description="Upload logos for light and dark themes.">
        <div className="mb-4 inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
          {(["light", "dark"] as const).map((mode) => (
            <button
              className={`rounded-md px-4 py-1.5 text-xs font-black transition-all ${
                logoMode === mode ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
              key={mode}
              onClick={() => setLogoMode(mode)}
              type="button"
            >
              {mode === "light" ? "Light Mode" : "Dark Mode"}
            </button>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {logoSlots.map(({ key, label, hint }) => (
            <div key={key}>
              <div
                className="relative mb-2 flex h-24 w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 transition-colors hover:border-blue-300 hover:bg-blue-50/30"
                onClick={() => document.getElementById(`logo-${key}`)?.click()}
              >
                {logos[key] ? (
                  <>
                    <AdminIcon className="h-5 w-5 text-blue-500" name="image" />
                    <span className="max-w-[90%] truncate px-2 text-xs font-black text-slate-600">{logos[key]!.name}</span>
                    <button
                      className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 hover:text-red-500"
                      onClick={(e) => { e.stopPropagation(); setLogos((p) => ({ ...p, [key]: null })); }}
                      type="button"
                    >
                      <AdminIcon className="h-3 w-3" name="x" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400">
                      <AdminIcon className="h-4 w-4" name="plus" />
                    </div>
                    <span className="text-xs font-medium text-slate-400">Upload</span>
                  </>
                )}
              </div>
              <p className="text-center text-xs font-black text-slate-600">{label}</p>
              <p className="text-center text-[11px] text-slate-400">{hint}</p>
              <input accept="image/*" className="hidden" id={`logo-${key}`} onChange={(e) => setLogos((p) => ({ ...p, [key]: e.target.files?.[0] ?? null }))} type="file" />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Top Bar */}
      <SectionCard title="Top Bar" description="Announcement banner shown at the top of your website.">
        <div className="space-y-4">
          <ToggleRow label="Show Top Bar" description="Display a promotional banner to all visitors." checked={displayTopBar} onChange={setDisplayTopBar} />
          {displayTopBar && (
            <div className="max-w-lg">
              <FieldLabel>Banner Text</FieldLabel>
              <Input value={topBarText} onChange={(e) => setTopBarText(e.target.value)} placeholder="e.g. Free shipping on orders over ৳999" />
            </div>
          )}
        </div>
      </SectionCard>

      {/* Product Display */}
      <SectionCard title="Product Display">
        <ToggleRow label="Hide Out-of-Stock Products" description="Products with zero stock won't appear on the website." checked={hideOutOfStock} onChange={setHideOutOfStock} />
      </SectionCard>

      {/* Shipping */}
      <SectionCard title="Shipping Charges" description="Default delivery rates shown at checkout.">
        <div className="grid gap-4 sm:grid-cols-2 max-w-md">
          <div>
            <FieldLabel required>Inside Dhaka (৳)</FieldLabel>
            <Input type="number" value={insideCharge} onChange={(e) => setInsideCharge(e.target.value)} placeholder="60" />
          </div>
          <div>
            <FieldLabel required>Outside Dhaka (৳)</FieldLabel>
            <Input type="number" value={outsideCharge} onChange={(e) => setOutsideCharge(e.target.value)} placeholder="120" />
          </div>
        </div>
      </SectionCard>

      {/* Analytics */}
      <SectionCard title="Analytics & Tracking" description="Connect Google and Facebook tracking tools.">
        <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
          <div>
            <FieldLabel>Google Tag Manager ID</FieldLabel>
            <Input value={googleTagId} onChange={(e) => setGoogleTagId(e.target.value)} placeholder="G-XXXXXXXXXX" />
          </div>
          <div>
            <FieldLabel>Facebook Pixel ID</FieldLabel>
            <Input value={pixelId} onChange={(e) => setPixelId(e.target.value)} placeholder="123456789012345" />
          </div>
        </div>
      </SectionCard>

      {/* Copyright */}
      <SectionCard title="Copyright" description="Footer copyright text.">
        <div className="max-w-md">
          <FieldLabel>Company Name</FieldLabel>
          <Input value={copyright} onChange={(e) => setCopyright(e.target.value)} placeholder="NeoComerz Ltd." />
        </div>
      </SectionCard>

      {/* Courier */}
      <SectionCard title="Courier Integration" description="Connect SteadFast for automated dispatch.">
        <div className="space-y-4">
          <ToggleRow label="Enable SteadFast" description="Dispatch orders through SteadFast courier." checked={enableSteadfast} onChange={setEnableSteadfast} />
          {enableSteadfast && (
            <div className="space-y-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel>API Key</FieldLabel>
                  <Input type="password" value={courierKey} onChange={(e) => setCourierKey(e.target.value)} placeholder="Enter API key" />
                </div>
                <div>
                  <FieldLabel>Secret Key</FieldLabel>
                  <Input type="password" value={courierSecret} onChange={(e) => setCourierSecret(e.target.value)} placeholder="Enter secret key" />
                </div>
              </div>
              <div className="max-w-xs">
                <FieldLabel>Default Delivery Type</FieldLabel>
                <Select value={deliveryType} onChange={(e) => setDeliveryType(e.target.value)} options={[
                  { value: "Home Delivery", label: "Home Delivery" },
                  { value: "Express Delivery", label: "Express Delivery" },
                  { value: "Pickup Point", label: "Pickup Point" },
                ]} />
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      <SaveBar />
    </div>
  );
}

// ─── Contacts Panel ───────────────────────────────────────────────────────────

function ContactsPanel() {
  const [emails, setEmails] = useState<EmailField[]>([
    { id: "e1", title: "Support", email: "support@store.com" },
    { id: "e2", title: "Sales", email: "sales@store.com" },
  ]);
  const [phones, setPhones] = useState<PhoneField[]>([
    { id: "p1", title: "Customer Support", number: "+880 1234-567890" },
  ]);

  const socialFields: { icon: AdminIconName; label: string; placeholder: string }[] = [
    { icon: "brand", label: "Facebook", placeholder: "https://facebook.com/yourstore" },
    { icon: "tag", label: "TikTok", placeholder: "https://tiktok.com/@yourstore" },
    { icon: "reviews", label: "Instagram", placeholder: "https://instagram.com/yourstore" },
    { icon: "orders", label: "LinkedIn", placeholder: "https://linkedin.com/company/yourstore" },
    { icon: "report", label: "YouTube", placeholder: "https://youtube.com/@yourstore" },
    { icon: "discount", label: "Twitter / X", placeholder: "https://x.com/yourstore" },
  ];
  const [socialValues, setSocialValues] = useState<Record<string, string>>({});

  return (
    <div className="space-y-5">
      {/* Emails */}
      <SectionCard title="Email Addresses" description="Contact emails displayed on your website.">
        <div className="space-y-3">
          {emails.map((item, index) => (
            <div className="grid items-end gap-3 sm:grid-cols-[1fr_2fr_auto]" key={item.id}>
              <div>
                <FieldLabel>Label</FieldLabel>
                <Input value={item.title} onChange={(e) => setEmails((p) => p.map((x) => x.id === item.id ? { ...x, title: e.target.value } : x))} placeholder="e.g. Support" />
              </div>
              <div>
                <FieldLabel>Email Address</FieldLabel>
                <div className="relative">
                  <Input value={item.email} onChange={(e) => setEmails((p) => p.map((x) => x.id === item.id ? { ...x, email: e.target.value } : x))} placeholder="email@example.com" type="email" />
                  {index === 0 && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-black text-blue-600">Primary</span>
                  )}
                </div>
              </div>
              {index > 0 && (
                <button className="mb-0.5 grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-500" onClick={() => setEmails((p) => p.filter((x) => x.id !== item.id))} type="button">
                  <AdminIcon className="h-4 w-4" name="x" />
                </button>
              )}
            </div>
          ))}
          {emails.length < 3 && (
            <Button variant="neutral" size="sm" onClick={() => setEmails((p) => [...p, { id: `e-${Date.now()}`, title: "", email: "" }])}>
              + Add Email
            </Button>
          )}
        </div>
      </SectionCard>

      {/* Phones */}
      <SectionCard title="Phone Numbers" description="Contact numbers displayed on your website.">
        <div className="space-y-3">
          {phones.map((item, index) => (
            <div className="grid items-end gap-3 sm:grid-cols-[1fr_2fr_auto]" key={item.id}>
              <div>
                <FieldLabel>Label</FieldLabel>
                <Input value={item.title} onChange={(e) => setPhones((p) => p.map((x) => x.id === item.id ? { ...x, title: e.target.value } : x))} placeholder="e.g. Support" />
              </div>
              <div>
                <FieldLabel>Phone Number</FieldLabel>
                <div className="relative">
                  <Input value={item.number} onChange={(e) => setPhones((p) => p.map((x) => x.id === item.id ? { ...x, number: e.target.value } : x))} placeholder="+880 1234-567890" type="tel" />
                  {index === 0 && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-black text-blue-600">Primary</span>
                  )}
                </div>
              </div>
              {index > 0 && (
                <button className="mb-0.5 grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-500" onClick={() => setPhones((p) => p.filter((x) => x.id !== item.id))} type="button">
                  <AdminIcon className="h-4 w-4" name="x" />
                </button>
              )}
            </div>
          ))}
          {phones.length < 4 && (
            <Button variant="neutral" size="sm" onClick={() => setPhones((p) => [...p, { id: `p-${Date.now()}`, title: "", number: "" }])}>
              + Add Phone
            </Button>
          )}
        </div>
      </SectionCard>

      {/* Social */}
      <SectionCard title="Social Media" description="Links to your social media profiles.">
        <div className="space-y-3">
          {socialFields.map(({ icon, label, placeholder }) => (
            <div className="flex items-center gap-3" key={label}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-slate-50">
                <AdminIcon className="h-4 w-4 text-slate-500" name={icon} />
              </span>
              <div className="w-24 shrink-0">
                <p className="text-xs font-black text-slate-600">{label}</p>
              </div>
              <div className="flex-1">
                <Input value={socialValues[label] ?? ""} onChange={(e) => setSocialValues((p) => ({ ...p, [label]: e.target.value }))} placeholder={placeholder} type="url" />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SaveBar />
    </div>
  );
}

// ─── Policy Panel ─────────────────────────────────────────────────────────────

function PolicyPanel() {
  const [activePolicy, setActivePolicy] = useState<PolicyTab>("delivery");
  const [contents, setContents] = useState<Record<PolicyTab, string>>({
    delivery: "Our delivery policy outlines how we ship and deliver products to our customers.",
    refund: "We want you to be completely satisfied. Refunds are accepted within 30 days of delivery.",
    cancellation: "You can cancel your order before it ships. Contact support for assistance.",
    privacy: "We take your privacy seriously. This policy describes how we collect and protect your data.",
    terms: "By using our website, you agree to these terms and conditions.",
  });

  const policyTabs: { id: PolicyTab; label: string }[] = [
    { id: "delivery", label: "Delivery" },
    { id: "refund", label: "Refund & Return" },
    { id: "cancellation", label: "Cancellation" },
    { id: "privacy", label: "Privacy Policy" },
    { id: "terms", label: "Terms & Conditions" },
  ];

  const currentLabel = policyTabs.find((t) => t.id === activePolicy)?.label ?? "";

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white">
        {/* Tab bar */}
        <div className="border-b border-slate-100">
          <nav className="flex gap-0.5 overflow-x-auto px-4 pt-1">
            {policyTabs.map((tab) => (
              <button
                className={`whitespace-nowrap border-b-2 px-4 py-3 text-xs font-black transition-colors ${
                  activePolicy === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
                key={tab.id}
                onClick={() => setActivePolicy(tab.id)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="px-6 py-5">
          <div className="mb-4">
            <FieldLabel>Page Title</FieldLabel>
            <Input value={currentLabel} disabled className="max-w-sm" />
          </div>

          {/* Toolbar */}
          <div className="rounded-t-lg border border-slate-200 border-b-0 bg-slate-50 px-3 py-2">
            <div className="flex flex-wrap items-center gap-1">
              <select className="h-7 rounded border border-slate-200 bg-white px-2 text-xs font-black text-slate-700">
                <option>Paragraph</option>
                <option>Heading 1</option>
                <option>Heading 2</option>
                <option>Heading 3</option>
              </select>
              <div className="mx-1 h-4 w-px bg-slate-200" />
              {["B", "I", "U"].map((t) => (
                <button className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-white text-xs font-black text-slate-700 hover:bg-slate-100" key={t} type="button">{t}</button>
              ))}
              <div className="mx-1 h-4 w-px bg-slate-200" />
              <button className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-white hover:bg-slate-100" type="button">
                <AdminIcon className="h-3.5 w-3.5 text-slate-600" name="link" />
              </button>
              <div className="mx-1 h-4 w-px bg-slate-200" />
              {["• List", "1. List"].map((t) => (
                <button className="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-black text-slate-700 hover:bg-slate-100" key={t} type="button">{t}</button>
              ))}
            </div>
          </div>

          <textarea
            className="min-h-56 w-full rounded-b-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            onChange={(e) => setContents((p) => ({ ...p, [activePolicy]: e.target.value }))}
            placeholder={`Enter your ${currentLabel.toLowerCase()} content here...`}
            rows={10}
            value={contents[activePolicy]}
          />
          <p className="mt-1.5 text-xs text-slate-400">{contents[activePolicy].length} characters</p>

          <div className="mt-5 flex justify-end gap-3">
            <Button variant="neutral" size="md" type="button">Discard</Button>
            <Button variant="primary" size="md" type="button">Save Changes</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Campaigns Panel ──────────────────────────────────────────────────────────

function CampaignsPanel() {
  const [search, setSearch] = useState("");
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    { id: "1", name: "Exclusive Limited Offers", slug: "exclusive-limited-offers", description: "Special offers for a limited time", isActive: true },
    { id: "2", name: "Hero Sliders", slug: "hero-sliders", description: "Homepage banner carousel", isActive: true },
    { id: "3", name: "Flash Sale Weekend", slug: "flash-sale-weekend", description: "Weekend special discount event", isActive: false },
  ]);

  const filtered = campaigns.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.slug.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800">Campaigns</h2>
          <p className="mt-0.5 text-sm font-medium text-slate-500">{filtered.length} campaign{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2.5">
          <button className="grid h-9 w-9 place-items-center rounded-lg border border-slate-300 bg-white hover:bg-slate-50" type="button">
            <AdminIcon className="h-4 w-4 text-slate-500" name="refresh" />
          </button>
          <Button variant="primary" size="md" icon={<AdminIcon className="h-4 w-4" name="plus" />}>
            Add Campaign
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-4">
          <div className="max-w-sm">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search campaigns..."
              icon={<AdminIcon className="h-4 w-4" name="search" />}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {["Campaign Name", "Slug", "Description", "Status", "Actions"].map((h) => (
                  <th className="px-5 py-3.5 text-xs font-black uppercase tracking-wide text-slate-500" key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr>
                  <td className="px-5 py-12 text-center text-sm font-medium text-slate-400" colSpan={5}>
                    No campaigns found
                  </td>
                </tr>
              ) : filtered.map((c) => (
                <tr className="group hover:bg-slate-50/80" key={c.id}>
                  <td className="px-5 py-4">
                    <span className="text-sm font-black text-slate-800">{c.name}</span>
                  </td>
                  <td className="px-5 py-4">
                    <code className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-black text-slate-600">{c.slug}</code>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-medium text-slate-500">{c.description}</span>
                  </td>
                  <td className="px-5 py-4">
                    <Toggle
                      checked={c.isActive}
                      onChange={() => setCampaigns((p) => p.map((x) => x.id === c.id ? { ...x, isActive: !x.isActive } : x))}
                    />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <button className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50" type="button">
                        <AdminIcon className="h-3.5 w-3.5" name="edit" />
                      </button>
                      <button className="grid h-8 w-8 place-items-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50" type="button">
                        <AdminIcon className="h-3.5 w-3.5" name="x" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const panelComponents: Record<SiteSection, React.ComponentType> = {
  general: GeneralPanel,
  contacts: ContactsPanel,
  "manage-policy": PolicyPanel,
  campaigns: CampaignsPanel,
};

export default function ManageWebsitePage() {
  const [active, setActive] = useState<SiteSection>("general");
  const ActivePanel = panelComponents[active];

  return (
    <div className="flex gap-8">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="sticky top-8 rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-black text-slate-800">Manage Website</h2>
            <p className="mt-0.5 text-xs font-medium text-slate-500">Configure your storefront</p>
          </div>
          <nav className="py-2">
            {siteNav.map((item) => {
              const isActive = active === item.id;
              return (
                <button
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                    isActive ? "bg-blue-50" : "hover:bg-slate-50"
                  }`}
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  type="button"
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                    isActive ? "border-blue-200 bg-blue-100 text-blue-600" : "border-slate-200 bg-slate-50 text-slate-400"
                  }`}>
                    <AdminIcon className="h-4 w-4" name={item.icon} />
                  </span>
                  <div className="min-w-0">
                    <p className={`truncate text-sm font-black ${isActive ? "text-blue-700" : "text-slate-700"}`}>{item.label}</p>
                    <p className="truncate text-[11px] font-medium text-slate-400">{item.description}</p>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="mb-4 lg:hidden">
        <select
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-black text-slate-700 outline-none"
          onChange={(e) => setActive(e.target.value as SiteSection)}
          value={active}
        >
          {siteNav.map((item) => (
            <option key={item.id} value={item.id}>{item.label}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="mb-6">
          <h1 className="text-xl font-black text-slate-800">
            {siteNav.find((n) => n.id === active)?.label}
          </h1>
          <p className="mt-0.5 text-sm font-medium text-slate-500">
            {siteNav.find((n) => n.id === active)?.description}
          </p>
        </div>
        <ActivePanel />
      </div>
    </div>
  );
}
