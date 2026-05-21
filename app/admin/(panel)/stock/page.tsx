"use client";

import { useEffect, useState } from "react";
import { AdminIcon, PageHeader, ProductThumb } from "../../_components/admin-shell";
import { apiRequest } from "../../../../lib/admin-api";

type Variant = {
  id: string;
  sku: string;
  price: string | number;
  stockQuantity: number;
  stockAlertThreshold: number;
  isDefault: boolean;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  variants?: Variant[];
};

export default function StockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Adjustment Modal State
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustType, setAdjustType] = useState<"add" | "set">("add");
  const [isSaving, setIsSaving] = useState(false);

  async function loadStockData() {
    try {
      setLoading(true);
      setError("");
      const res = await apiRequest<{ data: Product[] }>("/products?limit=100");
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load inventory levels from database.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadStockData();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const openAdjust = (prod: Product, variant: Variant) => {
    setSelectedProduct(prod);
    setSelectedVariant(variant);
    setAdjustQty("");
    setAdjustType("add");
    setIsAdjustOpen(true);
  };

  const closeAdjust = () => {
    setSelectedProduct(null);
    setSelectedVariant(null);
    setIsAdjustOpen(false);
  };

  async function handleAdjustSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedVariant || !adjustQty) return;

    setIsSaving(true);
    try {
      const quantity = Number(adjustQty);
      if (isNaN(quantity)) throw new Error("Invalid quantity specified.");

      const currentStock = selectedVariant.stockQuantity;
      const newStock = adjustType === "add" ? currentStock + quantity : quantity;

      if (newStock < 0) throw new Error("Resulting stock level cannot be negative.");

      const change = adjustType === "add" ? quantity : quantity - currentStock;
      if (change === 0) {
        closeAdjust();
        return;
      }

      await apiRequest("/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId: selectedVariant.id,
          change,
          reason: "manual",
          note: "Admin stock adjustment (Stock Management)",
        }),
      });

      closeAdjust();
      await loadStockData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update inventory.");
    } finally {
      setIsSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading stock inventory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-800">
        {error}
      </div>
    );
  }

  // Calculate stats
  let totalStock = 0;
  let lowStockCount = 0;
  let totalProductsTracked = 0;

  products.forEach((prod) => {
    prod.variants?.forEach((variant) => {
      totalProductsTracked++;
      totalStock += variant.stockQuantity;
      if (variant.stockQuantity <= (variant.stockAlertThreshold || 10)) {
        lowStockCount++;
      }
    });
  });

  return (
    <>
      <PageHeader
        title="Stock Management"
        description="Monitor real-time inventory counts, thresholds, and manual adjustments."
        action={
          <button
            onClick={() => loadStockData()}
            className="inline-flex h-12 items-center gap-2 rounded-lg bg-blue-600 px-6 font-medium text-white hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/10"
          >
            <AdminIcon className="h-5 w-5" name="refresh" />
            Refresh Inventory
          </button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-3 mb-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Pieces in Stock</p>
          <p className="mt-2 text-2xl font-semibold text-slate-800">{totalStock} pcs</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Low Stock Items</p>
          <p className="mt-2 text-2xl font-semibold text-rose-600">{lowStockCount} items</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Tracked Variants</p>
          <p className="mt-2 text-2xl font-semibold text-slate-800">{totalProductsTracked} variants</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="divide-y divide-slate-100">
          {products.length === 0 ? (
            <p className="p-8 text-center text-sm font-medium text-slate-400">No products configured in catalog.</p>
          ) : (
            products.map((product) => {
              const defaultVariant = product.variants?.[0];
              if (!defaultVariant) return null;

              const isLowStock = defaultVariant.stockQuantity <= (defaultVariant.stockAlertThreshold || 10);

              return (
                <div className="flex items-center justify-between gap-5 p-5 hover:bg-slate-50/60 transition-colors" key={product.id}>
                  <div className="flex items-center gap-4">
                    <ProductThumb color={isLowStock ? "bg-rose-500" : "bg-blue-600"} />
                    <div>
                      <p className="font-medium text-slate-800 line-clamp-1">{product.name}</p>
                      <p className="text-sm font-medium text-slate-500">
                        SKU: {defaultVariant.sku} · Alert threshold: {defaultVariant.stockAlertThreshold || 10} pcs
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="text-right">
                      <p className={`font-semibold ${isLowStock ? "text-rose-600" : "text-slate-700"}`}>
                        {defaultVariant.stockQuantity} pcs
                      </p>
                      {isLowStock && (
                        <span className="text-[10px] font-medium uppercase tracking-wider text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                          Low Stock
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => openAdjust(product, defaultVariant)}
                      className="inline-flex h-9 items-center gap-1 px-3.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                    >
                      Adjust
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Adjust Inventory Modal */}
      {isAdjustOpen && selectedProduct && selectedVariant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={closeAdjust} />
          <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-semibold text-slate-800">Adjust Inventory</h3>
            <p className="mt-1 text-sm font-medium text-slate-500">{selectedProduct.name}</p>
            <p className="mt-0.5 text-xs font-medium text-slate-400">SKU: {selectedVariant.sku}</p>

            <form onSubmit={handleAdjustSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">Adjustment Mode</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setAdjustType("add")}
                    className={`h-9 rounded-md text-xs font-medium transition-all ${
                      adjustType === "add" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600"
                    }`}
                  >
                    Add / Subtract Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType("set")}
                    className={`h-9 rounded-md text-xs font-medium transition-all ${
                      adjustType === "set" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600"
                    }`}
                  >
                    Set Fixed Quantity
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">Quantity</label>
                <input
                  type="number"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  placeholder={adjustType === "add" ? "e.g. 10 or -5" : "e.g. 100"}
                  className="w-full h-11 border border-slate-300 rounded-lg px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="rounded-lg bg-slate-50 p-4 border border-slate-200/50">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-500">Current Stock:</span>
                  <span className="font-medium text-slate-800">{selectedVariant.stockQuantity} pcs</span>
                </div>
                <div className="flex justify-between text-sm mt-1.5 pt-1.5 border-t border-slate-200">
                  <span className="font-medium text-slate-500">Resulting Stock:</span>
                  <span className="font-semibold text-blue-600">
                    {adjustQty
                      ? adjustType === "add"
                        ? selectedVariant.stockQuantity + Number(adjustQty)
                        : Number(adjustQty)
                      : selectedVariant.stockQuantity}{" "}
                    pcs
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={closeAdjust}
                  className="h-11 px-5 rounded-lg border border-slate-300 font-bold hover:bg-slate-50 transition-colors"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="h-11 px-5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
