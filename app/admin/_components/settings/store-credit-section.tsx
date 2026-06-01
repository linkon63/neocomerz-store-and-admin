"use client";

import { useState } from "react";
import { Input } from "../enterprise-ui";
import { PageHeader, SectionCard, FieldLabel, ToggleRow, SaveBar } from "./shared-ui";

export function StoreCreditSection() {
  const [creditEnabled, setCreditEnabled] = useState(true);
  const [refundAuto, setRefundAuto] = useState(false);
  const [refundDays, setRefundDays] = useState("7");

  return (
    <>
      <PageHeader title="Store Credit & Refund" description="Configure store credit and refund policies." />
      <div className="space-y-5">
        <SectionCard title="Store Credit">
          <ToggleRow label="Enable Store Credit" description="Allow customers to earn and spend store credit." checked={creditEnabled} onChange={setCreditEnabled} />
        </SectionCard>
        <SectionCard title="Refund Policy">
          <div className="space-y-4">
            <ToggleRow label="Auto-approve Refunds" description="Automatically approve refund requests." checked={refundAuto} onChange={setRefundAuto} />
            <div className="max-w-xs">
              <FieldLabel>Refund Window (days)</FieldLabel>
              <Input type="number" value={refundDays} onChange={(e) => setRefundDays(e.target.value)} placeholder="7" />
            </div>
          </div>
        </SectionCard>
        <SaveBar onSave={() => {}} />
      </div>
    </>
  );
}
