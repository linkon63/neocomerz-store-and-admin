"use client";

import { useState } from "react";
import { PageHeader, SectionCard, ToggleRow, SaveBar } from "./shared-ui";

export function PosSettingsSection() {
  const [printReceipt, setPrintReceipt] = useState(true);
  const [cashDrawer, setCashDrawer] = useState(false);
  const [taxOnPos, setTaxOnPos] = useState(true);

  return (
    <>
      <PageHeader title="POS Settings" description="Configure your point of sale experience." />
      <div className="space-y-5">
        <SectionCard title="Hardware">
          <div className="divide-y divide-slate-100">
            <ToggleRow label="Auto-print Receipt" description="Automatically print receipt after each sale." checked={printReceipt} onChange={setPrintReceipt} />
            <ToggleRow label="Cash Drawer" description="Open cash drawer after each cash payment." checked={cashDrawer} onChange={setCashDrawer} />
          </div>
        </SectionCard>
        <SectionCard title="Tax">
          <ToggleRow label="Apply Tax on POS Sales" description="Include tax calculation in POS transactions." checked={taxOnPos} onChange={setTaxOnPos} />
        </SectionCard>
        <SaveBar onSave={() => {}} />
      </div>
    </>
  );
}
