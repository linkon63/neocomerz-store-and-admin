"use client";

import { useState } from "react";
import { apiRequest } from "../../../lib/admin-api";

export function useUpdateProductMedia() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateMedia = async (mediaId: string, data: { sortOrder: number; isFeatured: boolean }) => {
    setIsUpdating(true);
    setError(null);
    try {
      const updated = await apiRequest(`/product-media/${mediaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return updated;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to update product media";
      setError(errMsg);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateMedia, isUpdating, error };
}
