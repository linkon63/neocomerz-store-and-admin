"use client";

import { useEffect, useState } from "react";
import { Input, Select } from "../enterprise-ui";
import { apiRequest } from "../../../../lib/admin-api";
import { PageHeader, SectionCard, FieldLabel, ToggleRow, SaveBar } from "./shared-ui";

export function SiteSettingsSection() {
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
