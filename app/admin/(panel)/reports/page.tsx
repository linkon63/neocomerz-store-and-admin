"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AdminIcon } from "../../_components/admin-shell";
import { apiRequest } from "../../../../lib/admin-api";

type ReportType = "sales" | "inventory" | "purchase" | "discount" | "ai-conversation";

type SummaryData = {
  totalSales: number;
  totalOrders: number;
  lowStockProducts: number;
  totalProducts: number;
};

type Product = {
  id: string;
  name: string;
  sku?: string;
  status: string;
  createdAt?: string;
  supplier?: { name: string } | null;
  supplierPrice?: string | number | null;
  variants?: { stockQuantity: number; price: string | number }[];
};

type SaleItem = {
  id: string;
  orderNumber: string;
  total: string | number;
  placedAt: string;
  status?: string;
  user?: { name: string } | null;
};

type Discount = {
  id: string;
  name: string;
  type: "percentage" | "fixed";
  value: number;
  status: "active" | "inactive";
  startDate?: string;
  endDate?: string;
  products?: { id: string; name: string }[];
};

function formatCurrency(val: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
  }).format(val);
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    "in-stock": "bg-emerald-50 text-emerald-700 border-emerald-100",
    "in_stock": "bg-emerald-50 text-emerald-700 border-emerald-100",
    "active": "bg-emerald-50 text-emerald-700 border-emerald-100",
    "low-stock": "bg-amber-50 text-amber-700 border-amber-100",
    "low_stock": "bg-amber-50 text-amber-700 border-amber-100",
    "out-of-stock": "bg-red-50 text-red-700 border-red-100",
    "out_of_stock": "bg-red-50 text-red-700 border-red-100",
    "inactive": "bg-slate-100 text-slate-600 border-slate-200",
    "paid": "bg-emerald-50 text-emerald-700 border-emerald-100",
    "pending": "bg-amber-50 text-amber-700 border-amber-100",
    "delivered": "bg-blue-50 text-blue-700 border-blue-100",
    "completed": "bg-emerald-50 text-emerald-700 border-emerald-100",
    "cancelled": "bg-red-50 text-red-700 border-red-100",
    "resolved": "bg-emerald-50 text-emerald-700 border-emerald-100",
    "escalated": "bg-red-50 text-red-700 border-red-100",
  };
  const cls = map[status.toLowerCase()] ?? "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-normal capitalize ${cls}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function SalesReport() {
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [masked, setMasked] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [s, d] = await Promise.all([
          apiRequest<SummaryData>("/dashboard/summary"),
          apiRequest<SaleItem[]>("/dashboard/sales"),
        ]);
        setSummary(s);
        setSales(d);
      } catch { /* empty */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const filtered = sales.filter((s) =>
    `${s.orderNumber} ${s.user?.name ?? ""}`.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total), 0);
  const avgOrder = sales.length > 0 ? totalRevenue / sales.length : 0;

  if (loading) return <div className="py-16 text-center text-sm text-slate-400">Loading sales report...</div>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Revenue" value={masked ? "৳***************" : formatCurrency(totalRevenue)} sub="All time" />
        <MetricCard label="Total Orders" value={summary?.totalOrders.toString() ?? "0"} />
        <MetricCard label="Average Order Value" value={masked ? "৳***" : formatCurrency(avgOrder)} />
        <MetricCard label="Refunds" value={formatCurrency(0)} sub="No refunds recorded" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-slate-900">Sale Report</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">{filtered.length} records</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3">
              <AdminIcon className="h-4 w-4 text-slate-400" name="search" />
              <input
                className="w-40 bg-transparent text-sm outline-none placeholder:text-slate-400"
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              onClick={() => setMasked((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
              title={masked ? "Show values" : "Hide values"}
            >
              <AdminIcon className="h-4 w-4" name={masked ? "actions" : "actions"} />
            </button>
            <button
              onClick={() => window.print()}
              className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
            >
              <AdminIcon className="h-4 w-4" name="download" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead className="bg-slate-50/60">
              <tr>
                {["Order #", "Customer", "Date", "Amount", "Status"].map((h) => (
                  <th key={h} className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-400">No sales records found.</td></tr>
              ) : filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-3.5 text-sm font-medium text-slate-800">{s.orderNumber}</td>
                  <td className="px-6 py-3.5 text-sm text-slate-600">{s.user?.name ?? "Guest"}</td>
                  <td className="px-6 py-3.5 text-sm text-slate-500">{new Date(s.placedAt).toLocaleDateString()}</td>
                  <td className="px-6 py-3.5 text-sm font-medium text-slate-800">{masked ? "৳***" : formatCurrency(Number(s.total))}</td>
                  <td className="px-6 py-3.5"><StatusBadge status={s.status ?? "pending"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function InventoryReport() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subTab, setSubTab] = useState<"all" | "out-of-stock" | "low" | "new">("all");
  const [masked, setMasked] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiRequest<{ data: Product[] }>("/products?limit=100");
        setProducts(data.data ?? []);
      } catch { /* empty */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));

    const qty = p.variants?.reduce((sum, v) => sum + (v.stockQuantity ?? 0), 0) ?? 0;
    
    if (subTab === "out-of-stock") {
      return matchesSearch && qty === 0;
    }
    if (subTab === "low") {
      return matchesSearch && qty > 0 && qty <= 5;
    }
    if (subTab === "new") {
      const isNew = p.createdAt ? (new Date().getTime() - new Date(p.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000 : false;
      return matchesSearch && isNew;
    }
    return matchesSearch;
  });

  const totalValue = products.reduce((sum, p) => {
    if (p.variants && p.variants.length > 0) {
      return sum + p.variants.reduce((vSum, v) => vSum + Number(v.price ?? 0) * (v.stockQuantity ?? 0), 0);
    }
    return sum;
  }, 0);

  const totalStock = products.reduce((sum, p) => {
    if (p.variants && p.variants.length > 0) {
      return sum + p.variants.reduce((vSum, v) => vSum + (v.stockQuantity ?? 0), 0);
    }
    return sum;
  }, 0);

  const lowStock = products.filter((p) => {
    const qty = p.variants?.reduce((sum, v) => sum + (v.stockQuantity ?? 0), 0) ?? 0;
    return qty > 0 && qty <= 5;
  }).length;

  const outOfStock = products.filter((p) => {
    const qty = p.variants?.reduce((sum, v) => sum + (v.stockQuantity ?? 0), 0) ?? 0;
    return qty === 0;
  }).length;

  if (loading) return <div className="py-16 text-center text-sm text-slate-400">Loading inventory report...</div>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Inventory value" value={masked ? "৳***************" : formatCurrency(totalValue)} />
        <MetricCard label="Total Product Stock" value={totalStock.toString()} />
        <MetricCard label="Low Stock Products" value={lowStock.toString()} />
        <MetricCard label="Out of stock Products" value={outOfStock.toString()} />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex gap-1.5 p-1 bg-slate-100/80 rounded-lg w-fit">
          {(["all", "out-of-stock", "low", "new"] as const).map((tab) => {
            const labels: Record<string, string> = {
              all: "All",
              "out-of-stock": "Out of stock",
              low: "Low",
              new: "New",
            };
            const isActive = subTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setSubTab(tab)}
                className={`px-4 py-2 text-xs font-semibold rounded-md transition-all ${
                  isActive
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => router.push("/admin/products/new")}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
        >
          <AdminIcon className="h-4 w-4" name="plus" />
          Add Product
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 px-6 py-4 gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-slate-900">Inventory Report</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">{filtered.length} products</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3">
              <AdminIcon className="h-4 w-4 text-slate-400" name="search" />
              <input
                className="w-40 bg-transparent text-sm outline-none placeholder:text-slate-400"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
              title="Filter Options"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
              </svg>
            </button>

            <button
              onClick={() => setMasked((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
              title={masked ? "Show values" : "Hide values"}
            >
              <AdminIcon className="h-4 w-4" name="actions" />
            </button>
            
            <button
              onClick={() => window.print()}
              className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
              title="Print/Download Report"
            >
              <AdminIcon className="h-4 w-4" name="download" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead className="bg-slate-50/60">
              <tr>
                {["Product Name", "Supplier Name", "Inventory", "Purchase Price", "Status"].map((h) => (
                  <th key={h} className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-400">No products found.</td></tr>
              ) : filtered.map((p) => {
                const qty = p.variants?.reduce((sum, v) => sum + (v.stockQuantity ?? 0), 0) ?? 0;
                const supplierPriceVal = p.supplierPrice ? Number(p.supplierPrice) : 0;
                const stockStatus = qty === 0 ? "out-of-stock" : qty <= 5 ? "low-stock" : "in-stock";
                
                return (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-3.5 text-sm font-medium text-slate-800">
                      {p.sku ? `${p.name} (${p.sku})` : p.name}
                    </td>
                    <td className="px-6 py-3.5 text-sm text-slate-600">
                      {p.supplier?.name ?? "—"}
                    </td>
                    <td className="px-6 py-3.5 text-sm text-slate-600">
                      {qty}
                    </td>
                    <td className="px-6 py-3.5 text-sm text-slate-600">
                      {masked ? "৳***" : formatCurrency(supplierPriceVal)}
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={stockStatus} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PurchaseReport() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const s = await apiRequest<SummaryData>("/dashboard/summary");
        setSummary(s);
      } catch { /* empty */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading) return <div className="py-16 text-center text-sm text-slate-400">Loading purchase report...</div>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Purchases" value={formatCurrency(0)} sub="No purchase orders yet" />
        <MetricCard label="Pending Orders" value="0" />
        <MetricCard label="Received" value="0" />
        <MetricCard label="Suppliers" value="0" />
      </div>
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-slate-900">Purchase Report</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">0 records</span>
          </div>
          <button onClick={() => window.print()} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
            <AdminIcon className="h-4 w-4" name="download" />
          </button>
        </div>
        <div className="px-6 py-16 text-center text-sm text-slate-400">
          No purchase orders recorded yet.
        </div>
      </div>
    </div>
  );
}

function DiscountReport() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await apiRequest<Discount[]>("/product-discounts");
        setDiscounts(data);
      } catch { /* empty */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const filtered = discounts.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const active = discounts.filter((d) => d.status === "active").length;
  const totalValue = discounts.reduce((sum, d) => sum + d.value, 0);

  if (loading) return <div className="py-16 text-center text-sm text-slate-400">Loading discount report...</div>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Discounts" value={discounts.length.toString()} />
        <MetricCard label="Active Discounts" value={active.toString()} />
        <MetricCard label="Inactive" value={(discounts.length - active).toString()} />
        <MetricCard label="Avg. Discount Value" value={discounts.length > 0 ? `${(totalValue / discounts.length).toFixed(1)}%` : "0%"} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-slate-900">Discount Report</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">{filtered.length} discounts</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3">
              <AdminIcon className="h-4 w-4 text-slate-400" name="search" />
              <input
                className="w-40 bg-transparent text-sm outline-none placeholder:text-slate-400"
                placeholder="Search discounts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button onClick={() => window.print()} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
              <AdminIcon className="h-4 w-4" name="download" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead className="bg-slate-50/60">
              <tr>
                {["Name", "Type", "Value", "Products", "Schedule", "Status"].map((h) => (
                  <th key={h} className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400">No discounts found.</td></tr>
              ) : filtered.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-3.5 text-sm font-medium text-slate-800">{d.name}</td>
                  <td className="px-6 py-3.5 text-sm text-slate-600 capitalize">{d.type}</td>
                  <td className="px-6 py-3.5 text-sm text-slate-600">{d.type === "percentage" ? `${d.value}%` : formatCurrency(d.value)}</td>
                  <td className="px-6 py-3.5 text-sm text-slate-500">{d.products?.length ?? 0} products</td>
                  <td className="px-6 py-3.5 text-xs text-slate-400">
                    {d.startDate ? new Date(d.startDate).toLocaleDateString() : "Always"} – {d.endDate ? new Date(d.endDate).toLocaleDateString() : "Always"}
                  </td>
                  <td className="px-6 py-3.5"><StatusBadge status={d.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

type AIConversation = {
  id: string;
  customerName: string;
  startedAt: string;
  messageCount: number;
  lastMessage: string;
  feedback: "positive" | "negative" | "none";
  status: "resolved" | "escalated" | "active";
};

const MOCK_CONVERSATIONS: AIConversation[] = [
  {
    id: "conv_1",
    customerName: "Sarah Connor",
    startedAt: "2026-05-22T10:14:00Z",
    messageCount: 5,
    lastMessage: "Thank you, that helps! I will order the size M.",
    feedback: "positive",
    status: "resolved",
  },
  {
    id: "conv_2",
    customerName: "David Miller",
    startedAt: "2026-05-22T09:30:00Z",
    messageCount: 8,
    lastMessage: "I need to speak to a human about my refund.",
    feedback: "negative",
    status: "escalated",
  },
  {
    id: "conv_3",
    customerName: "Guest User",
    startedAt: "2026-05-22T08:45:00Z",
    messageCount: 2,
    lastMessage: "Do you ship to Chittagong?",
    feedback: "none",
    status: "resolved",
  },
  {
    id: "conv_4",
    customerName: "Emily Watson",
    startedAt: "2026-05-21T18:20:00Z",
    messageCount: 12,
    lastMessage: "Let me check the product details again.",
    feedback: "none",
    status: "active",
  },
  {
    id: "conv_5",
    customerName: "Guest User",
    startedAt: "2026-05-21T15:10:00Z",
    messageCount: 4,
    lastMessage: "What coupon codes are active?",
    feedback: "positive",
    status: "resolved",
  },
];

function AIConversationReport() {
  const [conversations, setConversations] = useState<AIConversation[]>(MOCK_CONVERSATIONS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = conversations.filter((c) =>
    `${c.customerName} ${c.lastMessage}`.toLowerCase().includes(search.toLowerCase())
  );

  const totalConvs = conversations.length;
  const totalMessages = conversations.reduce((sum, c) => sum + c.messageCount, 0);
  const avgMessages = totalConvs > 0 ? (totalMessages / totalConvs).toFixed(1) : "0";
  const positiveFeedback = conversations.filter((c) => c.feedback === "positive").length;
  const negativeFeedback = conversations.filter((c) => c.feedback === "negative").length;
  const resolutionRate = totalConvs > 0 ? ((conversations.filter(c => c.status === "resolved").length / totalConvs) * 100).toFixed(0) + "%" : "0%";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Conversations" value={totalConvs.toString()} sub="All storefront chats" />
        <MetricCard label="Avg. Messages/Session" value={avgMessages} sub="Depth of engagement" />
        <MetricCard label="Resolution Rate" value={resolutionRate} sub="Self-service success" />
        <MetricCard label="Feedback Score" value={`+${positiveFeedback} / -${negativeFeedback}`} sub="Customer satisfaction" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 px-6 py-4 gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-slate-900">AI Conversation Logs</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">{filtered.length} sessions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3">
              <AdminIcon className="h-4 w-4 text-slate-400" name="search" />
              <input
                className="w-40 bg-transparent text-sm outline-none placeholder:text-slate-400"
                placeholder="Search chats..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button onClick={() => window.print()} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
              <AdminIcon className="h-4 w-4" name="download" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead className="bg-slate-50/60">
              <tr>
                {["Customer", "Started At", "Messages", "Last Message", "Feedback", "Status"].map((h) => (
                  <th key={h} className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400">No conversations found.</td></tr>
              ) : filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-3.5 text-sm font-medium text-slate-800">{c.customerName}</td>
                  <td className="px-6 py-3.5 text-sm text-slate-500">{new Date(c.startedAt).toLocaleString()}</td>
                  <td className="px-6 py-3.5 text-sm text-slate-600">{c.messageCount}</td>
                  <td className="px-6 py-3.5 text-sm text-slate-600 max-w-[250px] truncate">{c.lastMessage}</td>
                  <td className="px-6 py-3.5 text-sm text-slate-600">
                    {c.feedback === "positive" ? "👍 Positive" : c.feedback === "negative" ? "👎 Negative" : "—"}
                  </td>
                  <td className="px-6 py-3.5"><StatusBadge status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const TABS: { id: ReportType; label: string }[] = [
  { id: "sales", label: "Sale Report" },
  { id: "inventory", label: "Inventory Report" },
  { id: "purchase", label: "Purchase Report" },
  { id: "discount", label: "Discount Report" },
  { id: "ai-conversation", label: "AI Conversation" },
];

function ReportsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = (searchParams.get("type") as ReportType) ?? "sales";

  function setTab(tab: ReportType) {
    router.push(`?type=${tab}`);
  }

  const reportTitles: Record<ReportType, { title: string; description: string }> = {
    sales: { title: "Sales Report", description: "Overview of all sales transactions and revenue" },
    inventory: { title: "Inventory Report", description: "Current stock levels and inventory valuation" },
    purchase: { title: "Purchase Report", description: "Purchase orders and supplier transactions" },
    discount: { title: "Discount Report", description: "Active and historical discount performance" },
    "ai-conversation": { title: "AI Conversation Report", description: "Customer interactions and resolution metrics from the AI storefront chatbot" },
  };

  const { title, description } = reportTitles[activeTab];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <AdminIcon className="h-4 w-4" name="download" />
          Print Report
        </button>
      </div>

      <div className="border-b border-slate-200">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "sales" && <SalesReport />}
      {activeTab === "inventory" && <InventoryReport />}
      {activeTab === "purchase" && <PurchaseReport />}
      {activeTab === "discount" && <DiscountReport />}
      {activeTab === "ai-conversation" && <AIConversationReport />}
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-sm text-slate-400">Loading reports...</div>}>
      <ReportsContent />
    </Suspense>
  );
}
