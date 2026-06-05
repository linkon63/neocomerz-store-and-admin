"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminIcon, PageHeader, ProductThumb } from "../../_components/admin-shell";
import {
  apiRequest,
  type InventoryLogResponse,
  type InventoryVariant,
} from "../../../../lib/admin-api";
import { AdjustmentLogsModal } from "./_components/adjustment-logs-modal";
import { AdjustStockModal } from "./_components/adjust-stock-modal";

const THUMB_COLORS = [
  "bg-blue-600",
  "bg-emerald-700",
  "bg-violet-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-stone-700",
  "bg-pink-300",
  "bg-olive-600",
];

export default function StockPage() {
  const [variants, setVariants] = useState<InventoryVariant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [preselectedId, setPreselectedId] = useState<string | undefined>(undefined);
  const [preselectedProduct, setPreselectedProduct] = useState<{ id: string; name: string } | undefined>(undefined);
  const [adjustmentsToday, setAdjustmentsToday] = useState(0);
  const [todayLogs, setTodayLogs] = useState<InventoryLogResponse[]>([]);
  const [showLogsModal, setShowLogsModal] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const [inv, logs] = await Promise.all([
        apiRequest<InventoryVariant[]>("/inventory?sort=lowStock"),
        apiRequest<InventoryLogResponse[]>("/inventory/logs"),
      ]);
      setVariants(inv);

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const today = logs.filter((l) => new Date(l.createdAt) >= todayStart);
      setTodayLogs(today);
      setAdjustmentsToday(today.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stock data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalStock = variants.reduce((sum, v) => sum + v.stockQuantity, 0);
  const lowStockCount = variants.filter(
    (v) => v.stockQuantity <= v.stockAlertThreshold,
  ).length;

  function openVariantAdjust(variantId: string) {
    setPreselectedId(variantId);
    setPreselectedProduct(undefined);
    setShowModal(true);
  }

  function openProductAdjust(productId: string, productName: string) {
    setPreselectedId(undefined);
    setPreselectedProduct({ id: productId, name: productName });
    setShowModal(true);
  }

  return (
    <>
      <PageHeader
        title="Stock Management"
        description="Track inventory, low stock alerts, and manual adjustments"
        action={
          <button
            className="inline-flex h-14 items-center gap-2 rounded-lg cursor-pointer bg-blue-600 px-6 font-black text-white hover:bg-blue-700"
            onClick={() => { setPreselectedId(undefined); setPreselectedProduct(undefined); setShowModal(true); }}
            type="button"
          >
            <AdminIcon className="h-5 w-5" name="plus" />
            Adjust Stock
          </button>
        }
      />

      {error && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 font-black text-rose-700">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-xl bg-white shadow-sm">
        {isLoading ? (
          <div className="space-y-4 p-5">
            <div className="grid gap-4 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div className="h-16 animate-pulse rounded-xl bg-slate-100" key={i} />
              ))}
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div className="h-16 animate-pulse rounded-xl bg-slate-100" key={i} />
            ))}
          </div>
        ) : variants.length === 0 ? (
          <div className="p-10 text-center font-medium text-slate-400">
            No products found. Add products to get started.
          </div>
        ) : (
          <>
            <div className="grid gap-4 p-5 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 p-5">
                <p className="text-sm font-medium text-slate-500">Total stock</p>
                <p className="mt-1 text-2xl font-black">{totalStock.toLocaleString()} pcs</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-5">
                <p className="text-sm font-medium text-slate-500">Low stock items</p>
                <p className={`mt-1 text-2xl font-black ${lowStockCount > 0 ? "text-rose-600" : ""}`}>
                  {lowStockCount} items
                </p>
              </div>
              <button
                className="cursor-pointer rounded-xl border border-slate-200 p-5 text-left hover:bg-slate-50"
                onClick={() => setShowLogsModal(true)}
                type="button"
              >
                <p className="text-sm font-medium text-slate-500">Adjustments today</p>
                <p className="mt-1 text-2xl font-black">{adjustmentsToday}</p>
              </button>
            </div>

            <div className="divide-y divide-slate-100 border-t border-slate-200">
              {variants.map((variant, index) => {
                const isLowStock = variant.stockQuantity <= variant.stockAlertThreshold;
                const hasVariant = variant.id !== null;
                return (
                  <div
                    className={`flex items-center justify-between gap-5 p-5 ${
                      isLowStock ? "bg-rose-50/50" : ""
                    }`}
                    key={variant.id ?? `product-${variant.product.id}`}
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <ProductThumb
                        color={THUMB_COLORS[index % THUMB_COLORS.length]}
                      />
                      <div className="min-w-0">
                        <p className="truncate font-black uppercase">
                          {variant.product.name}
                        </p>
                        <p className="text-sm font-medium text-slate-500">
                          {hasVariant ? (
                            <>
                              {variant.sku}{" "}
                              <span className="text-slate-300">·</span> alert below{" "}
                              {variant.stockAlertThreshold} pcs
                            </>
                          ) : (
                            <span className="text-slate-400">No variant created yet</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p
                          className={`whitespace-nowrap font-black ${
                            isLowStock
                              ? "text-rose-600"
                              : "text-slate-700"
                          }`}
                        >
                          {variant.stockQuantity} pcs
                        </p>
                        {!hasVariant && (
                          <span className="inline-block rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-black text-slate-500">
                            NO VARIANT
                          </span>
                        )}
                        {hasVariant && isLowStock && (
                          <span className="inline-block rounded-md border border-rose-200 bg-rose-100 px-2 py-0.5 text-xs font-black text-rose-700">
                            LOW STOCK
                          </span>
                        )}
                      </div>
                      <button
                        className="cursor-pointer rounded-lg border border-slate-200 p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                        onClick={() =>
                          hasVariant
                            ? openVariantAdjust(variant.id!)
                            : openProductAdjust(variant.product.id, variant.product.name)
                        }
                        title="Adjust stock"
                        type="button"
                      >
                        <AdminIcon className="h-4 w-4" name="edit" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      {showLogsModal && (
        <AdjustmentLogsModal
          logs={todayLogs}
          onClose={() => setShowLogsModal(false)}
        />
      )}

      {showModal && (
        <AdjustStockModal
          variants={variants}
          preselectedVariantId={preselectedId}
          preselectedProductId={preselectedProduct?.id}
          preselectedProductName={preselectedProduct?.name}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchData();
          }}
        />
      )}
    </>
  );
}
