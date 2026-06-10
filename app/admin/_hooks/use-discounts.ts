"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "../../../lib/admin-api";
import { type ProductDiscount } from "../../../lib/type";

export function useDiscounts() {
  const [discounts, setDiscounts] = useState<ProductDiscount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDiscounts() {
    setIsLoading(true);
    try {
      setDiscounts(await apiRequest<ProductDiscount[]>("/product-discounts"));
    } catch {
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDiscounts();
  }, []);

  async function deleteDiscount(id: string) {
    await apiRequest(`/product-discounts/${id}`, { method: "DELETE" });
  }

  async function toggleStatus(id: string, currentStatus: string) {
    await apiRequest(`/product-discounts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: currentStatus === "active" ? "inactive" : "active",
      }),
    });
  }

  return { discounts, isLoading, error, loadDiscounts, deleteDiscount, toggleStatus };
}
