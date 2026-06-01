"use client";

import { useState } from "react";
import { Input } from "../enterprise-ui";
import { PageHeader, SectionCard, FieldLabel, ToggleRow, SaveBar } from "./shared-ui";

export function InventorySettingsSection() {
  const [trackInventory, setTrackInventory] = useState(true);
  const [allowNegative, setAllowNegative] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState("5");

  return (
    <>
      <PageHeader title="Inventory Settings" description="Configure how inventory is tracked and managed." />
      <div className="space-y-5">
        <SectionCard title="Tracking">
          <div className="divide-y divide-slate-100">
            <ToggleRow label="Track Inventory" description="Enable stock tracking for all products." checked={trackInventory} onChange={setTrackInventory} />
            <ToggleRow label="Allow Negative Stock" description="Allow orders even when stock reaches zero." checked={allowNegative} onChange={setAllowNegative} />
          </div>
        </SectionCard>
        <SectionCard title="Alerts">
          <div className="max-w-xs">
            <FieldLabel required>Low Stock Threshold</FieldLabel>
            <Input type="number" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)} placeholder="5" />
            <p className="mt-1 text-xs text-slate-400">Alert when stock falls below this number.</p>
          </div>
        </SectionCard>
        <SaveBar onSave={() => {}} />
      </div>
    </>
  );
}
