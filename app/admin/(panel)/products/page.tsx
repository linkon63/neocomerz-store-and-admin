import {
  AdminIcon,
  PageHeader,
  ProductThumb,
  StatusToggle,
} from "../../_components/admin-shell";
import { products } from "../../_components/admin-data";

export default function ProductsPage() {
  return (
    <>
      <PageHeader
        title="Products"
        description="Add, view and edit your products all in one place"
        action={
          <div className="flex gap-3">
            <button className="inline-flex h-14 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 font-black">
              <AdminIcon className="h-5 w-5" name="upload" />
              CSV
            </button>
            <button className="grid h-14 w-14 place-items-center rounded-lg border border-slate-300 bg-white font-black">
              <AdminIcon className="h-5 w-5" name="refresh" />
            </button>
            <button className="inline-flex h-14 items-center gap-2 rounded-lg bg-blue-600 px-6 font-black text-white shadow-sm">
              <AdminIcon className="h-5 w-5" name="plus" />
              Add Products
            </button>
          </div>
        }
      />

      <section>
        <div className="mb-5">
          <h2 className="text-2xl font-black">Products</h2>
          <p className="font-medium text-slate-500">
            Displaying 25 active product variants
          </p>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 p-7 sm:flex-row">
            <label className="flex h-12 w-full max-w-xl items-center gap-3 rounded-lg border border-slate-300 px-4">
              <AdminIcon className="h-5 w-5 text-slate-400" name="search" />
              <input
                className="w-full bg-transparent font-medium outline-none"
                placeholder="Enter product name, Sku"
              />
            </label>
            <div className="flex gap-3">
              <button className="grid h-12 w-12 place-items-center rounded-lg border border-slate-300 font-black">
                <AdminIcon className="h-5 w-5" name="filter" />
              </button>
              <button className="inline-flex h-12 items-center gap-2 rounded-lg border border-slate-300 px-5 font-black text-slate-500">
                Select a date
                <AdminIcon className="h-4 w-4" name="calendar" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] border-collapse text-left">
              <thead className="bg-slate-50 text-sm text-slate-900">
                <tr>
                  <th className="px-8 py-5 font-black">Products ↑</th>
                  <th className="px-5 py-5 font-black">Brand ↑</th>
                  <th className="px-5 py-5 font-black">Supplier ↑</th>
                  <th className="px-5 py-5 font-black">Total Inventory ↑</th>
                  <th className="px-5 py-5 font-black">Retail Price ↑</th>
                  <th className="px-5 py-5 font-black">Created At ↑</th>
                  <th className="px-5 py-5 font-black">Status ⓘ</th>
                  <th className="px-5 py-5 font-black">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr className="hover:bg-slate-50" key={product.sku}>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <AdminIcon
                          className="h-5 w-5 text-slate-400"
                          name="chevronRight"
                        />
                        <ProductThumb color={product.color} />
                        <div>
                          <p className="max-w-lg font-black uppercase">
                            {product.name}
                          </p>
                          <p className="mt-1 font-medium text-slate-400">
                            {product.sku}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-5 font-medium text-slate-700">
                      {product.brand}
                    </td>
                    <td className="px-5 py-5 font-medium text-slate-700">
                      {product.supplier}
                    </td>
                    <td className="px-5 py-5 font-medium text-slate-700">
                      {product.stock} <span className="text-sm">(pcs)</span>
                    </td>
                    <td className="px-5 py-5 font-medium text-slate-700">
                      {product.price}
                      <span className="block text-sm">(pcs)</span>
                    </td>
                    <td className="px-5 py-5 font-medium text-slate-700">
                      {product.createdAt}
                    </td>
                    <td className="px-5 py-5">
                      <StatusToggle />
                    </td>
                    <td className="px-5 py-5">
                      <button className="grid h-9 w-9 place-items-center rounded-lg border border-slate-300 text-slate-600">
                        <AdminIcon className="h-4 w-4" name="actions" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
