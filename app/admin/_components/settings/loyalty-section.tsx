"use client";

import { useState } from "react";
import { Input } from "../enterprise-ui";
import { PageHeader, SectionCard, FieldLabel, ToggleRow, SaveBar } from "./shared-ui";

export function LoyaltySection() {
  const [enabled, setEnabled] = useState(false);
  const [pointsPerUnit, setPointsPerUnit] = useState("1");
  const [redeemRate, setRedeemRate] = useState("100");

  return (
    <>
      <PageHeader title="Loyalty Program" description="Reward customers for their purchases." />
      <div className="space-y-5">
        <SectionCard title="Program Settings">
          <div className="space-y-4">
            <ToggleRow label="Enable Loyalty Program" description="Customers earn points on every purchase." checked={enabled} onChange={setEnabled} />
            {enabled && (
              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <div>
                  <FieldLabel required>Points per ৳1 spent</FieldLabel>
                  <Input type="number" value={pointsPerUnit} onChange={(e) => setPointsPerUnit(e.target.value)} placeholder="1" />
                </div>
                <div>
                  <FieldLabel required>Points needed for ৳1 discount</FieldLabel>
                  <Input type="number" value={redeemRate} onChange={(e) => setRedeemRate(e.target.value)} placeholder="100" />
                </div>
              </div>
            )}
          </div>
        </SectionCard>
        <SaveBar onSave={() => {}} />
      </div>
    </>
  );
}
