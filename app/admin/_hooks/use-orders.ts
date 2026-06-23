"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  apiRequest,
  type Order,
  type OrderPaymentStatus,
  type OrderStatus,
  type PaginatedOrders,
} from "../../../lib/admin-api";

const PAGE_SIZE = 20;

function num(value: unknown) {
  return Number(value ?? 0);
}

interface UseOrdersOptions {
  fixedStatus?: OrderStatus;
}

export function useOrders({ fixedStatus }: UseOrdersOptions = {}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<OrderStatus | "">(fixedStatus ?? "");
  const [paymentStatus, setPaymentStatus] = useState<OrderPaymentStatus | "">("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!fixedStatus) {
      const s = params.get("status");
      if (s) setStatus(s as OrderStatus);
    }
    const ps = params.get("paymentStatus");
    const q = params.get("search");
    if (ps) setPaymentStatus(ps as OrderPaymentStatus);
    if (q) setSearch(q);
  }, [fixedStatus]);

  const reqRef = useRef(0);

  const loadOrders = useCallback(async () => {
    const myReq = ++reqRef.current;
    setIsLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (status) params.set("status", status);
      if (paymentStatus) params.set("paymentStatus", paymentStatus);
      if (search.trim()) params.set("search", search.trim());

      const res = await apiRequest<PaginatedOrders>(`/orders?${params.toString()}`);
      if (myReq !== reqRef.current) return;
      setOrders((prev) => (page === 1 ? res.data : [...prev, ...res.data.filter((o) => !prev.some((p) => p.id === o.id))]));
      setTotal(res.meta.total);
      setSelectedId((prev) => {
        if (page === 1) {
          return prev && res.data.some((o) => o.id === prev) ? prev : (res.data[0]?.id ?? null);
        }
        return prev;
      });
    } catch (err) {
      if (myReq !== reqRef.current) return;
      setError(err instanceof Error ? err.message : "Failed to load orders");
      setOrders([]);
    } finally {
      if (myReq === reqRef.current) setIsLoading(false);
    }
  }, [page, status, paymentStatus, search]);

  async function updateOrderStatus(newStatus: OrderStatus) {
    if (!selectedId) return;
    setError("");
    try {
      await apiRequest(`/orders/${selectedId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      await loadOrders();
      const msg =
        newStatus === "cancelled"
          ? "Order cancelled."
          : newStatus === "returned"
            ? "Order returned."
            : "Order accepted.";
      toast.success(msg);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order status");
    }
  }

  async function updatePaymentStatus(newPaymentStatus: OrderPaymentStatus) {
    if (!selectedId) return;
    setError("");
    try {
      await apiRequest(`/orders/${selectedId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      });
      await loadOrders();
      toast.success("Payment status updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update payment status");
    }
  }

  useEffect(() => {
    const timer = setTimeout(loadOrders, search ? 350 : 0);
    return () => clearTimeout(timer);
  }, [loadOrders, search]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasMore = page < totalPages;

  const selected = useMemo(() => orders.find((o) => o.id === selectedId) ?? null, [orders, selectedId]);

  const totals = useMemo(() => {
    if (!selected) return null;
    const subtotal = (selected.items ?? []).reduce((sum, it) => sum + num(it.totalPrice), 0);
    const shipping = num(selected.shippingCost);
    const discount = num(selected.discount);
    const grand = num(selected.total);
    const paid = (selected.payments ?? [])
      .filter((p) => p.status === "success")
      .reduce((sum, p) => sum + num(p.amount), 0);
    return { subtotal, shipping, discount, grand, paid, due: Math.max(0, grand - paid) };
  }, [selected]);

  return {
    orders,
    selected,
    selectedId,
    setSelectedId,
    status,
    setStatus,
    paymentStatus,
    setPaymentStatus,
    search,
    setSearch,
    page,
    setPage,
    total,
    isLoading,
    error,
    totalPages,
    hasMore,
    totals,
    updateOrderStatus,
    updatePaymentStatus,
  };
}
