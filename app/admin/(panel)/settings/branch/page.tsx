"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { PageHeader } from "../../../_components/admin-shell";
import { apiRequest, type AppSettings } from "../../../../../lib/admin-api";
import {
  SettingsCard,
  FieldLabel,
  Input,
  Textarea,
  SaveButton,
} from "../_components/settings-ui";

const MapPicker = dynamic(() => import("./map-picker"), { ssr: false });

function toNum(v: number | string | null | undefined): string {
  if (v === null || v === undefined || v === "") return "";
  return String(Number(v));
}

export default function BranchPage() {
  const [settings, setSettings] = useState<AppSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest<AppSettings>("/settings");
      if (data) setSettings(data);
    } catch {
      // ok on first run
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  async function save() {
    setSaving(true);
    try {
      await apiRequest("/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchName: settings.branchName ?? null,
          branchAddress: settings.branchAddress ?? null,
          branchLat: settings.branchLat ?? null,
          branchLng: settings.branchLng ?? null,
        }),
      });
      toast.success("Branch settings saved successfully.");
      await loadSettings();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Branch"
        description="Manage & customize your website content & interface."
        action={
          <SaveButton onClick={save} saving={saving}>
            Save Branch
          </SaveButton>
        }
      />

      <SettingsCard title="Branch Settings">
        {loading ? (
          <p className="py-8 text-sm font-medium text-slate-400">Loading...</p>
        ) : (
          <div className="space-y-8">

            {/* ── Branch Info ── */}
            <div className="grid gap-x-8 gap-y-5 sm:grid-cols-[200px_1fr]">
              <div className="pt-1">
                <p className="text-sm font-black text-slate-800">Branch Info</p>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  Select branch to manage eCommerce.
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <FieldLabel>Branch Name</FieldLabel>
                  <Input
                    onChange={(v) => setSettings((p) => ({ ...p, branchName: v }))}
                    placeholder="e.g. Dhaka"
                    value={settings.branchName ?? ""}
                  />
                </div>
                <div>
                  <FieldLabel>Branch Address</FieldLabel>
                  <Textarea
                    onChange={(v) => setSettings((p) => ({ ...p, branchAddress: v }))}
                    placeholder="Enter full branch address"
                    rows={4}
                    value={settings.branchAddress ?? ""}
                  />
                </div>
              </div>
            </div>

            {/* ── Branch Location (Map) ── */}
            <div className="grid gap-x-8 gap-y-5 sm:grid-cols-[200px_1fr]">
              <div className="pt-1">
                <p className="text-sm font-black text-slate-800">Branch Location</p>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  Click on the map to set branch location. Drag the marker to adjust.
                </p>
              </div>
              <div>
                <MapPicker
                  lat={settings.branchLat ?? null}
                  lng={settings.branchLng ?? null}
                  onChange={(lat, lng) => setSettings((p) => ({ ...p, branchLat: lat, branchLng: lng }))}
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-2" />

          </div>
        )}
      </SettingsCard>
    </>
  );
}
