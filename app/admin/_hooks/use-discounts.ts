"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiRequest } from "../../../lib/admin-api";
import { type PaginatedDiscounts, type ProductDiscount } from "../../../lib/type";

const PAGE_SIZE = 20;

export function useDiscounts() {
  const [discounts, setDiscounts] = useState<ProductDiscount[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const reqRef = useRef(0);
  const prevSearchRef = useRef(search);

  const loadDiscounts = useCallback(async () => {
    const myReq = ++reqRef.current;
    setIsLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
      if (search.trim()) params.set("search", search.trim());
      const res = await apiRequest<PaginatedDiscounts | ProductDiscount[]>(`/product-discounts?${params.toString()}`);
      if (myReq !== reqRef.current) return;
      const list = Array.isArray(res) ? res : (res?.data ?? []);
      const totalCount = Array.isArray(res) ? res.length : (res?.meta?.total ?? list.length);
      setDiscounts((prev) =>
        page === 1 ? list : [...prev, ...list.filter((d) => !prev.some((p) => p.id === d.id))],
      );
      setTotal(totalCount);
    } catch (err) {
      if (myReq !== reqRef.current) return;
      setError(err instanceof Error ? err.message : "Failed to load discounts");
      setDiscounts([]);
    } finally {
      if (myReq === reqRef.current) setIsLoading(false);
    }
  }, [page, search]);

  const refreshDiscounts = useCallback(async () => {
    setPage(1);
    const myReq = ++reqRef.current;
    setIsLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: "1", limit: String(PAGE_SIZE) });
      if (search.trim()) params.set("search", search.trim());
      const res = await apiRequest<PaginatedDiscounts | ProductDiscount[]>(`/product-discounts?${params.toString()}`);
      if (myReq !== reqRef.current) return;
      const list = Array.isArray(res) ? res : (res?.data ?? []);
      const totalCount = Array.isArray(res) ? res.length : (res?.meta?.total ?? list.length);
      setDiscounts(list);
      setTotal(totalCount);
    } catch (err) {
      if (myReq !== reqRef.current) return;
      setError(err instanceof Error ? err.message : "Failed to load discounts");
    } finally {
      if (myReq === reqRef.current) setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    if (prevSearchRef.current !== search) {
      prevSearchRef.current = search;
      setPage(1);
      setDiscounts([]);
      setTotal(0);
    }
  }, [search]);

  useEffect(() => {
    loadDiscounts();
  }, [loadDiscounts]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasMore = page < totalPages;

  async function deleteDiscount(id: string) {
    await apiRequest(`/product-discounts/${id}`, { method: "DELETE" });
  }

  async function toggleStatus(id: string, currentStatus: string) {
    await apiRequest(`/product-discounts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: currentStatus === "active" ? "inactive" : "active" }),
    });
  }

  return {
    discounts,
    isLoading,
    error,
    loadDiscounts,
    refreshDiscounts,
    deleteDiscount,
    toggleStatus,
    search,
    setSearch,
    page,
    setPage,
    total,
    hasMore,
  };
}
