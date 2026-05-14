"use client";

import { useState } from "react";
import { AdminIcon, type AdminIconName } from "../../_components/admin-shell";

// ─── Types ────────────────────────────────────────────────────────────────────

type SiteSection = "general" | "contacts" | "manage-policy" | "campaigns";
type PolicyTab = "delivery" | "refund" | "cancellation" | "privacy" | "terms";
type EmailField = { id: string; title: string; email: string };
type PhoneField = { id: string; title: string; number: string };
type Campaign = { id: string; name: string; slug: string; description: string; isActive: boolean };

// ─── Sidebar nav ──────────────────────────────────────────────────────────────

const siteNav: { id: SiteSection; label: string; icon: AdminIconName }[] = [
  { id: "general", label: "General", icon: "settings" },
  { id: "contacts", label: "Contact & Social Media", icon: "reviews" },
  { id: "manage-policy", label: "Manage Policy", icon: "orders" },
  { id: "campaigns", label: "Campaigns", icon: "discount" },
];

const sectionMeta: Record<SiteSection, { title: string; description: string }> = {
  "general": { title: "General", description: "Manage & customize your website content & interface." },
  "contacts": { title: "Contact & Social Media", description: "Manage & customize your website content & interface." },
  "manage-policy": { title: "Manage Policy", description: "Manage & customize your website content & interface." },
  "campaigns": { title: "Campaigns List", description: "Manage & customize your website content & interface." },
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
  value, onChange, placeholder, type = "text", disabled, required,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  type?: string; disabled?: boolean; required?: boolean;
}) {
  return (
    <input
      className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      type={type}
      value={value}
    />
  );
}

function SelectInput({ value, onChange, children }: {
  value: string; onChange: (v: string) => void; children: React.ReactNode;
}) {
  return (
    <select
      className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      onChange={(e) => onChange(e.target.value)}
      value={value}
    >
      {children}
    </select>
  );
}

function StatusToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      aria-checked={checked}
      className={`inline-flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-colors ${checked ? "bg-blue-600" : "bg-slate-200"}`}
      onClick={() => onChange(!checked)}
      role="switch"
      type="button"
    >
      <span className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

// ─── Row layout helper (left: label+desc, right: fields) ─────────────────────

