"use client";

import { useCallback, useEffect, useState } from "react";
import {
  apiRequest,
  type InventoryLogResponse,
  type InventoryVariant,
} from "../../../lib/admin-api";

export function useStockData() {
  const [variants, setVariants] = useState<InventoryVariant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [adjustmentsToday, setAdjustmentsToday] = useState(0);
  const [todayLogs, setTodayLogs] = useState<InventoryLogResponse[]>([]);

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

  return {
    variants,
    isLoading,
    error,
    totalStock,
    lowStockCount,
    adjustmentsToday,
    todayLogs,
    refetch: fetchData,
  };
}
