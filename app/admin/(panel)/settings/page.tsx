import { PageHeader } from "../../_components/admin-shell";

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Store profile, admin permissions, payment, and shipping setup"
        action={<button className="h-14 rounded-lg bg-blue-600 px-6 font-black text-white">Save Changes</button>}
      />
      <section className="grid gap-6 xl:grid-cols-2">
        {[
          ["Store Profile", "NeoComerz", "Main Branch, Uttara, Dhaka"],
          ["Payment Methods", "Cash on Delivery, SSLCommerz", "bKash and Nagad pending"],
          ["Shipping", "Normal Delivery", "BDT 60 default delivery charge"],
          ["Admin Access", "Admin, Staff, Customer", "Role permissions from API roadmap"],
        ].map(([title, value, detail]) => (
          <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm" key={title}>
            <h2 className="text-2xl font-black">{title}</h2>
            <p className="mt-5 font-black text-slate-700">{value}</p>
            <p className="mt-2 font-medium text-slate-500">{detail}</p>
          </article>
        ))}
      </section>
    </>
  );
}
