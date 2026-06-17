"use client";

const placeholderOrders = [
  { id: "#HV-2024-001", date: "15 Mar 2024", status: "Delivered", total: "€89.00", items: 3 },
  { id: "#HV-2024-002", date: "22 Feb 2024", status: "Shipped", total: "€145.00", items: 1 },
  { id: "#HV-2024-003", date: "10 Jan 2024", status: "Processing", total: "€52.00", items: 2 },
];

const statusColors: Record<string, string> = {
  Delivered: "bg-green-100 text-green-800",
  Shipped: "bg-blue-100 text-blue-800",
  Processing: "bg-amber-100 text-amber-800",
  Cancelled: "bg-red-100 text-red-800",
};

export default function ProfileOrders() {
  return (
    <div>
      <h2 className="font-bembo text-3xl font-bold">Orders</h2>
      <p className="mt-2 text-sm text-neutral-500">Track, return, or buy items again</p>

      <div className="mt-8 space-y-4">
        {placeholderOrders.length === 0 ? (
          <p className="rounded-lg border border-neutral-200 px-5 py-12 text-center text-sm text-neutral-500">
            You haven&apos;t placed any orders yet.
          </p>
        ) : (
          placeholderOrders.map((order) => (
            <div
              key={order.id}
              className="flex flex-wrap items-center justify-between gap-4 border border-neutral-200 px-5 py-4 transition hover:border-neutral-400"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.08em]">{order.id}</p>
                <p className="mt-0.5 text-xs text-neutral-500">{order.date} · {order.items} item{order.items > 1 ? "s" : ""}</p>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em]
                    ${statusColors[order.status] ?? "bg-neutral-100 text-neutral-600"}`}
                >
                  {order.status}
                </span>
                <span className="text-sm font-bold">{order.total}</span>
                <button
                  type="button"
                  className="text-[10px] font-bold uppercase tracking-[0.08em] underline underline-offset-2 transition hover:text-neutral-500"
                >
                  View
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
