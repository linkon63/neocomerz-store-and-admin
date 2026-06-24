"use client";

import { useState } from "react";
import { AdminIcon, PageHeader, ProductThumb } from "../../_components/admin-shell";
import { AdjustInventoryModal } from "../../_components/adjust-inventory-modal";
import { InfiniteScroll } from "../../_components/infinite-scroll";
import { useStockData } from "../../_hooks/use-stock-data";
import { AdjustmentLogsModal } from "./_components/adjustment-logs-modal";

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
  const { variants, isLoading, error, totalStock, lowStockCount, adjustmentsToday, todayLogs, refetch, total, hasMore, setPage } = useStockData();
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState<{
    product: { id: string; name: string; slug: string; imageUrl?: string };
    variant: { id: string; sku: string; stockQuantity: number };
  } | null>(null);

  function openVariantAdjust(variant: typeof variants[number]) {
    if (!variant.id || !variant.sku) return;
    setAdjustingItem({
      product: {
        id: variant.product.id,
        name: variant.product.name,
        slug: variant.product.slug,
        imageUrl: variant.product.media?.[0]?.media?.url,
      },
      variant: {
        id: variant.id,
        sku: variant.sku,
        stockQuantity: variant.stockQuantity,
      },
    });
  }

  return (
    <>
      <PageHeader
        title="Stock Management"
        description="Track inventory, low stock alerts, and manual adjustments"
        action={undefined}
      />

      {error && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-xl bg-white shadow-sm">
        {isLoading && variants.length === 0 ? (
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
                <p className="mt-1 text-2xl font-semibold">{totalStock.toLocaleString()} pcs</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-5">
                <p className="text-sm font-medium text-slate-500">Low stock items</p>
                <p className={`mt-1 text-2xl font-semibold ${lowStockCount > 0 ? "text-rose-600" : ""}`}>
                  {lowStockCount} items
                </p>
              </div>
              <button
                className="cursor-pointer rounded-xl border border-slate-200 p-5 text-left transition-all hover:bg-slate-50"
                onClick={() => setShowLogsModal(true)}
                type="button"
              >
                <p className="text-sm font-medium text-slate-500">Adjustments today</p>
                <p className="mt-1 text-2xl font-semibold">{adjustmentsToday}</p>
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
                        src={variant.product.media?.[0]?.media?.url}
                        alt={variant.product.name}
                      />
                      <div className="min-w-0">
                        <p className="max-w-[50ch] truncate font-semibold uppercase">
                          {variant.product.name}
                        </p>
                        <div className="max-w-[70ch] truncate text-sm font-medium text-slate-500">
                          {hasVariant ? (
                            <>
                              <p className="">{variant.sku}</p>
                              alert below{" "}
                              {variant.stockAlertThreshold} pcs
                            </>
                          ) : (
                            <span className="text-slate-400">No variant created yet</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p
                          className={`whitespace-nowrap font-semibold ${
                            isLowStock
                              ? "text-rose-600"
                              : "text-slate-700"
                          }`}
                        >
                              {variant.stockQuantity} pcs
                        </p>
                        {!hasVariant && (
                          <span className="inline-block rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                            NO VARIANT
                          </span>
                        )}
                        {hasVariant && isLowStock && (
                          <span className="inline-block rounded-md border border-rose-200 bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">
                            LOW STOCK
                          </span>
                        )}
                      </div>
                      <button
                        className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 transition-all hover:bg-slate-50"
                        onClick={() => openVariantAdjust(variant)}
                        disabled={!hasVariant}
                        title={hasVariant ? "Adjust stock" : "No variant to adjust"}
                        type="button"
                      >
                        <AdminIcon className="h-4 w-4" name="edit" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {variants.length > 0 && (
              <InfiniteScroll
                hasMore={hasMore}
                isLoading={isLoading}
                onLoadMore={() => setPage((p) => p + 1)}
                total={total}
                loaded={variants.length}
                itemLabel="variants"
                loadingLabel="Loading more..."
                allLoadedLabel="All variants loaded"
              />
            )}
          </>
        )}
      </section>

      {showLogsModal && (
        <AdjustmentLogsModal
          logs={todayLogs}
          onClose={() => setShowLogsModal(false)}
        />
      )}

      {adjustingItem && (
        <AdjustInventoryModal
          product={adjustingItem.product}
          variant={adjustingItem.variant}
          onClose={() => setAdjustingItem(null)}
          onSuccess={() => {
            setAdjustingItem(null);
            refetch();
          }}
        />
      )}
    </>
  );
}
