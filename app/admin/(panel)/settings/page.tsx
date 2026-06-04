"use client";

import { useEffect, useState } from "react";
import { SettingsNav, settingsSectionMeta, type SettingsSection } from "../../_components/settings/settings-nav";
import { BranchesSection } from "../../_components/settings/branches-section";
import { UsersSection } from "../../_components/settings/users-section";
import { RolesSection } from "../../_components/settings/roles-section";
import { ActivitySection } from "../../_components/settings/activity-section";
import { AdminIcon } from "../../_components/admin-shell";
import { Button, Input, Select } from "../../_components/enterprise-ui";
import { apiRequest } from "../../../../lib/admin-api";

// ─── Types ────────────────────────────────────────────────────────────────────
type PolicyTab = "delivery" | "refund" | "cancellation" | "privacy" | "terms";

type ContactMap = {
  primary?: string;
  [key: string]: string | undefined;
};

type SocialContactMap = {
  facebook?: string;
  instagram?: string;
  [key: string]: string | undefined;
};

type StoreSettings = {
  id?: string;
  shopName?: string;
  logo?: string;
  icon?: string;
  copyrightYear?: string;
  parentCompany?: string;
  parentCompanyLink?: string;
  slogan?: string;
  currency?: string;
  language?: string;
  deliveryChargeInside?: number;
  deliveryChargeOutside?: number;
  contactNumber?: ContactMap;
  email?: ContactMap;
  socialContact?: SocialContactMap;
};

type Policy = {
  id?: string;
  delivery?: { title: string; content: string };
  return?: { title: string; content: string };
  refund?: { title: string; content: string };
  cancellation?: { title: string; content: string };
  privacy?: { title: string; content: string };
  terms?: { title: string; content: string };
};

type Campaign = {
  id: string;
  title: string;
  description: string;
  status: "active" | "inactive";
  sectionId?: string;
  images?: { id: string; images: any }[];
  startAt?: string;
  endAt?: string;
};

type KVField = { label: string; value: string };

function readPolicyContent(policy: Policy, key: PolicyTab) {
  if (key === "refund") {
    return policy.refund?.content || policy.return?.content || "";
  }
  return policy[key]?.content ?? "";
}

