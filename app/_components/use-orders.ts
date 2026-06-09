"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./auth-context";
import type { OrderData } from "../../types/order";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5010/api/v1";

export function useOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetchOrders();
  }, [token]);

  async function fetchOrders() {
    setLoading(true);
    const res = await fetch(`${BASE_URL}/orders/my-orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setOrders(data);
    }
    setLoading(false);
  }

  return { orders, loading };
}
