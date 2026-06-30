"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  apiRequest,
  type InventoryLogResponse,
  type InventoryVariant,
  type PaginatedInventory,
} from "../../../lib/admin-api";

const PAGE_SIZE = 20;

export function useStockData() {
  const [variants, setVariants] = useState<InventoryVariant[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [adjustmentsToday, setAdjustmentsToday] = useState(0);
  const [todayLogs, setTodayLogs] = useState<InventoryLogResponse[]>([]);
  const [refetchCount, setRefetchCount] = useState(0);

  const reqRef = useRef(0);

  const fetchData = useCallback(async () => {
    const myReq = ++reqRef.current;
    setIsLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE), sort: "lowStock" });
      const [result, logs] = await Promise.all([
        apiRequest<PaginatedInventory>(`/inventory?${params.toString()}`),
        page === 1 ? apiRequest<InventoryLogResponse[]>("/inventory/logs") : Promise.resolve(null),
      ]);
      if (myReq !== reqRef.current) return;
      setVariants((prev) =>
        page === 1 ? result.data : [...prev, ...result.data.filter((d) => !prev.some((p) => p.id === d.id))],
      );
      setTotal(result.meta.total);
      if (logs) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const today = logs.filter((l) => new Date(l.createdAt) >= todayStart);
        setTodayLogs(today);
        setAdjustmentsToday(today.length);
      }
    } catch (err) {
      if (myReq !== reqRef.current) return;
      setError(err instanceof Error ? err.message : "Failed to load stock data");
      setVariants([]);
    } finally {
      if (myReq === reqRef.current) setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refetchCount]);

  const refetch = useCallback(() => {
    setPage(1);
    setVariants([]);
    setTotal(0);
    setRefetchCount((c) => c + 1);
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasMore = page < totalPages;

  const totalStock = variants.reduce((sum, v) => sum + v.stockQuantity, 0);
  const lowStockCount = variants.filter((v) => v.stockQuantity <= v.stockAlertThreshold).length;

  return {
    variants,
    isLoading,
    error,
    totalStock,
    lowStockCount,
    adjustmentsToday,
    todayLogs,
    refetch,
    total,
    hasMore,
    setPage,
  };
}
