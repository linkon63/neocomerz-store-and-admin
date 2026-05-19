"use client";

import { useEffect, useState } from "react";
import { AdminIcon, type AdminIconName } from "../../_components/admin-shell";
import { Button, Input, Select } from "../../_components/enterprise-ui";
import { apiRequest } from "../../../../lib/admin-api";

// ─── Types ────────────────────────────────────────────────────────────────────
type SiteSection = "general" | "contacts" | "manage-policy" | "campaigns";
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
};

function readPolicyContent(policy: Policy, key: PolicyTab) {
  return policy[key]?.content ?? "";
}

// ─── Navigation Data ──────────────────────────────────────────────────────────
const siteNav: { id: SiteSection; label: string; icon: AdminIconName; description: string }[] = [
  { id: "general", label: "General & Branding", icon: "settings", description: "Store metadata, charges, and currencies" },
  { id: "contacts", label: "Contact & Social", icon: "reviews", description: "Emails, phones & social handles" },
  { id: "manage-policy", label: "Policy Pages", icon: "orders", description: "Store legal terms and policies" },
  { id: "campaigns", label: "Campaigns", icon: "discount", description: "Landing page banners & campaigns" },
];

export default function ManageWebsitePage() {
  const [active, setActive] = useState<SiteSection>("general");
  const [settings, setSettings] = useState<StoreSettings>({});
  const [policy, setPolicy] = useState<Policy>({});
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Local state copy for Form fields
  const [shopName, setShopName] = useState("");
  const [currency, setCurrency] = useState("BDT");
  const [language, setLanguage] = useState("en");
  const [copyright, setCopyright] = useState("");
  const [insideCharge, setInsideCharge] = useState("");
  const [outsideCharge, setOutsideCharge] = useState("");

  // Contacts
  const [primaryEmail, setPrimaryEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [fbLink, setFbLink] = useState("");
  const [instaLink, setInstaLink] = useState("");

  // Policy Pages Tab
  const [activePolicy, setActivePolicy] = useState<PolicyTab>("delivery");
  const [policyContent, setPolicyContent] = useState("");

  // Campaigns Modals & Add Forms
  const [isCampaignOpen, setIsCampaignOpen] = useState(false);
  const [campTitle, setCampTitle] = useState("");
  const [campDesc, setCampDesc] = useState("");
  const [campStatus, setCampStatus] = useState<"active" | "inactive">("active");
  const [campSectionId, setCampSectionId] = useState("");
  const [campStartAt, setCampStartAt] = useState("");
  const [campEndAt, setCampEndAt] = useState("");
  const [sections, setSections] = useState<{ id: string; title: string; page: string }[]>([]);

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

      // Populate contacts
      setPrimaryEmail(settRes.email?.primary || "");
      setSupportPhone(settRes.contactNumber?.primary || "");
      setFbLink(settRes.socialContact?.facebook || "");
      setInstaLink(settRes.socialContact?.instagram || "");

      // Populate current policy content
      setPolicyContent(readPolicyContent(polyRes, activePolicy));
    } catch (err) {
      console.error(err);
      setError("Failed to retrieve website management resources.");
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
        shopName,
        currency,
        language,
        parentCompany: copyright,
        deliveryChargeInside: Number(insideCharge) || 0,
        deliveryChargeOutside: Number(outsideCharge) || 0,
        email: { primary: primaryEmail },
        contactNumber: { primary: supportPhone },
        socialContact: { facebook: fbLink, instagram: instaLink },
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

  // Campaigns Actions
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

  async function handleCreateCampaign(e: React.FormEvent) {
    e.preventDefault();
    if (!campTitle || !campSectionId) return;

    setSaving(true);
    try {
      await apiRequest("/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: campTitle,
          description: campDesc,
          status: campStatus,
          sectionId: campSectionId,
          startAt: campStartAt ? new Date(campStartAt).toISOString() : new Date().toISOString(),
          endAt: campEndAt ? new Date(campEndAt).toISOString() : undefined,
        }),
      });

      setIsCampaignOpen(false);
      setCampTitle("");
      setCampDesc("");
      setCampStatus("active");
      setCampSectionId("");
      setCampStartAt("");
      setCampEndAt("");
      await loadAllData();
    } catch (err) {
      alert("Failed to create campaign: " + (err instanceof Error ? err.message : "Error"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 font-black text-slate-600">Loading website configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-8">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-8 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-black text-slate-800">Manage Website</h2>
            <p className="mt-0.5 text-xs font-medium text-slate-500">Configure storefront content</p>
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

      {/* Main Content Pane */}
      <div className="min-w-0 flex-1">
        <div className="mb-6 border-b border-slate-200 pb-4">
          <h1 className="text-xl font-black text-slate-800">
            {siteNav.find((n) => n.id === active)?.label}
          </h1>
          <p className="mt-0.5 text-sm font-medium text-slate-500">
            {siteNav.find((n) => n.id === active)?.description}
          </p>
        </div>

        {error && <div className="mb-4 text-red-800 bg-red-50 border border-red-200 p-4 rounded-xl font-bold">{error}</div>}

        {/* ─── GENERAL TAB ─── */}
        {active === "general" && (
          <div className="space-y-5">
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
              <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3">Basic Information</h3>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">Shop Name</label>
                <Input value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="e.g. NeoComerz" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">Currency</label>
                  <Select value={currency} onChange={(e) => setCurrency(e.target.value)} options={[
                    { value: "BDT", label: "BDT — Bangladeshi Taka" },
                    { value: "USD", label: "USD — US Dollar" },
                  ]} />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">Language</label>
                  <Select value={language} onChange={(e) => setLanguage(e.target.value)} options={[
                    { value: "en", label: "English" },
                    { value: "bn", label: "Bengali" },
                  ]} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
              <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3">Shipping Rates</h3>
              <div className="grid gap-4 sm:grid-cols-2 max-w-md">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">Inside Dhaka (৳)</label>
                  <Input type="number" value={insideCharge} onChange={(e) => setInsideCharge(e.target.value)} placeholder="60" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">Outside Dhaka (৳)</label>
                  <Input type="number" value={outsideCharge} onChange={(e) => setOutsideCharge(e.target.value)} placeholder="120" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
              <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3">Branding Copyright</h3>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">Company Label</label>
                <Input value={copyright} onChange={(e) => setCopyright(e.target.value)} placeholder="e.g. NeoComerz Ltd." />
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
          <div className="space-y-5">
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
              <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3">Customer Contacts</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">Support Email Address</label>
                  <Input type="email" value={primaryEmail} onChange={(e) => setPrimaryEmail(e.target.value)} placeholder="support@domain.com" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">Helpline Phone Number</label>
                  <Input type="tel" value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} placeholder="+880 17..." />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
              <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3">Social Handles</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">Facebook Page URL</label>
                  <Input value={fbLink} onChange={(e) => setFbLink(e.target.value)} placeholder="https://facebook.com/..." />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">Instagram Profile URL</label>
                  <Input value={instaLink} onChange={(e) => setInstaLink(e.target.value)} placeholder="https://instagram.com/..." />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button size="md" variant="primary" disabled={saving} onClick={handleSaveSettings}>
                {saving ? "Saving..." : "Save Contacts"}
              </Button>
            </div>
          </div>
        )}

        {/* ─── POLICIES TAB ─── */}
        {active === "manage-policy" && (
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100">
              <nav className="flex gap-1 overflow-x-auto px-4 pt-1">
                {[
                  { id: "delivery", label: "Delivery Policy" },
                  { id: "refund", label: "Refund & Return" },
                  { id: "cancellation", label: "Cancellation" },
                  { id: "privacy", label: "Privacy Policy" },
                  { id: "terms", label: "Terms & Conditions" },
                ].map((tab) => (
                  <button
                    className={`whitespace-nowrap border-b-2 px-4 py-3 text-xs font-black transition-colors ${
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
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Policy Page Content</label>
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
              <h3 className="text-md font-black text-slate-800">Banners & Promos</h3>
              <button
                onClick={() => setIsCampaignOpen(true)}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-black text-white hover:bg-blue-700 transition-colors"
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
                      {["Campaign Title", "Description", "Status", "Actions"].map((h) => (
                        <th className="px-5 py-3.5 text-xs font-black uppercase tracking-wide text-slate-500" key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {campaigns.length === 0 ? (
                      <tr>
                        <td className="px-5 py-8 text-center text-sm font-medium text-slate-400" colSpan={4}>
                          No active marketing campaigns created yet.
                        </td>
                      </tr>
                    ) : (
                      campaigns.map((c) => (
                        <tr className="hover:bg-slate-50/60" key={c.id}>
                          <td className="px-5 py-4 font-black text-slate-800">{c.title}</td>
                          <td className="px-5 py-4 text-sm font-medium text-slate-500">{c.description || "-"}</td>
                          <td className="px-5 py-4">
                            <button
                              onClick={() => handleToggleCampaign(c)}
                              className={`rounded-full px-3 py-0.5 text-xs font-black border transition-all ${
                                c.status === "active"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                                  : "bg-slate-100 text-slate-600 border-slate-300"
                              }`}
                            >
                              {c.status === "active" ? "Active" : "Inactive"}
                            </button>
                          </td>
                          <td className="px-5 py-4">
                            <button
                              onClick={() => handleDeleteCampaign(c.id)}
                              className="grid h-8 w-8 place-items-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50"
                            >
                              <AdminIcon className="h-4 w-4" name="x" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Campaign Modal */}
      {isCampaignOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsCampaignOpen(false)} />
          <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-black text-slate-800">Create Campaign</h3>

            <form onSubmit={handleCreateCampaign} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">Campaign Title</label>
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
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">Section</label>
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
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">Description</label>
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
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={campStartAt}
                    onChange={(e) => setCampStartAt(e.target.value)}
                    className="w-full h-11 border border-slate-300 rounded-lg px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">End Date</label>
                  <input
                    type="date"
                    value={campEndAt}
                    onChange={(e) => setCampEndAt(e.target.value)}
                    className="w-full h-11 border border-slate-300 rounded-lg px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">Status</label>
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
                  onClick={() => setIsCampaignOpen(false)}
                  className="h-11 px-5 rounded-lg border border-slate-300 font-bold hover:bg-slate-50 transition-colors"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-11 px-5 rounded-lg bg-blue-600 text-white font-black hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                >
                  {saving ? "Creating..." : "Add Campaign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
