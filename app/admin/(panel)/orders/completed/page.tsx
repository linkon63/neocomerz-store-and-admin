import { AdminIcon, PageHeader } from "../../../_components/admin-shell";
import { orders } from "../../../_components/admin-data";

export default function CompletedOrdersPage() {
  return (
    <>
      <PageHeader
        title="Completed Orders"
        description="Delivered and fully paid customer orders"
      />
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="p-5">
          <label className="flex h-11 max-w-xl items-center gap-3 rounded-lg border-2 border-slate-200 bg-white px-4 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition-all">
            <AdminIcon className="h-5 w-5 text-slate-400" name="search" />
            <input className="w-full bg-transparent text-sm font-medium outline-none" placeholder="Search completed orders" />
          </label>
        </div>
        <div className="divide-y divide-slate-100">
          {orders.slice(0, 4).map((order) => (
            <div className="flex items-center justify-between p-5" key={order.no}>
              <div>
                <p className="font-semibold text-slate-800">{order.no}</p>
                <p className="text-sm font-medium text-slate-500">Delivered · Apr 18, 2026</p>
              </div>
              <span className="inline-flex rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Paid
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
