"use client";

import { useEffect, useState } from "react";
import { AdminIcon } from "../admin-shell";
import { Input, Select } from "../enterprise-ui";
import { apiRequest } from "../../../../lib/admin-api";

type StoreSettings = {
  shopName?: string;
  currency?: string;
  language?: string;
  parentCompany?: string;
  deliveryChargeInside?: number;
  deliveryChargeOutside?: number;
  email?: { primary?: string };
  contactNumber?: { primary?: string };
  socialContact?: { facebook?: string; instagram?: string };
};

type Policy = {
  delivery?: { title: string; content: string };
  refund?: { title: string; content: string };
  cancellation?: { title: string; content: string };
  privacy?: { title: string; content: string };
  terms?: { title: string; content: string };
};

type PolicyTab = "delivery" | "refund" | "cancellation" | "privacy" | "terms";
type KVField = { label: string; value: string };

function KVFieldList({
  title,
  fields,
  onChange,
  valueType = "text",
  valuePlaceholder = "Value",
  labelPlaceholder = "Label",
}: {
  title: string;
  fields: KVField[];
  onChange: (fields: KVField[]) => void;
  valueType?: string;
  valuePlaceholder?: string;
  labelPlaceholder?: string;
}) {
  function addField() {
    onChange([...fields, { label: "", value: "" }]);
  }
  function removeField(i: number) {
    onChange(fields.filter((_, idx) => idx !== i));
  }
  function updateField(i: number, key: "label" | "value", val: string) {
    onChange(fields.map((f, idx) => (idx === i ? { ...f, [key]: val } : f)));
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">{title}</p>
        <button
          type="button"
          onClick={addField}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          <AdminIcon className="h-3.5 w-3.5" name="plus" />
          Add Field
        </button>
      </div>
      <div className="space-y-2">
        {fields.length === 0 && (
          <p className="py-4 text-center text-sm text-slate-400">No fields yet. Click "Add Field" to add one.</p>
        )}
        {fields.map((field, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              className="h-9 w-28 shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-400 focus:bg-white"
              placeholder={labelPlaceholder}
              value={field.label}
              onChange={(e) => updateField(i, "label", e.target.value)}
            />
            <input
              type={valueType}
              className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-400 focus:bg-white"
              placeholder={valuePlaceholder}
              value={field.value}
              onChange={(e) => updateField(i, "value", e.target.value)}
            />
            <button
              type="button"
              onClick={() => removeField(i)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50"
            >
              <AdminIcon className="h-4 w-4" name="x" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WebsiteSection() {
  const [settings, setSettings] = useState<StoreSettings>({});
  const [policy, setPolicy] = useState<Policy>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"general" | "contacts" | "policy">("general");
  const [activePolicy, setActivePolicy] = useState<PolicyTab>("delivery");
  const [policyContent, setPolicyContent] = useState("");

  // General fields
  const [shopName, setShopName] = useState("");
  const [currency, setCurrency] = useState("BDT");
  const [language, setLanguage] = useState("en");
  const [insideCharge, setInsideCharge] = useState("");
  const [outsideCharge, setOutsideCharge] = useState("");

  // Contact & Social - dynamic fields
  const [phones, setPhones] = useState<KVField[]>([
    { label: "Helpline", value: "+880 1700-000000" },
    { label: "Support", value: "+880 1800-000000" },
  ]);
  const [emails, setEmails] = useState<KVField[]>([
    { label: "Support", value: "support@yourstore.com" },
    { label: "Sales", value: "sales@yourstore.com" },
  ]);
  const [socials, setSocials] = useState<KVField[]>([
    { label: "facebook", value: "https://facebook.com/yourpage" },
    { label: "instagram", value: "https://instagram.com/yourpage" },
    { label: "whatsapp", value: "https://wa.me/8801700000000" },
  ]);

  async function load() {
    setLoading(true);
    try {
      const [s, p] = await Promise.all([
        apiRequest<StoreSettings>("/settings").catch(() => ({} as StoreSettings)),
        apiRequest<Policy>("/policies").catch(() => ({} as Policy)),
      ]);
      setSettings(s);
      setPolicy(p);
      setShopName(s.shopName || "");
      setCurrency(s.currency || "BDT");
      setLanguage(s.language || "en");
      setInsideCharge(s.deliveryChargeInside?.toString() || "");
      setOutsideCharge(s.deliveryChargeOutside?.toString() || "");
      if (s.contactNumber?.primary) {
        setPhones([{ label: "Helpline", value: s.contactNumber.primary }]);
      }
      if (s.email?.primary) {
        setEmails([{ label: "Support", value: s.email.primary }]);
      }
      if (s.socialContact) {
        const loaded: KVField[] = [];
        if (s.socialContact.facebook) loaded.push({ label: "facebook", value: s.socialContact.facebook });
        if (s.socialContact.instagram) loaded.push({ label: "instagram", value: s.socialContact.instagram });
        if (loaded.length > 0) setSocials(loaded);
      }
      setPolicyContent(p["delivery"]?.content || "");
    } catch { /* empty */ }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  useEffect(() => {
    setPolicyContent(policy[activePolicy]?.content || "");
  }, [activePolicy, policy]);

  async function saveSettings() {
    setSaving(true);
    try {
      await apiRequest<StoreSettings>("/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopName,
          currency,
          language,
          deliveryChargeInside: Number(insideCharge) || 0,
          deliveryChargeOutside: Number(outsideCharge) || 0,
        }),
      });
      alert("Settings saved!");
    } catch { alert("Failed to save settings."); }
    finally { setSaving(false); }
  }

  async function saveContacts() {
    setSaving(true);
    try {
      const phoneMap = Object.fromEntries(phones.map((p) => [p.label, p.value]));
      const emailMap = Object.fromEntries(emails.map((e) => [e.label, e.value]));
      const socialMap = Object.fromEntries(socials.map((s) => [s.label, s.value]));
      await apiRequest<StoreSettings>("/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactNumber: { primary: phones[0]?.value || "", ...phoneMap },
          email: { primary: emails[0]?.value || "", ...emailMap },
          socialContact: socialMap,
        }),
      });
      alert("Contacts saved!");
    } catch { alert("Failed to save contacts."); }
    finally { setSaving(false); }
  }

  async function savePolicy() {
    setSaving(true);
    try {
      const updated = await apiRequest<Policy>("/policies", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [activePolicy]: { title: activePolicy.toUpperCase(), content: policyContent } }),
      });
      setPolicy(updated);
      alert("Policy updated!");
    } catch { alert("Failed to save policy."); }
    finally { setSaving(false); }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
    </div>
  );

  return (
    <>
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-slate-800">Website Settings</h2>
        <p className="text-sm text-slate-500">Manage store settings, contacts and policies</p>
      </div>

      <div className="mb-5 flex gap-1 border-b border-slate-200">
        {[
          { id: "general", label: "General & Branding" },
          { id: "contacts", label: "Contact & Social" },
          { id: "policy", label: "Policy Pages" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as typeof tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.id ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "general" && (
        <div className="space-y-5">
          <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Basic Information</p>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500">Shop Name</label>
              <Input value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="e.g. NeoComerz" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500">Currency</label>
                <Select value={currency} onChange={(e) => setCurrency(e.target.value)} options={[
                  { value: "BDT", label: "BDT — Bangladeshi Taka" },
                  { value: "USD", label: "USD — US Dollar" },
                ]} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500">Language</label>
                <Select value={language} onChange={(e) => setLanguage(e.target.value)} options={[
                  { value: "en", label: "English" },
                  { value: "bn", label: "Bengali" },
                ]} />
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Shipping Rates</p>
            <div className="grid gap-4 sm:grid-cols-2 max-w-sm">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500">Inside Dhaka (৳)</label>
                <Input type="number" value={insideCharge} onChange={(e) => setInsideCharge(e.target.value)} placeholder="60" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500">Outside Dhaka (৳)</label>
                <Input type="number" value={outsideCharge} onChange={(e) => setOutsideCharge(e.target.value)} placeholder="120" />
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button onClick={saveSettings} disabled={saving}
              className="h-10 px-6 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400">
              {saving ? "Saving..." : "Save General Settings"}
            </button>
          </div>
        </div>
      )}

      {tab === "contacts" && (
        <div className="space-y-5">
          <KVFieldList
            title="Phone Numbers"
            fields={phones}
            onChange={setPhones}
            valueType="tel"
            labelPlaceholder="e.g. Helpline"
            valuePlaceholder="+880 17..."
          />
          <KVFieldList
            title="Email Addresses"
            fields={emails}
            onChange={setEmails}
            valueType="email"
            labelPlaceholder="e.g. Support"
            valuePlaceholder="email@domain.com"
          />
          <KVFieldList
            title="Social Links"
            fields={socials}
            onChange={setSocials}
            valueType="url"
            labelPlaceholder="e.g. facebook"
            valuePlaceholder="https://..."
          />
          <div className="flex justify-end pt-2">
            <button onClick={saveContacts} disabled={saving}
              className="h-10 px-6 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400">
              {saving ? "Saving..." : "Save Contacts"}
            </button>
          </div>
        </div>
      )}

      {tab === "policy" && (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="flex gap-1 overflow-x-auto border-b border-slate-100 px-4 pt-1">
            {(["delivery", "refund", "cancellation", "privacy", "terms"] as PolicyTab[]).map((p) => (
              <button key={p} onClick={() => setActivePolicy(p)}
                className={`whitespace-nowrap border-b-2 px-4 py-3 text-xs font-medium capitalize transition-colors ${
                  activePolicy === p ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
                }`} type="button">
                {p.replace(/_/g, " ")}
              </button>
            ))}
          </div>
          <div className="p-5 space-y-4">
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">Content</label>
            <textarea
              className="min-h-[200px] w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:bg-white"
              rows={8} value={policyContent} onChange={(e) => setPolicyContent(e.target.value)}
              placeholder="Enter policy content..."
            />
            <div className="flex justify-end">
              <button onClick={savePolicy} disabled={saving}
                className="h-10 px-5 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400">
                {saving ? "Saving..." : "Update Policy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
