import { AdminIcon, PageHeader, ProductThumb } from "../../_components/admin-shell";
import { products, recentOrders, summaryCards } from "../../_components/admin-data";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Your current sales summary and activity."
        action={
          <div className="flex overflow-hidden rounded-lg border border-slate-300 bg-white text-sm font-black shadow-sm">
            {["Today", "Yesterday", "This Week", "This Month"].map((label, index) => (
              <button
                className={`px-5 py-3 ${index === 0 ? "bg-blue-600 text-white" : ""}`}
                key={label}
              >
                {label}
              </button>
            ))}
            <button className="border-l border-slate-300 px-5 py-3 text-slate-500">
              <span className="inline-flex items-center gap-2">
                Select a date
                <AdminIcon className="h-4 w-4" name="calendar" />
              </span>
            </button>
          </div>
        }
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md shadow-slate-900/5">
        <div className="grid divide-y divide-slate-200 md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-4">
          {summaryCards.slice(0, 4).map((card) => (
            <article className="p-4 sm:p-6" key={card.label}>
              <div className="mb-7 flex items-center gap-3">
                <span className="grid h-7 w-7 place-items-center rounded-md bg-blue-50 text-blue-600">
                  <AdminIcon className="h-4 w-4" name="dashboard" />
                </span>
                <h2 className="font-black text-slate-600">{card.label}</h2>
              </div>
              <p className="text-3xl font-black">{card.value}</p>
              <div className="mt-4 flex items-center gap-3 text-sm font-black">
                <span className="text-slate-500">Compared to yesterday</span>
                <span className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1 text-emerald-600">
                  {card.trend}
                </span>
              </div>
            </article>
          ))}
        </div>
        <div className="grid divide-y divide-slate-200 border-t border-slate-200 md:grid-cols-3 md:divide-x md:divide-y-0">
          {summaryCards.slice(4).map((card) => (
            <article className="p-4 sm:p-6" key={card.label}>
              <div className="mb-7 flex items-center gap-3">
                <span className="grid h-7 w-7 place-items-center rounded-md bg-emerald-50 text-emerald-600">
                  <AdminIcon className="h-4 w-4" name="orders" />
                </span>
                <h2 className="font-black text-slate-600">{card.label}</h2>
              </div>
              <p className="text-3xl font-black">{card.value}</p>
              <div className="mt-4 flex items-center gap-3 text-sm font-black">
                <span className="text-slate-500">Compared to yesterday</span>
                <span className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1 text-emerald-600">
                  {card.trend}
                </span>
              </div>
            </article>
          ))}
          <article className="p-4 sm:p-6">
            <div className="mb-7 flex items-center gap-3">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-rose-50 text-rose-600">
                <AdminIcon className="h-4 w-4" name="refresh" />
              </span>
              <h2 className="font-black text-slate-600">Refund amount</h2>
            </div>
            <p className="text-3xl font-black">৳4,240</p>
            <div className="mt-4 flex items-center gap-3 text-sm font-black">
              <span className="text-slate-500">Compared to yesterday</span>
              <span className="rounded-md border border-rose-300 bg-rose-50 px-3 py-1 text-rose-600">
                1.2%
              </span>
            </div>
          </article>
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <h2 className="text-2xl font-black">Sales Trend</h2>
            <div className="flex gap-3">
              <button className="rounded-lg bg-blue-50 px-4 py-2 font-black text-blue-600">
                Daily
              </button>
              <button className="rounded-lg px-4 py-2 font-black text-slate-400">
                Monthly
              </button>
              <button className="rounded-lg border border-slate-300 px-4 py-2 font-black">
                01/05/26 - 07/05/26
              </button>
            </div>
          </div>
          <div className="relative h-80 border-l border-b border-slate-200">
            {[0, 1, 2, 3, 4].map((line) => (
              <div
                className="absolute left-0 right-0 border-t border-slate-100"
                key={line}
                style={{ top: `${line * 20}%` }}
              />
            ))}
            <div className="absolute bottom-10 left-[8%] h-28 w-8 rounded-t bg-blue-500" />
            <div className="absolute bottom-10 left-[24%] h-40 w-8 rounded-t bg-blue-500" />
            <div className="absolute bottom-10 left-[40%] h-20 w-8 rounded-t bg-blue-500" />
            <div className="absolute bottom-10 left-[56%] h-52 w-8 rounded-t bg-blue-500" />
            <div className="absolute bottom-10 left-[72%] h-36 w-8 rounded-t bg-blue-500" />
            <div className="absolute bottom-10 left-[88%] h-60 w-8 rounded-t bg-blue-500" />
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-black">Recent Orders</h2>
            <button className="rounded-lg border border-slate-300 px-4 py-2 font-black">
              Select date
            </button>
          </div>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4" key={order.no}>
                <div>
                  <p className="font-black">{order.no}</p>
                  <p className="text-sm font-medium text-slate-500">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-black">{order.total}</p>
                  <span className={`text-xs font-black ${order.payment === "Paid" ? "text-emerald-600" : "text-rose-600"}`}>
                    {order.payment}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <h2 className="mb-5 text-2xl font-black">Top selling products</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.slice(0, 3).map((product) => (
            <div className="flex items-center gap-4 rounded-xl border border-slate-100 p-4" key={product.sku}>
              <ProductThumb color={product.color} />
              <div>
                <p className="font-black">{product.name}</p>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  {product.stock} pcs in stock · {product.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
