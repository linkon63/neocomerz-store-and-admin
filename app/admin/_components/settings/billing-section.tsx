"use client";

import { Button, Badge } from "../enterprise-ui";
import { PageHeader, SectionCard } from "./shared-ui";

export function BillingSection() {
  return (
    <>
      <PageHeader title="Billing & Subscription" description="Manage your plan and payment details." />
      <div className="space-y-5">
        <SectionCard title="Current Plan">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-base font-semibold text-slate-800">Free Plan</p>
                <Badge variant="info">Active</Badge>
              </div>
              <p className="mt-1 text-sm font-medium text-slate-500">Up to 100 products · 1 branch · Basic analytics</p>
            </div>
            <Button variant="primary" size="md">Upgrade Plan</Button>
          </div>
        </SectionCard>
        <SectionCard title="Usage">
          {[
            { label: "Products", used: 24, limit: 100 },
            { label: "Orders this month", used: 87, limit: 500 },
            { label: "Storage", used: 1.2, limit: 5, unit: "GB" },
          ].map((item) => (
            <div className="mb-4 last:mb-0" key={item.label}>
              <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-600">
                <span>{item.label}</span>
                <span>{item.used}{item.unit ?? ""} / {item.limit}{item.unit ?? ""}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${Math.min((item.used / item.limit) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </SectionCard>
      </div>
    </>
  );
}
