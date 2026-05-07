import { AdminIcon, PageHeader } from "../../../_components/admin-shell";
import { orders } from "../../../_components/admin-data";

export default function CanceledOrdersPage() {
  return (
    <>
      <PageHeader
        title="Canceled Orders"
        description="Review canceled ecommerce orders and refund status"
      />
      <section className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="p-5">
          <label className="flex h-14 max-w-xl items-center gap-3 rounded-lg border border-slate-300 px-4">
            <AdminIcon className="h-5 w-5 text-slate-400" name="search" />
            <input className="w-full bg-transparent outline-none" placeholder="Search canceled orders" />
          </label>
        </div>
        <div className="divide-y divide-slate-100">
          {orders.slice(1, 5).map((order) => (
            <div className="flex items-center justify-between p-5" key={order.no}>
              <div>
                <p className="font-black">{order.no}</p>
                <p className="font-medium text-slate-500">Canceled by customer · Apr 16, 2026</p>
              </div>
              <span className="rounded-md border border-rose-300 bg-rose-50 px-3 py-1 font-black text-rose-700">
                Refund pending
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
