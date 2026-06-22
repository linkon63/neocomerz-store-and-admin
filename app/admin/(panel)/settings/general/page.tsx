"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AdminIcon, PageHeader } from "../../../_components/admin-shell";
import { apiRequest, resolveImageUrl, type AppSettings } from "../../../../../lib/admin-api";
import { useSettingsSaving, useSettingsLoading } from "../../../_hooks/use-settings";
import {
  FieldLabel,
  Input,
  SaveButton,
  StatusToggle,
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
  const containerClass = "relative flex h-[120px] w-[120px] items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 transition";
  
  return (
    <div className="flex flex-col items-center gap-2">
      {url ? (
        <div className={containerClass}>
          <img alt={label} className="h-full w-full object-contain p-2" src={url} />
          <button
            aria-label={`Remove ${label}`}
            className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-red-500 text-white shadow hover:bg-red-650 transition cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            type="button"
          >
            <AdminIcon className="h-3 w-3" name="x" />
          </button>
        </div>
      ) : (
        <button
          className={`${containerClass} hover:border-slate-400 hover:bg-slate-100 cursor-pointer`}
          onClick={onPick}
          type="button"
        >
          <AdminIcon className="h-8 w-8 text-slate-300" name="plus" />
        </button>
      )}
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
  const { saving, saveSettings } = useSettingsSaving();
  const { loading, loadSettings: loadData } = useSettingsLoading();

  // Logo upload state
  const [logoTab, setLogoTab] = useState<"icon" | "icon+text" | "favicon">("icon");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  // ── Load ──────────────────────────────────────────────────────────────────

  const loadSettings = useCallback(async () => {
    const data = await loadData();
    if (data) setSettings(data);
  }, [loadData]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Revoke object URLs on unmount
  useEffect(() => {
    return () => {
      if (iconPreview) URL.revokeObjectURL(iconPreview);
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      if (faviconPreview) URL.revokeObjectURL(faviconPreview);
    };
  }, [iconPreview, logoPreview, faviconPreview]);

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

  function pickFavicon(file: File) {
    if (faviconPreview) URL.revokeObjectURL(faviconPreview);
    setFaviconFile(file);
    setFaviconPreview(URL.createObjectURL(file));
  }

  function removeFavicon() {
    if (faviconPreview) URL.revokeObjectURL(faviconPreview);
    setFaviconFile(null);
    setFaviconPreview(null);
    setSettings((p) => ({ ...p, favicon: "" }));
    if (faviconInputRef.current) faviconInputRef.current.value = "";
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
    let iconUrl = settings.icon;
    let logoUrl = settings.logo;
    let faviconUrl = settings.favicon;

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
    if (faviconFile) {
      try {
        faviconUrl = await uploadImage(faviconFile, "settings");
      } catch {
        // same fallback
      }
    }

    await saveSettings("/settings", {
      shopName: settings.shopName,
      currency: settings.currency,
      language: settings.language,
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
      ...(faviconUrl !== undefined && { favicon: faviconUrl }),
    }, {
      successMessage: "Settings saved successfully.",
      onSuccess: loadSettings,
    });
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  const iconDisplayUrl = iconPreview ?? (settings.icon ? resolveImageUrl(settings.icon) : null);
  const logoDisplayUrl = logoPreview ?? (settings.logo ? resolveImageUrl(settings.logo) : null);
  const faviconDisplayUrl = faviconPreview ?? (settings.favicon ? resolveImageUrl(settings.favicon) : null);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <PageHeader
        title="General"
        description="Manage & customize your website content & interface."
        action={
          
          <SaveButton onClick={save} saving={saving}>
            {saving ? "Saving..." : "Update"}
          </SaveButton>
        }
      />

      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-10 shadow-sm">
          <p className="text-sm font-medium text-slate-400">Loading settings...</p>
        </div>
      ) : (
        <div className="space-y-0 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white shadow-sm">

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
                      className="h-12 w-full rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
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
                      className="h-12 w-full rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
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
                {/* <div className="mt-2">
                  <p className="text-sm font-black text-slate-800">Choose Template</p>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">
                    Select a storefront template for your shop.
                  </p>
                  <div className="mt-3 flex min-h-[80px] items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50 px-4 py-6">
                    <p className="text-xs font-medium text-slate-400">
                      No templates available. Please ask the central admin to add templates.
                    </p>
                  </div>
                </div> */}
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
              {/* Icon / Icon + Text / Favicon tabs */}
              <div className="mb-5 flex gap-0 border-b border-slate-200">
                {(["icon", "icon+text", "favicon"] as const).map((tab) => (
                  <button
                    className={`border-b-2 px-4 pb-3 pt-1 text-sm font-black transition ${
                      logoTab === tab
                        ? "border-slate-900 text-slate-900"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                    key={tab}
                    onClick={() => setLogoTab(tab)}
                    type="button"
                  >
                    {tab === "icon" ? "Icon" : tab === "icon+text" ? "Icon + Text" : "Favicon"}
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
                ) : logoTab === "icon+text" ? (
                  /* Icon + Text slot (logo) */
                  <LogoSlot
                    hint="Full logo with text used in the header."
                    label="Icon + Text"
                    onPick={() => logoInputRef.current?.click()}
                    onRemove={removeLogo}
                    url={logoDisplayUrl ?? undefined}
                  />
                ) : (
                  /* Favicon slot */
                  <LogoSlot
                    hint="Small icon displayed in the browser tab."
                    label="Favicon"
                    onPick={() => faviconInputRef.current?.click()}
                    onRemove={removeFavicon}
                    url={faviconDisplayUrl ?? undefined}
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
              <input
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) pickFavicon(f);
                }}
                ref={faviconInputRef}
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
                {/* <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-5 py-4">
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
                </div> */}
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
          {/* <div className="px-6 py-7 sm:px-8">
            <SettingsRow
              label="Product Setting"
              hint="Manage your out of stock product in website."
              separator={false}
            >
              <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-5 py-4">
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
          </div> */}

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
                    <div className="flex h-12 items-center rounded-md border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-500">
                      {new Date().getFullYear()}
                    </div>
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

          <div className="px-6 py-6 sm:px-8" />

        </div>
      )}
    </>
  );
}
