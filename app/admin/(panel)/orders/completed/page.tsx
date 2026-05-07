import { AdminIcon, PageHeader } from "../../../_components/admin-shell";
import { orders } from "../../../_components/admin-data";

export default function CompletedOrdersPage() {
  return (
    <>
      <PageHeader
        title="Completed Orders"
        description="Delivered and fully paid customer orders"
      />
      <section className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="p-5">
          <label className="flex h-14 max-w-xl items-center gap-3 rounded-lg border border-slate-300 px-4">
            <AdminIcon className="h-5 w-5 text-slate-400" name="search" />
            <input className="w-full bg-transparent outline-none" placeholder="Search completed orders" />
          </label>
        </div>
        <div className="divide-y divide-slate-100">
          {orders.slice(0, 4).map((order) => (
            <div className="flex items-center justify-between p-5" key={order.no}>
              <div>
                <p className="font-black">{order.no}</p>
                <p className="font-medium text-slate-500">Delivered · Apr 18, 2026</p>
              </div>
              <span className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1 font-black text-emerald-700">
                Paid
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
