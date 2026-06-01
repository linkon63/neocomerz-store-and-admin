"use client";

import { AdminIcon } from "../admin-shell";
import { Badge } from "../enterprise-ui";
import { PageHeader, SectionCard } from "./shared-ui";

export function RegistersSection() {
  return (
    <>
      <PageHeader title="Registers" description="Manage your POS registers." />
      <SectionCard title="Register List" description="All active POS registers in your store.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-left">
            <thead>
              <tr className="border-b border-slate-100">
                {["Name", "Branch", "Status", "Actions"].map((h) => (
                  <th className="pb-3 text-xs font-medium uppercase tracking-wide text-slate-500" key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { name: "Register 1", branch: "Main Branch", active: true },
                { name: "Register 2", branch: "Main Branch", active: false },
              ].map((r) => (
                <tr className="hover:bg-slate-50/60" key={r.name}>
                  <td className="py-3.5 text-sm font-medium text-slate-800">{r.name}</td>
                  <td className="py-3.5 text-sm font-medium text-slate-600">{r.branch}</td>
                  <td className="py-3.5">
                    <Badge variant={r.active ? "success" : "neutral"}>{r.active ? "Active" : "Inactive"}</Badge>
                  </td>
                  <td className="py-3.5">
                    <button className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
                      <AdminIcon className="h-4 w-4" name="edit" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </>
  );
}
