import { PageHeader } from "../../_components/admin-shell";

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Report"
        description="Sales, inventory, customer, and order reporting"
        action={<button className="h-14 rounded-lg border border-slate-300 bg-white px-6 font-black">Export Report</button>}
      />
      <section className="grid gap-5 lg:grid-cols-4">
        {[
          ["Revenue", "৳482,950"],
          ["Orders", "1,284"],
          ["Refunds", "৳4,240"],
          ["Low stock", "17"],
        ].map(([label, value]) => (
          <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm" key={label}>
            <p className="font-black text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-black">{value}</p>
          </article>
        ))}
      </section>
      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
        <h2 className="text-2xl font-black">Revenue by date</h2>
        <div className="mt-6 h-80 border-l border-b border-slate-200">
          <div className="flex h-full items-end gap-6 px-8">
            {[42, 68, 38, 78, 52, 88, 64].map((height, index) => (
              <div className="w-10 rounded-t bg-blue-600" key={index} style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
