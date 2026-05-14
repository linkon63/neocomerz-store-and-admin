"use client";

import { useState } from "react";
import { AdminIcon } from "../admin-shell";
import { FieldLabel } from "../ui/field-label";
import { TextInput } from "../ui/text-input";
import { SelectInput } from "../ui/select-input";
import { SectionRow } from "./section-row";

const themes = [
  { id: "cap", name: "Cap Template" },
  { id: "electronics", name: "Electronics Template" },
  { id: "personal-care", name: "Personal Care" },
  { id: "luxury", name: "Luxury Crockeries" },
];

export function GeneralPanel() {
  const [storeName, setStoreName] = useState("");
  const [currency, setCurrency] = useState("");
  const [language, setLanguage] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("luxury");
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

      <SectionRow title="Choose Template" description="Select a storefront template for your shop.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {themes.map((theme) => {
            const isSelected = selectedTheme === theme.id;
            return (
              <button
                className={`overflow-hidden rounded-xl border-2 text-left transition-all ${
                  isSelected ? "border-blue-600" : "border-slate-200 hover:border-slate-300"
                }`}
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                type="button"
              >
                <div className="flex h-28 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                  <AdminIcon className="h-8 w-8 text-slate-300" name="store" />
                </div>
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-xs font-black text-slate-700">{theme.name}</span>
                  {isSelected && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-black text-white">
                      <AdminIcon className="h-3 w-3" name="check" />
                      Selected
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </SectionRow>

      <SectionRow title="Update Logo" description="Add your logos as instructed to manage your website better.">
        <div>
          <div className="mb-5 flex w-fit gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
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
                      onClick={() => document.getElementById(`logo-${label}`)?.click()}
                      type="button"
                    >
                      <AdminIcon className="h-5 w-5" name="plus" />
                    </button>
                  )}
                  <button
                    className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full border border-slate-300 bg-white text-slate-400 hover:bg-slate-50"
                    onClick={() => setter(null)}
                    type="button"
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

      <SectionRow title="Payment Methods" description="Add your payment methods to display on the home.">
        <div className="flex h-28 w-28 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white">
          <div className="text-center">
            <AdminIcon className="mx-auto h-6 w-6 text-slate-300" name="plus" />
            <p className="mt-1 text-xs font-medium text-slate-400">Payment Logo</p>
          </div>
        </div>
      </SectionRow>

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
              Do you have any parent company name?
              <br />
              <span className="text-slate-400">This will display with the copyright text.</span>
            </span>
          </label>
        </div>
      </SectionRow>

      <SectionRow title="Fraud Checker" description="Configure settings for the FraudChecker API integration.">
        <label className="block max-w-lg">
          <FieldLabel>Fraud Checker API Key</FieldLabel>
          <TextInput value={fraudKey} onChange={setFraudKey} placeholder="Enter valid api key" type="password" />
        </label>
      </SectionRow>

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
