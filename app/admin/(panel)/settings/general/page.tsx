"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AdminIcon, PageHeader } from "../../../_components/admin-shell";
import { apiRequest, type AppSettings } from "../../../../../lib/admin-api";
import {
  FieldLabel,
  Input,
  StatusToggle,
  ErrorBanner,
  SuccessBanner,
} from "../_components/settings-ui";

// ─── Constants ────────────────────────────────────────────────────────────────

const CURRENCIES = ["BDT", "USD", "EUR", "GBP", "INR", "SAR", "AED"];
const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "bn", label: "Bengali" },
  { value: "ar", label: "Arabic" },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Left label + right content two-column row */
function SettingsRow({
  label,
  hint,
  children,
  separator = true,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  separator?: boolean;
}) {
  return (
    <>
      <div className="grid gap-x-8 gap-y-4 sm:grid-cols-[220px_1fr]">
        <div className="pt-1">
          <p className="text-sm font-black text-slate-800">{label}</p>
          {hint && <p className="mt-1 text-xs font-medium leading-5 text-slate-500">{hint}</p>}
        </div>
        <div>{children}</div>
      </div>
      {separator && <div className="border-t border-slate-100" />}
    </>
  );
}

/** Clickable logo/icon upload slot */
function LogoSlot({
  label,
  hint,
  url,
  onPick,
  onRemove,
}: {
  label: string;
  hint?: string;
  url?: string;
  onPick: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        className="relative flex h-[120px] w-[120px] items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 transition hover:border-blue-400 hover:bg-blue-50"
        onClick={url ? undefined : onPick}
        type="button"
      >
        {url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img alt={label} className="h-full w-full object-contain p-2" src={url} />
        ) : (
          <AdminIcon className="h-8 w-8 text-slate-300" name="plus" />
        )}
        {url && (
          <button
            aria-label={`Remove ${label}`}
            className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-red-500 text-white shadow"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            type="button"
          >
            <AdminIcon className="h-3 w-3" name="x" />
          </button>
        )}
      </button>
      <p className="flex items-center gap-1 text-xs font-black text-slate-600">
        {label}
        {hint && (
          <span className="inline-flex h-4 w-4 cursor-default items-center justify-center rounded-full border border-slate-300 text-[10px] font-black text-slate-400" title={hint}>
            i
          </span>
        )}
      </p>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function GeneralSettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({
    currency: "BDT",
    language: "en",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Logo upload state
  const [logoTab, setLogoTab] = useState<"icon" | "icon+text">("icon");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // ── Load ──────────────────────────────────────────────────────────────────

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest<AppSettings>("/settings");
      if (data) setSettings(data);
    } catch {
      // first run with no settings — fine
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Revoke object URLs on unmount
  useEffect(() => {
    return () => {
      if (iconPreview) URL.revokeObjectURL(iconPreview);
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [iconPreview, logoPreview]);

  // ── File pickers ───────────────────────────────────────────────────────────

  function pickIcon(file: File) {
    if (iconPreview) URL.revokeObjectURL(iconPreview);
    setIconFile(file);
    setIconPreview(URL.createObjectURL(file));
  }

  function removeIcon() {
    if (iconPreview) URL.revokeObjectURL(iconPreview);
    setIconFile(null);
    setIconPreview(null);
    setSettings((p) => ({ ...p, icon: "" }));
    if (iconInputRef.current) iconInputRef.current.value = "";
  }

  function pickLogo(file: File) {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  function removeLogo() {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(null);
    setLogoPreview(null);
    setSettings((p) => ({ ...p, logo: "" }));
    if (logoInputRef.current) logoInputRef.current.value = "";
  }

  // ── Upload helper ──────────────────────────────────────────────────────────

  async function uploadImage(file: File, folder: string): Promise<string> {
    const body = new FormData();
    body.append("file", file);
    body.append("folder", folder);
    const result = await apiRequest<{ url: string }>("/upload", {
      method: "POST",
      body,
    });
    return result.url;
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  async function save() {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      let iconUrl = settings.icon;
      let logoUrl = settings.logo;

      // Upload new files if picked
      if (iconFile) {
        try {
          iconUrl = await uploadImage(iconFile, "settings");
        } catch {
          // fallback: keep as blob preview — server may not have upload endpoint
        }
      }
      if (logoFile) {
        try {
          logoUrl = await uploadImage(logoFile, "settings");
        } catch {
          // same fallback
        }
      }

      await apiRequest("/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopName: settings.shopName,
          currency: settings.currency,
          language: settings.language,
          copyrightYear: settings.copyrightYear,
          parentCompany: settings.parentCompany,
          parentCompanyLink: settings.parentCompanyLink,
          slogan: settings.slogan,
          isTopBarVisible: settings.isTopBarVisible,
          hideOutOfStock: settings.hideOutOfStock,
          deliveryChargeInside: Number(settings.deliveryChargeInside ?? 0),
          deliveryChargeOutside: Number(settings.deliveryChargeOutside ?? 0),
          deliveryChargeNearCity: Number(settings.deliveryChargeNearCity ?? 0),
          ...(iconUrl !== undefined && { icon: iconUrl }),
          ...(logoUrl !== undefined && { logo: logoUrl }),
        }),
      });

      setSuccess("Settings saved successfully.");
      setTimeout(() => setSuccess(""), 3000);
      await loadSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  const iconDisplayUrl = iconPreview ?? (settings.icon || null);
  const logoDisplayUrl = logoPreview ?? (settings.logo || null);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <PageHeader
        title="General"
        description="Manage & customize your website content & interface."
        action={
          <div className="flex gap-3">
            <button
              className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              disabled={saving}
              onClick={loadSettings}
              type="button"
            >
              Cancel
            </button>
            <button
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-black text-white transition hover:bg-blue-700 disabled:opacity-60"
              disabled={saving || loading}
              onClick={save}
              type="button"
            >
              {saving ? "Saving..." : "Update"}
            </button>
          </div>
        }
      />

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
          <p className="text-sm font-medium text-slate-400">Loading settings...</p>
        </div>
      ) : (
        <div className="space-y-0 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* ── Basic Info ── */}
          <div className="px-6 py-7 sm:px-8">
            <SettingsRow
              label="Basic Info"
              hint="Update your store name, currency, contact etc."
              separator={false}
            >
              <div className="space-y-4">
                <div>
                  <FieldLabel required>Shop Name</FieldLabel>
                  <Input
                    onChange={(v) => setSettings((p) => ({ ...p, shopName: v }))}
                    placeholder="e.g. Radi Natural Shop"
                    value={settings.shopName ?? ""}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <FieldLabel required>Default Currency</FieldLabel>
                    <select
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      onChange={(e) => setSettings((p) => ({ ...p, currency: e.target.value }))}
                      value={settings.currency ?? "BDT"}
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <FieldLabel required>Language</FieldLabel>
                    <select
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      onChange={(e) => setSettings((p) => ({ ...p, language: e.target.value }))}
                      value={settings.language ?? "en"}
                    >
                      {LANGUAGES.map((l) => (
                        <option key={l.value} value={l.value}>{l.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Choose Template — placeholder */}
                <div className="mt-2">
                  <p className="text-sm font-black text-slate-800">Choose Template</p>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">
                    Select a storefront template for your shop.
                  </p>
                  <div className="mt-3 flex min-h-[80px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6">
                    <p className="text-xs font-medium text-slate-400">
                      No templates available. Please ask the central admin to add templates.
                    </p>
                  </div>
                </div>
              </div>
            </SettingsRow>
          </div>

          {/* ── Update Logo ── */}
          <div className="px-6 py-7 sm:px-8">
            <SettingsRow
              label="Update Logo"
              hint="Add your logos as instructed to manage your website better."
              separator={false}
            >
              {/* Icon / Icon + Text tabs */}
              <div className="mb-5 flex gap-0 border-b border-slate-200">
                {(["icon", "icon+text"] as const).map((tab) => (
                  <button
                    className={`border-b-2 px-4 pb-3 pt-1 text-sm font-black transition ${
                      logoTab === tab
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                    key={tab}
                    onClick={() => setLogoTab(tab)}
                    type="button"
                  >
                    {tab === "icon" ? "Icon" : "Icon + Text"}
                  </button>
                ))}
              </div>

              {/* Logo slots */}
              <div className="flex flex-wrap gap-5">
                {logoTab === "icon" ? (
                  /* Icon slot */
                  <LogoSlot
                    hint="Small square icon used in browser tabs and app icons."
                    label="Icon"
                    onPick={() => iconInputRef.current?.click()}
                    onRemove={removeIcon}
                    url={iconDisplayUrl ?? undefined}
                  />
                ) : (
                  /* Icon + Text slot (logo) */
                  <LogoSlot
                    hint="Full logo with text used in the header."
                    label="Icon + Text"
                    onPick={() => logoInputRef.current?.click()}
                    onRemove={removeLogo}
                    url={logoDisplayUrl ?? undefined}
                  />
                )}
              </div>

              {/* Hidden file inputs */}
              <input
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) pickIcon(f);
                }}
                ref={iconInputRef}
                type="file"
              />
              <input
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) pickLogo(f);
                }}
                ref={logoInputRef}
                type="file"
              />
            </SettingsRow>
          </div>

          {/* ── UI Settings ── */}
          <div className="px-6 py-7 sm:px-8">
            <SettingsRow
              label="UI Settings"
              hint="Update your top bar settings."
              separator={false}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
                  <div>
                    <p className="text-sm font-black text-slate-800">Display Top bar</p>
                    <p className="mt-0.5 text-xs font-medium text-slate-500">
                      This will show the text in the center of the top bar.
                    </p>
                  </div>
                  <StatusToggle
                    active={settings.isTopBarVisible ?? false}
                    onChange={(v) => setSettings((p) => ({ ...p, isTopBarVisible: v }))}
                  />
                </div>
                <div>
                  <FieldLabel required>Top bar Slogan</FieldLabel>
                  <Input
                    onChange={(v) => setSettings((p) => ({ ...p, slogan: v }))}
                    placeholder="Enter top bar slogan"
                    value={settings.slogan ?? ""}
                  />
                </div>
              </div>
            </SettingsRow>
          </div>

          {/* ── Product Setting ── */}
          <div className="px-6 py-7 sm:px-8">
            <SettingsRow
              label="Product Setting"
              hint="Manage your out of stock product in website."
              separator={false}
            >
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
                <div>
                  <p className="text-sm font-black text-slate-800">Hide Out of Stock Products</p>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">
                    Product will display in website if the products not in stock in inventory.
                  </p>
                </div>
                <StatusToggle
                  active={settings.hideOutOfStock ?? false}
                  onChange={(v) => setSettings((p) => ({ ...p, hideOutOfStock: v }))}
                />
              </div>
            </SettingsRow>
          </div>

          {/* ── Copyright & Company ── */}
          <div className="px-6 py-7 sm:px-8">
            <SettingsRow
              label="Copyright & Company"
              hint="Footer copyright year and parent company details."
              separator={false}
            >
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <FieldLabel>Copyright Year</FieldLabel>
                    <Input
                      onChange={(v) => setSettings((p) => ({ ...p, copyrightYear: v }))}
                      placeholder="2026"
                      value={settings.copyrightYear ?? ""}
                    />
                  </div>
                  <div>
                    <FieldLabel>Parent Company</FieldLabel>
                    <Input
                      onChange={(v) => setSettings((p) => ({ ...p, parentCompany: v }))}
                      placeholder="e.g. Acme Corp"
                      value={settings.parentCompany ?? ""}
                    />
                  </div>
                </div>
                <div>
                  <FieldLabel>Parent Company Link</FieldLabel>
                  <Input
                    onChange={(v) => setSettings((p) => ({ ...p, parentCompanyLink: v }))}
                    placeholder="https://acmecorp.com"
                    type="url"
                    value={settings.parentCompanyLink ?? ""}
                  />
                </div>
              </div>
            </SettingsRow>
          </div>

          {/* ── Feedback + Save ── */}
          <div className="px-6 py-6 sm:px-8">
            {error && <div className="mb-4"><ErrorBanner message={error} /></div>}
            {success && <div className="mb-4"><SuccessBanner message={success} /></div>}
            <div className="flex justify-end gap-3">
              <button
                className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                disabled={saving}
                onClick={loadSettings}
                type="button"
              >
                Cancel
              </button>
              <button
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-black text-white transition hover:bg-blue-700 disabled:opacity-60"
                disabled={saving || loading}
                onClick={save}
                type="button"
              >
                <AdminIcon className="h-4 w-4" name="check" />
                {saving ? "Saving..." : "Update"}
              </button>
            </div>
          </div>

        </div>
      )}
    </>
  );
}
