import { products } from "../../_components/admin-data";
import { AdminIcon, PageHeader, ProductThumb } from "../../_components/admin-shell";

export default function PosPage() {
  return (
    <>
      <PageHeader title="POS" description="Create in-store sales and quick invoices" />
      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <label className="mb-5 flex h-14 items-center gap-3 rounded-lg border border-slate-300 px-4">
            <AdminIcon className="h-5 w-5 text-slate-400" name="search" />
            <input className="w-full bg-transparent outline-none" placeholder="Search product or scan SKU" />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            {products.map((product) => (
              <button className="flex items-center gap-4 rounded-xl border border-slate-200 p-4 text-left" key={product.sku}>
                <ProductThumb color={product.color} />
                <span><b className="block">{product.name}</b><span className="text-sm text-slate-500">{product.price}</span></span>
              </button>
            ))}
          </div>
        </div>
        <aside className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">Current cart</h2>
          <div className="mt-8 space-y-4">
            <div className="flex justify-between font-medium"><span>Subtotal</span><span>৳1,899</span></div>
            <div className="flex justify-between font-medium"><span>Discount</span><span>৳0</span></div>
            <div className="flex justify-between border-t border-slate-200 pt-4 text-xl font-black"><span>Total</span><span>৳1,899</span></div>
          </div>
          <button className="mt-8 h-14 w-full rounded-lg bg-blue-600 font-black text-white">Checkout</button>
        </aside>
      </section>
    </>
  );
}
