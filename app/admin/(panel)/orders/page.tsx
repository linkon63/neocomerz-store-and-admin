import {
  AdminIcon,
  PageHeader,
  ProductThumb,
} from "../../_components/admin-shell";
import { orders, products } from "../../_components/admin-data";

const tabs = [
  "Order Placed",
  "Packaging",
  "Ready to Ship",
  "On the Way",
  "Delivered",
  "Failed",
];

export default function OrdersPage() {
  const selected = orders[0];
  const product = products[0];

  return (
    <>
      <PageHeader
        title="Order Placed"
        description="Order placed content will be here"
        action={
          <button className="inline-flex h-14 items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 font-black">
            <AdminIcon className="h-5 w-5" name="download" />
            Export List
          </button>
        }
      />

      <section>
        <div className="mb-6 flex gap-7 overflow-x-auto border-b border-slate-300">
          {tabs.map((tab, index) => (
            <button
              className={`whitespace-nowrap pb-4 text-lg font-black ${
                index === 0
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-slate-500"
              }`}
              key={tab}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid gap-7 xl:grid-cols-[380px_1fr]">
          <aside className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex gap-3 p-3">
              <label className="flex h-12 flex-1 items-center gap-3 rounded-lg border border-slate-300 px-4">
                <AdminIcon className="h-5 w-5 text-slate-400" name="search" />
                <input
                  className="w-full bg-transparent font-medium outline-none"
                  placeholder="Order no. / Phone no."
                />
              </label>
              <button className="grid h-12 w-12 place-items-center rounded-lg border border-slate-300 font-black">
                <AdminIcon className="h-5 w-5" name="filter" />
              </button>
            </div>
            <div className="divide-y divide-slate-200">
              {orders.map((order, index) => (
                <button
                  className={`flex w-full justify-between p-4 text-left ${
                    index === 0 ? "bg-sky-50" : "bg-white"
                  }`}
                  key={order.no}
                >
                  <div>
                    <p className="font-black">{order.no}</p>
                    <p className="font-medium text-slate-600">Apr 16, 2026</p>
                    <span className="mt-2 inline-flex rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-700">
                      Unpaid
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-black">{order.total}</p>
                    <p className="font-medium text-slate-700">1Items</p>
                    <span className="mt-2 inline-flex rounded-md border border-rose-300 bg-rose-50 px-2 py-1 text-xs font-black text-rose-700">
                      COD
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <section>
            <div className="mb-7 flex flex-col justify-between gap-4 rounded-xl bg-white p-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-emerald-600 text-white">
                  <AdminIcon className="h-6 w-6" name="check" />
                </span>
                <div>
                  <p className="font-black">Order {selected.status}</p>
                  <p className="font-medium">Apr 16, 2026, 03:41 PM</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="rounded-lg bg-emerald-600 px-4 py-3 font-black text-white">
                  Make Payment
                </button>
                <button className="rounded-lg border border-rose-300 px-4 py-3 font-black text-rose-700">
                  Cancel Order
                </button>
                <button className="rounded-lg bg-blue-600 px-4 py-3 font-black text-white">
                  Accept
                </button>
                <button className="grid h-12 w-12 place-items-center rounded-lg border border-slate-300 font-black">
                  <AdminIcon className="h-5 w-5" name="actions" />
                </button>
              </div>
            </div>

            <article className="rounded-xl border border-slate-200 bg-white p-7">
              <div className="grid gap-6 border-b border-slate-200 pb-7 lg:grid-cols-[1fr_360px]">
                <div>
                  <h2 className="text-3xl font-black">
                    Imran Hossain (01750042986)
                  </h2>
                  <p className="mt-8 text-sm font-black uppercase tracking-[0.16em] text-slate-500">
                    <span className="inline-flex items-center gap-2">
                      Shipping & Billing Address
                      <AdminIcon className="h-4 w-4" name="edit" />
                    </span>
                  </p>
                  <p className="mt-6 font-black text-slate-700">Uttara, Uttara,</p>
                </div>
                <div className="grid grid-cols-[1fr_1fr] gap-y-3 text-right font-medium">
                  <p className="text-left text-slate-600">Order #</p>
                  <p className="font-black">{selected.no}</p>
                  <p className="text-left text-slate-600">Order Date</p>
                  <p className="font-black">Apr 16, 2026, 03:41 PM</p>
                  <p className="text-left text-slate-600">Payment Status</p>
                  <p>
                    <span className="rounded-md border border-rose-300 bg-rose-50 px-2 py-1 font-black text-rose-700">
                      Unpaid
                    </span>{" "}
                    <span className="rounded-md border border-rose-300 bg-rose-50 px-2 py-1 font-black text-rose-700">
                      COD
                    </span>
                  </p>
                </div>
              </div>

              <div className="grid gap-8 py-10 lg:grid-cols-[1fr_320px]">
                <div className="flex gap-4">
                  <ProductThumb color={product.color} />
                  <div>
                    <h3 className="text-xl font-black uppercase">{product.name}</h3>
                    <p className="font-medium text-slate-600">SKU: {product.sku}</p>
                  </div>
                </div>
                <div>
                  <p className="mb-5 text-right">
                    <span className="rounded-md border border-rose-300 bg-rose-50 px-2 py-1 font-black text-rose-700">
                      Normal Delivery
                    </span>
                  </p>
                  <div className="grid grid-cols-2 gap-y-3 text-right font-medium">
                    <p className="text-left">1Item(s)</p>
                    <p className="font-black">BDT 1899</p>
                    <p className="text-left">Subtotal</p>
                    <p>BDT 1899</p>
                    <p className="text-left">Delivery charge</p>
                    <p>+ BDT 60</p>
                    <p className="border-t border-slate-200 pt-3 text-left font-black">
                      Total
                    </p>
                    <p className="border-t border-slate-200 pt-3 font-black">
                      BDT 1959
                    </p>
                    <p className="text-left font-black text-emerald-600">
                      Paid Amount
                    </p>
                    <p className="font-black text-emerald-600">BDT 0</p>
                    <p className="text-left font-black text-rose-600">
                      Due Amount
                    </p>
                    <p className="font-black text-rose-600">BDT 1959</p>
                  </div>
                </div>
              </div>
            </article>
          </section>
        </div>
      </section>
    </>
  );
}