function SectionRow({ title, description, children }: {
  title: string; description?: string; children: React.ReactNode;
}) {
  return (
    <div className="grid gap-6 border-b border-slate-100 py-8 last:border-0 md:grid-cols-[260px_1fr]">
      <div>
        <h3 className="font-black text-slate-800">{title}</h3>
        {description && <p className="mt-1 text-sm font-medium text-slate-500">{description}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
}

// ─── General panel ────────────────────────────────────────────────────────────

function GeneralPanel() {
  const [storeName, setStoreName] = useState("");
  const [currency, setCurrency] = useState("");
  const [language, setLanguage] = useState("");
  const [logoMode, setLogoMode] = useState<"light" | "dark">("light");
  const [logo, setLogo] = useState<File | null>(null);
  const [lightLogo, setLightLogo] = useState<File | null>(null);
  const [darkLogo, setDarkLogo] = useState<File | null>(null);
  const [displayTopBar, setDisplayTopBar] = useState(true);
  const [topBarSlogan, setTopBarSlogan] = useState("");
  const [hideOutOfStock, setHideOutOfStock] = useState(false);
  const [insideCharge, setInsideCharge] = useState("0");
  const [outsideCharge, setOutsideCharge] = useState("0");
  const [googleTagId, setGoogleTagId] = useState("");
  const [pixelId, setPixelId] = useState("");
  const [copyright, setCopyright] = useState("");
  const [hasParentCompany, setHasParentCompany] = useState(false);
  const [fraudKey, setFraudKey] = useState("");
  const [enableSteadfast, setEnableSteadfast] = useState(false);
  const [courierKey, setCourierKey] = useState("");
  const [courierSecret, setCourierSecret] = useState("");
  const [deliveryType, setDeliveryType] = useState("Home Delivery");

  return (
    <div>
      {/* Basic Info */}
      <SectionRow title="Basic Info" description="Update your store name, currency, contact etc.">
        <div className="space-y-4">
          <label className="block">
            <FieldLabel required>Shop Name</FieldLabel>
            <TextInput value={storeName} onChange={setStoreName} placeholder="Enter a shop name" required />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <FieldLabel required>Default Currency</FieldLabel>
              <SelectInput value={currency} onChange={setCurrency}>
                <option value="">Choose</option>
                <option value="BDT">BDT</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </SelectInput>
            </label>
            <label className="block">
              <FieldLabel required>Language</FieldLabel>
              <SelectInput value={language} onChange={setLanguage}>
                <option value="">Choose</option>
                <option value="en">English</option>
                <option value="bn">Bengali</option>
              </SelectInput>
            </label>
          </div>
        </div>
      </SectionRow>

      {/* Update Logo */}
      <SectionRow title="Update Logo" description="Add your logos as instructed to manage your website better.">
        <div>
          {/* Light / Dark mode toggle */}
          <div className="mb-5 flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 w-fit">
            {(["light", "dark"] as const).map((mode) => (
              <button
                className={`rounded-md px-4 py-1.5 text-sm font-black transition-colors ${
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

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: "Icon", file: logo, setter: setLogo },
              { label: "Icon + Text", file: lightLogo, setter: setLightLogo },
              { label: "Text Only", file: darkLogo, setter: setDarkLogo },
            ].map(({ label, file, setter }) => (
              <div key={label}>
                <div className="relative mb-2 flex h-28 w-full items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white">
                  {file ? (
                    <p className="truncate px-3 text-xs font-medium text-slate-600">{file.name}</p>
                  ) : (
                    <button
                      className="grid h-10 w-10 place-items-center rounded-full border border-slate-300 bg-white text-slate-400 hover:bg-slate-50"
                      type="button"
                      onClick={() => document.getElementById(`logo-${label}`)?.click()}
                    >
                      <AdminIcon className="h-5 w-5" name="plus" />
                    </button>
                  )}
                  <button
                    className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full border border-slate-300 bg-white text-slate-400 hover:bg-slate-50"
                    type="button"
                    onClick={() => setter(null)}
                  >
                    <AdminIcon className="h-3 w-3" name="x" />
                  </button>
                </div>
                <input
                  accept="image/*"
                  className="hidden"
                  id={`logo-${label}`}
                  onChange={(e) => setter(e.target.files?.[0] ?? null)}
                  type="file"
                />
                <p className="text-center text-xs font-medium text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionRow>

      {/* UI Settings */}
      <SectionRow title="UI Settings" description="Update your top bar.">
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              checked={displayTopBar}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              onChange={(e) => setDisplayTopBar(e.target.checked)}
              type="checkbox"
            />
            <span className="text-sm font-black text-slate-700">Display Top bar</span>
            <span className="text-xs font-medium text-slate-500">This will show the text in the center of the top bar.</span>
          </label>
          <label className="block max-w-md">
            <FieldLabel>Bar Text Content</FieldLabel>
            <TextInput value={topBarSlogan} onChange={setTopBarSlogan} placeholder="Enter top bar slogan" />
          </label>
        </div>
      </SectionRow>

      {/* Product Setting */}
      <SectionRow title="Product Setting" description="Manage out of stock product in reasons.">
        <label className="flex items-center gap-3">
          <input
            checked={hideOutOfStock}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            onChange={(e) => setHideOutOfStock(e.target.checked)}
            type="checkbox"
          />
          <span className="text-sm font-black text-slate-700">Hide Out of Stock Products</span>
          <span className="text-xs font-medium text-slate-500">Products will display in website if the products not in stock in inventory.</span>
        </label>
      </SectionRow>

      {/* Payment Methods */}
      <SectionRow title="Payment Methods" description="Add your payment methods to display on the home.">
        <div className="flex h-28 w-28 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white">
          <div className="text-center">
            <AdminIcon className="mx-auto h-6 w-6 text-slate-300" name="plus" />
            <p className="mt-1 text-xs font-medium text-slate-400">Payment Logo</p>
          </div>
        </div>
      </SectionRow>

      {/* Shipping Charge */}
      <SectionRow title="Shipping Charge" description="Update your shipping charge information here.">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <FieldLabel required>Inside Dhaka</FieldLabel>
            <TextInput value={insideCharge} onChange={setInsideCharge} placeholder="0" type="number" />
          </label>
          <label className="block">
            <FieldLabel required>Outside Dhaka</FieldLabel>
            <TextInput value={outsideCharge} onChange={setOutsideCharge} placeholder="0" type="number" />
          </label>
        </div>
      </SectionRow>

      {/* GTag & Pixel */}
      <SectionRow title="GTag & Pixel" description="Configure your Google Tag and Facebook Pixel IDs here.">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <FieldLabel>Google Tag Script ID</FieldLabel>
            <TextInput value={googleTagId} onChange={setGoogleTagId} placeholder="e.g. G-XXXXXXXX" />
          </label>
          <label className="block">
            <FieldLabel>Facebook Pixel ID</FieldLabel>
            <TextInput value={pixelId} onChange={setPixelId} placeholder="e.g. 123456789" />
          </label>
        </div>
      </SectionRow>

      {/* Copyright */}
      <SectionRow title="Copyright Information" description="Update your Copyright information here.">
        <div className="space-y-3">
          <label className="block max-w-lg">
            <FieldLabel>Copyright Year</FieldLabel>
            <TextInput value={copyright} onChange={setCopyright} placeholder="Enter your company name" />
          </label>
          <label className="flex items-start gap-3">
            <input
              checked={hasParentCompany}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              onChange={(e) => setHasParentCompany(e.target.checked)}
              type="checkbox"
            />
            <span className="text-sm font-medium text-slate-600">
              Do you have any parent company name?<br />
              <span className="text-slate-400">This will display with the copyright text.</span>
            </span>
          </label>
        </div>
      </SectionRow>

      {/* Fraud Checker */}
      <SectionRow title="Fraud Checker" description="Configure settings for the FraudChecker API integration.">
        <label className="block max-w-lg">
          <FieldLabel>Fraud Checker API Key</FieldLabel>
          <TextInput value={fraudKey} onChange={setFraudKey} placeholder="Enter valid api key" type="password" />
        </label>
      </SectionRow>

      {/* Courier Integration */}
      <SectionRow title="Courier Integration" description="Configure your courier credentials and keep the order label flow using the next delivery partners label.">
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              checked={enableSteadfast}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              onChange={(e) => setEnableSteadfast(e.target.checked)}
              type="checkbox"
            />
            <span className="text-sm font-black text-slate-700">Enable SteadFast</span>
            <span className="text-xs font-medium text-slate-500">Orders can be dispatched from the system order page when this provider is enabled and configured.</span>
          </label>
          <label className="block max-w-lg">
            <FieldLabel>API Key</FieldLabel>
            <TextInput value={courierKey} onChange={setCourierKey} placeholder="Enter valid API key" type="password" />
          </label>
          <label className="block max-w-lg">
            <FieldLabel>Secret Key</FieldLabel>
            <TextInput value={courierSecret} onChange={setCourierSecret} placeholder="Enter valid secret key" type="password" />
          </label>
          <label className="block max-w-xs">
            <FieldLabel>Default Delivery Type</FieldLabel>
            <SelectInput value={deliveryType} onChange={setDeliveryType}>
              <option value="Home Delivery">Home Delivery</option>
              <option value="Express Delivery">Express Delivery</option>
            </SelectInput>
          </label>
          <button className="h-11 rounded-lg bg-blue-600 px-6 text-sm font-black text-white hover:bg-blue-700" type="button">
            Save Courier Settings
          </button>
        </div>
      </SectionRow>
    </div>
  );
}

// ─── Contacts panel ───────────────────────────────────────────────────────────

function ContactsPanel() {
  const [emails, setEmails] = useState<EmailField[]>([
    { id: "e1", title: "Support Email", email: "" },
    { id: "e2", title: "General Inquiry", email: "" },
  ]);
  const [phones, setPhones] = useState<PhoneField[]>([
    { id: "p1", title: "Customer Support", number: "" },
    { id: "p2", title: "Sales Line", number: "" },
    { id: "p3", title: "Technical Helpdesk", number: "" },
  ]);
  const [facebook, setFacebook] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [youtube, setYoutube] = useState("");
  const [twitter, setTwitter] = useState("");

  function addEmail() {
    if (emails.length >= 2) return;
    setEmails((p) => [...p, { id: `e-${Date.now()}`, title: "", email: "" }]);
  }
  function removeEmail(id: string) { setEmails((p) => p.filter((e) => e.id !== id)); }
  function updateEmail(id: string, patch: Partial<EmailField>) {
    setEmails((p) => p.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }
  function addPhone() {
    if (phones.length >= 3) return;
    setPhones((p) => [...p, { id: `p-${Date.now()}`, title: "", number: "" }]);
  }
  function removePhone(id: string) { setPhones((p) => p.filter((ph) => ph.id !== id)); }
  function updatePhone(id: string, patch: Partial<PhoneField>) {
    setPhones((p) => p.map((ph) => (ph.id === id ? { ...ph, ...patch } : ph)));
  }

  const socialFields = [
    { icon: "brand" as AdminIconName, label: "Facebook", value: facebook, onChange: setFacebook },
    { icon: "tag" as AdminIconName, label: "TikTok", value: tiktok, onChange: setTiktok },
    { icon: "reviews" as AdminIconName, label: "Instagram", value: instagram, onChange: setInstagram },
    { icon: "orders" as AdminIconName, label: "LinkedIn", value: linkedin, onChange: setLinkedin },
    { icon: "report" as AdminIconName, label: "YouTube", value: youtube, onChange: setYoutube },
    { icon: "discount" as AdminIconName, label: "Twitter", value: twitter, onChange: setTwitter },
  ];

  return (
    <div>
      <SectionRow title="Set E-mail address" description="You can set up to 2 email address.">
        <div className="space-y-4">
          {emails.map((item, index) => (
            <div className="grid items-end gap-4 md:grid-cols-[1fr_2fr_auto]" key={item.id}>
              <label className="block">
                <FieldLabel required={index === 0}>Title {index === 0 ? "(Primary)" : ""}</FieldLabel>
                <TextInput value={item.title} onChange={(v) => updateEmail(item.id, { title: v })} placeholder="Support Email" required={index === 0} />
              </label>
              <label className="block">
                <FieldLabel required={index === 0}>Email</FieldLabel>
                <TextInput value={item.email} onChange={(v) => updateEmail(item.id, { email: v })} placeholder="Enter your email" type="email" required={index === 0} />
              </label>
              {index > 0 && (
                <button className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50" onClick={() => removeEmail(item.id)} type="button">
                  <AdminIcon className="h-4 w-4" name="x" />
                </button>
              )}
            </div>
          ))}
          {emails.length < 2 && (
            <button className="text-sm font-black text-blue-600 hover:text-blue-700" onClick={addEmail} type="button">+ Add Another</button>
          )}
        </div>
      </SectionRow>

      <SectionRow title="Set Contact Numbers" description="You can set up to 3 contact number.">
        <div className="space-y-4">
          {phones.map((item, index) => (
            <div className="grid items-end gap-4 md:grid-cols-[1fr_2fr_auto]" key={item.id}>
              <label className="block">
                <FieldLabel required={index === 0}>Title {index === 0 ? "(Primary)" : ""}</FieldLabel>
                <TextInput value={item.title} onChange={(v) => updatePhone(item.id, { title: v })} placeholder="Customer Support" required={index === 0} />
              </label>
              <label className="block">
                <FieldLabel required={index === 0}>Number</FieldLabel>
                <TextInput value={item.number} onChange={(v) => updatePhone(item.id, { number: v })} placeholder="Enter your phone number" type="tel" required={index === 0} />
              </label>
              {index > 0 && (
                <button className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50" onClick={() => removePhone(item.id)} type="button">
                  <AdminIcon className="h-4 w-4" name="x" />
                </button>
              )}
            </div>
          ))}
          {phones.length < 3 && (
            <button className="text-sm font-black text-blue-600 hover:text-blue-700" onClick={addPhone} type="button">+ Add Another</button>
          )}
        </div>
      </SectionRow>

      <SectionRow title="Social Profiles" description="Share the links that redirect to your social media profile.">
        <div className="space-y-3">
          {socialFields.map(({ icon, label, value, onChange }) => (
            <div className="flex items-center gap-3" key={label}>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-slate-200 bg-slate-50">
                <AdminIcon className="h-4 w-4 text-slate-500" name={icon} />
              </span>
              <input
                className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                onChange={(e) => onChange(e.target.value)}
                placeholder="Enter your media links:"
                type="url"
                value={value}
              />
            </div>
          ))}
        </div>
      </SectionRow>
    </div>
  );
}

// ─── Policy panel ─────────────────────────────────────────────────────────────

function PolicyPanel() {
  const [activePolicy, setActivePolicy] = useState<PolicyTab>("delivery");
  const [contents, setContents] = useState<Record<PolicyTab, string>>({
    delivery: "", refund: "", cancellation: "", privacy: "", terms: "",
  });

  const policyTabs: { id: PolicyTab; label: string }[] = [
    { id: "delivery", label: "Delivery Policy" },
    { id: "refund", label: "Refund & Return" },
    { id: "cancellation", label: "Cancellation Policy" },
    { id: "privacy", label: "Privacy Policy" },
    { id: "terms", label: "Terms and Conditions" },
  ];

  const currentLabel = policyTabs.find((t) => t.id === activePolicy)?.label ?? "";

  return (
    <div>
      <div className="mb-6 border-b border-slate-200">
        <nav className="-mb-px flex gap-1 overflow-x-auto">
          {policyTabs.map((tab) => (
            <button
              className={`shrink-0 border-b-2 px-5 py-3 text-sm font-black transition-colors ${
                activePolicy === tab.id ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
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

      <div className="mb-5">
        <label className="block max-w-xl">
          <FieldLabel required>{currentLabel} Title</FieldLabel>
          <TextInput value={currentLabel} onChange={() => {}} disabled />
          <p className="mt-1 text-xs font-medium text-slate-400">{currentLabel.length}/128 characters</p>
        </label>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-300">
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-3 py-2">
          {["←", "→"].map((t) => (
            <button className="grid h-7 w-7 place-items-center rounded text-sm text-slate-500 hover:bg-slate-200" key={t} type="button">{t}</button>
          ))}
          <div className="mx-1 h-5 w-px bg-slate-300" />
          <select className="h-7 rounded border border-slate-300 bg-white px-2 text-xs font-black text-slate-700">
            <option>Paragraph</option><option>Heading 1</option><option>Heading 2</option>
          </select>
          <div className="mx-1 h-5 w-px bg-slate-300" />
          {["B", "I", "S", "<>"].map((t) => (
            <button className="grid h-7 w-7 place-items-center rounded border border-slate-300 bg-white text-xs font-black text-slate-700 hover:bg-slate-100" key={t} type="button">{t}</button>
          ))}
          <button className="grid h-7 w-7 place-items-center rounded border border-slate-300 bg-white hover:bg-slate-100" type="button">
            <AdminIcon className="h-3.5 w-3.5 text-slate-600" name="discount" />
          </button>
          <div className="mx-1 h-5 w-px bg-slate-300" />
          {["• List", "1. List"].map((t) => (
            <button className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-black text-slate-700 hover:bg-slate-100" key={t} type="button">{t}</button>
          ))}
          <div className="mx-1 h-5 w-px bg-slate-300" />
          {["≡", "≡", "≡", "≡"].map((t, i) => (
            <button className="grid h-7 w-7 place-items-center rounded border border-slate-300 bg-white text-sm text-slate-700 hover:bg-slate-100" key={i} type="button">{t}</button>
          ))}
        </div>
        <textarea
          className="min-h-56 w-full px-4 py-3 text-sm font-medium outline-none"
          onChange={(e) => setContents((p) => ({ ...p, [activePolicy]: e.target.value }))}
          placeholder={`Enter your ${currentLabel.toLowerCase()} content here...`}
          rows={10}
          value={contents[activePolicy]}
        />
      </div>
      <p className="mt-1.5 text-xs font-medium text-slate-400">{contents[activePolicy].length} characters</p>

      <div className="mt-6 flex gap-3">
        <button className="h-11 rounded-lg border border-slate-300 bg-white px-6 text-sm font-black text-slate-700 hover:bg-slate-50" type="button">Cancel</button>
        <button className="h-11 rounded-lg bg-blue-600 px-6 text-sm font-black text-white hover:bg-blue-700" type="button">Save</button>
      </div>
    </div>
  );
}

// ─── Campaigns panel ──────────────────────────────────────────────────────────

function CampaignsPanel() {
  const [search, setSearch] = useState("");
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    { id: "1", name: "Exclusive Limited Offers", slug: "exclusive-limited-offers", description: "", isActive: true },
    { id: "2", name: "Hero Sliders", slug: "hero-sliders", description: "", isActive: true },
  ]);

  const filtered = campaigns.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.slug.toLowerCase().includes(search.toLowerCase()),
  );

  function toggleStatus(id: string) {
    setCampaigns((p) => p.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)));
  }

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800">Campaign list</h2>
          <p className="text-sm font-medium text-slate-500">Displaying {filtered.length} campaigns</p>
        </div>
        <div className="flex gap-3">
          <button className="grid h-11 w-11 place-items-center rounded-lg border border-slate-300 bg-white hover:bg-slate-50" type="button">
            <AdminIcon className="h-4 w-4" name="refresh" />
          </button>
          <button className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-black text-white hover:bg-blue-700" type="button">
            <AdminIcon className="h-4 w-4" name="plus" />
            Add Campaign
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200">
        <div className="border-b border-slate-200 p-4">
          <label className="flex h-11 max-w-xl items-center gap-3 rounded-lg border border-slate-300 px-4">
            <AdminIcon className="h-4 w-4 text-slate-400" name="search" />
            <input className="w-full bg-transparent text-sm font-medium outline-none" onChange={(e) => setSearch(e.target.value)} placeholder="Search campaigns by name & slug" value={search} />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left">
            <thead className="bg-slate-50">
              <tr>
                {["Campaign Name", "Slug", "Description", "Status", "Actions"].map((h) => (
                  <th className="px-5 py-3.5 text-sm font-black text-slate-700" key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr className="bg-white hover:bg-slate-50/60" key={c.id}>
                  <td className="px-5 py-4 text-sm font-black text-slate-800">{c.name}</td>
                  <td className="px-5 py-4 text-sm font-medium text-slate-600">{c.slug}</td>
                  <td className="px-5 py-4 text-sm font-medium text-slate-400">{c.description || "—"}</td>
                  <td className="px-5 py-4"><StatusToggle checked={c.isActive} onChange={() => toggleStatus(c.id)} /></td>
                  <td className="px-5 py-4">
                    <button className="grid h-8 w-8 place-items-center rounded-lg border border-slate-300 text-slate-500 hover:bg-slate-50" type="button">
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

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SiteSection>("general");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const meta = sectionMeta[activeSection];

  async function handleSave() {
    setIsSaving(true);
    await new Promise<void>((r) => setTimeout(r, 700));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  }

  function renderContent() {
    switch (activeSection) {
      case "general": return <GeneralPanel />;
      case "contacts": return <ContactsPanel />;
      case "manage-policy": return <PolicyPanel />;
      case "campaigns": return <CampaignsPanel />;
      default:
        return (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 py-20 text-center">
            <p className="font-black text-slate-400">{meta.title} — coming soon</p>
          </div>
        );
    }
  }

  return (
    /* Negative margins cancel the AdminShell padding so the two panels sit flush */
    <div className="-mx-5 -my-7 flex min-h-screen sm:-mx-8 lg:-mx-10">

      {/* ── Secondary sidebar ── */}
      <aside className="w-[220px] shrink-0 border-r border-slate-200 bg-white">
        <div className="px-4 py-5">
          <p className="mb-3 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">Website</p>
          <nav className="space-y-0.5">
            {siteNav.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${
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
          </nav>
        </div>
      </aside>

      {/* ── Content area ── */}
      <div className="flex min-w-0 flex-1 flex-col bg-white">
        {/* Content header with title + Cancel/Update buttons */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-8 py-5">
          <div>
            <h1 className="text-3xl font-black text-slate-900">{meta.title}</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">{meta.description}</p>
          </div>
          {activeSection !== "campaigns" && (
            <div className="flex shrink-0 items-center gap-3">
              {saveSuccess && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-2 text-sm font-black text-green-700">
                  <AdminIcon className="h-4 w-4" name="check" />
                  Saved
                </span>
              )}
              <button
                className="h-10 rounded-lg border border-slate-300 bg-white px-5 text-sm font-black text-slate-700 hover:bg-slate-50"
                type="button"
              >
                Cancel
              </button>
              <button
                className="h-10 rounded-lg bg-blue-600 px-5 text-sm font-black text-white hover:bg-blue-700 disabled:bg-slate-400"
                disabled={isSaving}
                onClick={handleSave}
                type="button"
              >
                {isSaving ? "Saving..." : "Update"}
              </button>
            </div>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-8 py-7">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
