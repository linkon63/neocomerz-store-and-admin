"use client";

import { useState } from "react";
import { apiRequest } from "../../../lib/admin-api";

export function useDeleteProductMedia() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteMedia = async (mediaId: string) => {
    setIsDeleting(true);
    setError(null);
    try {
      await apiRequest(`/product-media/${mediaId}`, { method: "DELETE" });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to delete product media";
      setError(errMsg);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteMedia, isDeleting, error };
}