// ─── Dynamic Field Builder Component ──────────────────────────────────────────
function DynamicFieldList({
  title,
  subtitle,
  fields,
  onChange,
  valueType = "text",
  placeholderLabel = "Label (e.g. support)",
  placeholderValue = "Value (e.g. input content)",
}: {
  title: string;
  subtitle: string;
  fields: KVField[];
  onChange: (fields: KVField[]) => void;
  valueType?: string;
  placeholderLabel?: string;
  placeholderValue?: string;
}) {
  const addField = () => onChange([...fields, { label: "", value: "" }]);
  const removeField = (index: number) => onChange(fields.filter((_, i) => i !== index));
  const updateField = (index: number, key: "label" | "value", val: string) => {
    onChange(fields.map((f, i) => (i === index ? { ...f, [key]: val } : f)));
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={addField}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/50 px-3 text-xs font-bold text-blue-700 hover:bg-blue-50 transition-colors"
        >
          <AdminIcon className="h-3.5 w-3.5" name="plus" />
          Add Item
        </button>
      </div>

      <div className="space-y-3">
        {fields.length === 0 ? (
          <p className="text-center text-sm font-medium text-slate-400 py-4">No fields added yet. Click "Add Item" to start.</p>
        ) : (
          fields.map((field, idx) => (
            <div key={idx} className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="w-full sm:w-1/3">
                <input
                  type="text"
                  placeholder={placeholderLabel}
                  value={field.label}
                  onChange={(e) => updateField(idx, "label", e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50/40 px-3.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
                />
              </div>
              <div className="flex-1">
                <input
                  type={valueType}
                  placeholder={placeholderValue}
                  value={field.value}
                  onChange={(e) => updateField(idx, "value", e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50/40 px-3.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
                />
              </div>
              <button
                type="button"
                onClick={() => removeField(idx)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition-colors"
              >
                <AdminIcon className="h-4 w-4" name="x" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────
export default function SettingsPage() {
  const [active, setActive] = useState<SettingsSection>("general");
  const [settings, setSettings] = useState<StoreSettings>({});
  const [policy, setPolicy] = useState<Policy>({});
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [sections, setSections] = useState<{ id: string; title: string; page: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Local state copy for General fields
  const [shopName, setShopName] = useState("");
  const [currency, setCurrency] = useState("BDT");
  const [language, setLanguage] = useState("en");
  const [copyright, setCopyright] = useState("");
  const [insideCharge, setInsideCharge] = useState("");
  const [outsideCharge, setOutsideCharge] = useState("");

  // Contacts
  const [phones, setPhones] = useState<KVField[]>([]);
  const [emails, setEmails] = useState<KVField[]>([]);
  const [socials, setSocials] = useState<KVField[]>([]);

  // Policy Pages Tab
  const [activePolicy, setActivePolicy] = useState<PolicyTab>("delivery");
  const [policyContent, setPolicyContent] = useState("");

  // Campaigns Modals & Add Forms
  const [isCampaignOpen, setIsCampaignOpen] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  const [campTitle, setCampTitle] = useState("");
  const [campDesc, setCampDesc] = useState("");
  const [campStatus, setCampStatus] = useState<"active" | "inactive">("active");
  const [campSectionId, setCampSectionId] = useState("");
  const [campStartAt, setCampStartAt] = useState("");
  const [campEndAt, setCampEndAt] = useState("");
  const [campImage, setCampImage] = useState<File | null>(null);

  // Sync tab state with URL parameter on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab") as SettingsSection;
      if (tabParam && ["general", "contacts", "manage-policy", "campaigns", "branches", "users", "roles", "activity-logs"].includes(tabParam)) {
        setActive(tabParam);
      }
    }
  }, []);

  const handleTabChange = (newTab: SettingsSection) => {
    setActive(newTab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", newTab);
      window.history.pushState({}, "", url.toString());
    }
  };

  async function loadAllData() {
    try {
      setLoading(true);
      setError("");

      const [settRes, polyRes, campRes, sectRes] = await Promise.all([
        apiRequest<StoreSettings>("/settings").catch(() => ({} as StoreSettings)),
        apiRequest<Policy>("/policies").catch(() => ({} as Policy)),
        apiRequest<Campaign[]>("/campaigns").catch(() => []),
        apiRequest<{ id: string; title: string; page: string }[]>("/campaigns/sections").catch(() => []),
      ]);

      setSettings(settRes);
      setPolicy(polyRes);
      setCampaigns(campRes);
      setSections(sectRes);

      // Populate settings
      setShopName(settRes.shopName || "");
      setCurrency(settRes.currency || "BDT");
      setLanguage(settRes.language || "en");
      setCopyright(settRes.parentCompany || "");
      setInsideCharge(settRes.deliveryChargeInside?.toString() || "");
      setOutsideCharge(settRes.deliveryChargeOutside?.toString() || "");

      // Populate dynamic contact fields
      const loadedPhones: KVField[] = [];
      if (settRes.contactNumber) {
        Object.entries(settRes.contactNumber).forEach(([label, value]) => {
          if (label !== "id" && value && typeof value === "string") {
            loadedPhones.push({ label, value });
          }
        });
      }
      if (loadedPhones.length === 0 && settRes.contactNumber?.primary) {
        loadedPhones.push({ label: "primary", value: settRes.contactNumber.primary });
      }
      setPhones(loadedPhones.length > 0 ? loadedPhones : [{ label: "Helpline", value: "" }]);

      const loadedEmails: KVField[] = [];
      if (settRes.email) {
        Object.entries(settRes.email).forEach(([label, value]) => {
          if (label !== "id" && value && typeof value === "string") {
            loadedEmails.push({ label, value });
          }
        });
      }
      if (loadedEmails.length === 0 && settRes.email?.primary) {
        loadedEmails.push({ label: "primary", value: settRes.email.primary });
      }
      setEmails(loadedEmails.length > 0 ? loadedEmails : [{ label: "Support", value: "" }]);

      const loadedSocials: KVField[] = [];
      if (settRes.socialContact) {
        Object.entries(settRes.socialContact).forEach(([label, value]) => {
          if (label !== "id" && value && typeof value === "string") {
            loadedSocials.push({ label, value });
          }
        });
      }
      setSocials(loadedSocials.length > 0 ? loadedSocials : [
        { label: "facebook", value: "" },
        { label: "instagram", value: "" }
      ]);

      // Populate current policy content
      setPolicyContent(readPolicyContent(polyRes, activePolicy));
    } catch (err) {
      console.error(err);
      setError("Failed to retrieve settings resources.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadAllData();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!policy) return;
    const timeoutId = window.setTimeout(() => {
      setPolicyContent(readPolicyContent(policy, activePolicy));
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [activePolicy, policy]);

  async function handleSaveSettings() {
    setSaving(true);
    try {
      const payload: StoreSettings = {
        ...settings,
        shopName,
        currency,
        language,
        parentCompany: copyright,
        deliveryChargeInside: Number(insideCharge) || 0,
        deliveryChargeOutside: Number(outsideCharge) || 0,
      };

      const updated = await apiRequest<StoreSettings>("/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setSettings(updated);
      alert("Settings successfully saved!");
    } catch (err) {
      alert("Failed to save settings: " + (err instanceof Error ? err.message : "Error"));
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveContacts() {
    setSaving(true);
    try {
      const phoneMap = Object.fromEntries(phones.filter(p => p.label.trim() && p.value.trim()).map((p) => [p.label.trim(), p.value.trim()]));
      const emailMap = Object.fromEntries(emails.filter(e => e.label.trim() && e.value.trim()).map((e) => [e.label.trim(), e.value.trim()]));
      const socialMap = Object.fromEntries(socials.filter(s => s.label.trim() && s.value.trim()).map((s) => [s.label.trim(), s.value.trim()]));

      const payload: StoreSettings = {
        ...settings,
        contactNumber: {
          primary: phones.find(p => p.label === "primary")?.value || phones[0]?.value || "",
          ...phoneMap
        },
        email: {
          primary: emails.find(e => e.label === "primary")?.value || emails[0]?.value || "",
          ...emailMap
        },
        socialContact: socialMap
      };

      const updated = await apiRequest<StoreSettings>("/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setSettings(updated);
      alert("Contacts successfully saved!");
    } catch (err) {
      alert("Failed to save contacts: " + (err instanceof Error ? err.message : "Error"));
    } finally {
      setSaving(false);
    }
  }

  async function handleSavePolicy() {
    setSaving(true);
    try {
      const polKey = activePolicy === "refund" ? "refund" : activePolicy;
      const formattedTitle = activePolicy.toUpperCase();

      const payload = {
        [polKey]: {
          title: formattedTitle,
          content: policyContent,
        },
      };

      const updated = await apiRequest<Policy>("/policies", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setPolicy(updated);
      alert("Policy content successfully updated!");
    } catch (err) {
      alert("Failed to save policy: " + (err instanceof Error ? err.message : "Error"));
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleCampaign(camp: Campaign) {
    try {
      const newStatus = camp.status === "active" ? "inactive" : "active";
      await apiRequest(`/campaigns/${camp.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      await loadAllData();
    } catch (err) {
      alert("Failed to change campaign status.");
    }
  }

  async function handleDeleteCampaign(id: string) {
    if (!confirm("Delete this campaign?")) return;
    try {
      await apiRequest(`/campaigns/${id}`, { method: "DELETE" });
      await loadAllData();
    } catch (err) {
      alert("Failed to delete campaign.");
    }
  }

  function handleOpenEditCampaign(c: Campaign) {
    setEditingCampaignId(c.id);
    setCampTitle(c.title);
    setCampDesc(c.description || "");
    setCampStatus(c.status);
    setCampSectionId(c.sectionId || "");
    setCampStartAt(c.startAt ? c.startAt.split("T")[0] : "");
    setCampEndAt(c.endAt ? c.endAt.split("T")[0] : "");
    setIsCampaignOpen(true);
  }

  function handleCloseCampaignModal() {
    setIsCampaignOpen(false);
    setEditingCampaignId(null);
    setCampTitle("");
    setCampDesc("");
    setCampStatus("active");
    setCampSectionId("");
    setCampStartAt("");
    setCampEndAt("");
    setCampImage(null);
  }

  async function handleCreateCampaign(e: React.FormEvent) {
    e.preventDefault();
    if (!campTitle || !campSectionId) return;

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", campTitle);
      formData.append("description", campDesc);
      formData.append("status", campStatus);
      formData.append("sectionId", campSectionId);
      formData.append("startAt", campStartAt ? new Date(campStartAt).toISOString() : new Date().toISOString());
      if (campEndAt) {
        formData.append("endAt", new Date(campEndAt).toISOString());
      }
      if (campImage) {
        formData.append("images", campImage);
      }

      if (editingCampaignId) {
        await apiRequest(`/campaigns/${editingCampaignId}`, {
          method: "PATCH",
          body: formData,
        });
        alert("Campaign successfully updated!");
      } else {
        await apiRequest("/campaigns", {
          method: "POST",
          body: formData,
        });
        alert("Campaign successfully created!");
      }

      handleCloseCampaignModal();
      await loadAllData();
    } catch (err) {
      alert("Failed to save campaign: " + (err instanceof Error ? err.message : "Error"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 font-bold text-slate-600">Loading settings configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full shrink-0 lg:w-56">
        <div className="sticky top-8 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-bold text-slate-800">Settings</h2>
            <p className="mt-0.5 text-xs text-slate-500">Configure global preferences</p>
          </div>
          <SettingsNav active={active} onChange={handleTabChange} />
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="min-w-0 flex-1">
        <div className="mb-6 border-b border-slate-200 pb-4">
          <h1 className="text-xl font-bold text-slate-800 font-black">
            {settingsSectionMeta[active]?.title}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {settingsSectionMeta[active]?.description}
          </p>
        </div>

        {error && <div className="mb-4 text-red-800 bg-red-50 border border-red-200 p-4 rounded-xl font-semibold">{error}</div>}

        {/* ─── GENERAL TAB ─── */}
        {active === "general" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Basic Information</h3>
              <div>
                <Input label="Shop Name" value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="e.g. NeoComerz" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Select label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} options={[
                    { value: "BDT", label: "BDT — Bangladeshi Taka" },
                    { value: "USD", label: "USD — US Dollar" },
                  ]} />
                </div>
                <div>
                  <Select label="Language" value={language} onChange={(e) => setLanguage(e.target.value)} options={[
                    { value: "en", label: "English" },
                    { value: "bn", label: "Bengali" },
                  ]} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Shipping Rates</h3>
              <div className="grid gap-4 sm:grid-cols-2 max-w-md">
                <div>
                  <Input label="Inside Dhaka (৳)" type="number" value={insideCharge} onChange={(e) => setInsideCharge(e.target.value)} placeholder="60" />
                </div>
                <div>
                  <Input label="Outside Dhaka (৳)" type="number" value={outsideCharge} onChange={(e) => setOutsideCharge(e.target.value)} placeholder="120" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Branding Copyright</h3>
              <div>
                <Input label="Company Label" value={copyright} onChange={(e) => setCopyright(e.target.value)} placeholder="e.g. NeoComerz Ltd." />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button size="md" variant="primary" disabled={saving} onClick={handleSaveSettings}>
                {saving ? "Saving..." : "Save General Settings"}
              </Button>
            </div>
          </div>
        )}

        {/* ─── CONTACTS TAB ─── */}
        {active === "contacts" && (
          <div className="space-y-6">
            <DynamicFieldList
              title="Phone Numbers"
              subtitle="Add, edit, or remove helpline and support contact numbers"
              fields={phones}
              onChange={setPhones}
              valueType="tel"
              placeholderLabel="e.g. Helpline or WhatsApp"
              placeholderValue="+880 1700..."
            />

            <DynamicFieldList
              title="Email Addresses"
              subtitle="Add, edit, or remove store customer support and billing emails"
              fields={emails}
              onChange={setEmails}
              valueType="email"
              placeholderLabel="e.g. Support or Billing"
              placeholderValue="support@domain.com"
            />

            <DynamicFieldList
              title="Social Media Links"
              subtitle="Add, edit, or remove social handles and page links"
              fields={socials}
              onChange={setSocials}
              valueType="url"
              placeholderLabel="e.g. facebook or instagram"
              placeholderValue="https://..."
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button size="md" variant="primary" disabled={saving} onClick={handleSaveContacts}>
                {saving ? "Saving..." : "Save Contacts"}
              </Button>
            </div>
          </div>
        )}

        {/* ─── POLICIES TAB ─── */}
        {active === "manage-policy" && (
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50">
              <nav className="flex gap-1 overflow-x-auto px-4 pt-1">
                {[
                  { id: "delivery", label: "Delivery Policy" },
                  { id: "refund", label: "Refund & Return" },
                  { id: "cancellation", label: "Cancellation" },
                  { id: "privacy", label: "Privacy Policy" },
                  { id: "terms", label: "Terms & Conditions" },
                ].map((tab) => (
                  <button
                    className={`whitespace-nowrap border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
                      activePolicy === tab.id
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                    key={tab.id}
                    onClick={() => setActivePolicy(tab.id as PolicyTab)}
                    type="button"
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Policy Page Content</label>
                <textarea
                  className="min-h-[250px] w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  rows={8}
                  value={policyContent}
                  onChange={(e) => setPolicyContent(e.target.value)}
                  placeholder="Enter policy content here..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <Button size="md" variant="primary" disabled={saving} onClick={handleSavePolicy}>
                  {saving ? "Saving..." : "Update Policy"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ─── CAMPAIGNS TAB ─── */}
        {active === "campaigns" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-bold text-slate-800">Banners & Promos</h3>
              <button
                onClick={() => setIsCampaignOpen(true)}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-sm"
              >
                <AdminIcon className="h-4 w-4" name="plus" />
                Add Campaign
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      {["Campaign Title", "Image", "Description", "Status", "Actions"].map((h) => (
                        <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-slate-500 whitespace-nowrap" key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {campaigns.length === 0 ? (
                      <tr>
                        <td className="px-5 py-8 text-center text-sm font-medium text-slate-400" colSpan={5}>
                          No active marketing campaigns created yet.
                        </td>
                      </tr>
                    ) : (
                      campaigns.map((c) => {
                        const rawImg = c.images?.[0]?.images;
                        let imgUrl: string | undefined;
                        if (Array.isArray(rawImg) && rawImg.length > 0) {
                          imgUrl = rawImg[0];
                        } else if (rawImg && typeof rawImg === "object" && "images" in rawImg && Array.isArray((rawImg as any).images)) {
                          imgUrl = (rawImg as any).images[0];
                        }

                        const finalImgUrl = imgUrl
                          ? (imgUrl.startsWith("http") ? imgUrl : `/campaigns/${imgUrl.split("/campaigns/").pop()}`)
                          : undefined;

                        return (
                          <tr className="hover:bg-slate-50/60 transition-colors" key={c.id}>
                            <td className="px-5 py-4 font-bold text-slate-800 whitespace-nowrap">{c.title}</td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              {finalImgUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={finalImgUrl}
                                  alt=""
                                  className="h-12 w-12 rounded-lg border border-slate-200 object-cover"
                                />
                              ) : (
                                <div className="grid h-12 w-12 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400">
                                  <AdminIcon className="h-5 w-5" name="reviews" />
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-4 text-sm font-medium text-slate-500 whitespace-nowrap">{c.description || "-"}</td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <button
                                onClick={() => handleToggleCampaign(c)}
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider border transition-all hover:bg-opacity-80 ${
                                  c.status === "active"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-slate-50 text-slate-500 border-slate-200"
                                }`}
                              >
                                {c.status === "active" ? (
                                  <>
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Active
                                  </>
                                ) : (
                                  <>
                                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                    Inactive
                                  </>
                                )}
                              </button>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => handleOpenEditCampaign(c)}
                                  className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                                  title="Edit Campaign"
                                >
                                  <AdminIcon className="h-4 w-4" name="edit" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCampaign(c.id)}
                                  className="grid h-8 w-8 place-items-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition-colors"
                                  title="Delete Campaign"
                                >
                                  <AdminIcon className="h-4 w-4" name="x" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── BRANCHES TAB ─── */}
        {active === "branches" && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <BranchesSection />
          </div>
        )}

        {/* ─── USERS TAB ─── */}
        {active === "users" && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <UsersSection />
          </div>
        )}

        {/* ─── ROLES TAB ─── */}
        {active === "roles" && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <RolesSection />
          </div>
        )}

        {/* ─── ACTIVITY LOGS TAB ─── */}
        {active === "activity-logs" && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <ActivitySection />
          </div>
        )}
      </div>

      {/* Add Campaign Modal */}
      {isCampaignOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={handleCloseCampaignModal} />
          <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-800">
              {editingCampaignId ? "Edit Campaign" : "Create Campaign"}
            </h3>

            <form onSubmit={handleCreateCampaign} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  value={campTitle}
                  onChange={(e) => setCampTitle(e.target.value)}
                  placeholder="e.g. EID Special Flash Sale"
                  className="w-full h-11 border border-slate-300 rounded-lg px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Section</label>
                <select
                  required
                  value={campSectionId}
                  onChange={(e) => setCampSectionId(e.target.value)}
                  className="w-full h-11 border border-slate-300 rounded-lg px-4 text-sm font-medium bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select a section...</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>{s.title} ({s.page})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Campaign Image (Hero Slider)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCampImage(e.target.files?.[0] ?? null)}
                  className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium outline-none transition-colors focus:border-blue-500 focus:bg-white file:mr-4 file:rounded-lg file:border-0 file:bg-slate-200 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-300"
                />
              </div>

              {campImage && (
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={URL.createObjectURL(campImage)} alt="Preview" className="h-20 w-20 rounded-lg border border-slate-200 bg-white object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-slate-800">{campImage.name}</p>
                    </div>
                    <button type="button" onClick={() => setCampImage(null)} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-red-50 px-3 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors">
                      <AdminIcon className="h-3.5 w-3.5" name="x" /> Remove
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Description</label>
                <textarea
                  value={campDesc}
                  onChange={(e) => setCampDesc(e.target.value)}
                  placeholder="Promo text..."
                  className="w-full border border-slate-300 rounded-lg p-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={campStartAt}
                    onChange={(e) => setCampStartAt(e.target.value)}
                    className="w-full h-11 border border-slate-300 rounded-lg px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">End Date</label>
                  <input
                    type="date"
                    value={campEndAt}
                    onChange={(e) => setCampEndAt(e.target.value)}
                    className="w-full h-11 border border-slate-300 rounded-lg px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Status</label>
                <select
                  value={campStatus}
                  onChange={(e) => setCampStatus(e.target.value as "active" | "inactive")}
                  className="w-full h-11 border border-slate-300 rounded-lg px-4 text-sm font-medium bg-white outline-none focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleCloseCampaignModal}
                  className="h-11 px-5 rounded-lg border border-slate-300 font-bold hover:bg-slate-50 transition-colors"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-11 px-5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                >
                  {saving ? (editingCampaignId ? "Saving..." : "Creating...") : (editingCampaignId ? "Save Changes" : "Add Campaign")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
