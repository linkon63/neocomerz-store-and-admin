import { products } from "../../_components/admin-data";
import { AdminIcon, PageHeader, ProductThumb } from "../../_components/admin-shell";

export default function StockPage() {
  return (
    <>
      <PageHeader
        title="Stock Management"
        description="Track inventory, low stock alerts, and manual adjustments"
        action={
          <button className="inline-flex h-14 items-center gap-2 rounded-lg bg-blue-600 px-6 font-black text-white">
            <AdminIcon className="h-5 w-5" name="plus" />
            Adjust Stock
          </button>
        }
      />
      <section className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="grid gap-4 p-5 sm:grid-cols-3">
          {["Total stock 4,490 pcs", "Low stock 17 items", "Adjustments 24 today"].map((item) => (
            <div className="rounded-xl border border-slate-200 p-5 font-black" key={item}>{item}</div>
          ))}
        </div>
        <div className="divide-y divide-slate-100">
          {products.map((product) => (
            <div className="flex items-center justify-between gap-5 p-5" key={product.sku}>
              <div className="flex items-center gap-4">
                <ProductThumb color={product.color} />
                <div>
                  <p className="font-black uppercase">{product.name}</p>
                  <p className="text-sm font-medium text-slate-500">{product.sku} · alert below 20 pcs</p>
                </div>
              </div>
              <p className="font-black text-slate-700">{product.stock} pcs</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
