"use client";

import { useEffect, useState } from "react";
import type { PolicyData } from "@/types/policy";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1";

export function usePolicies({ enabled = true }: { enabled?: boolean } = {}) {
  const [data, setData] = useState<PolicyData | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const controller = new AbortController();

    async function fetchPolicies() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/policies`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch policies");
        }

        const result = (await response.json()) as PolicyData;
        setData(result);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err : new Error("Failed to fetch policies"));
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void fetchPolicies();

    return () => controller.abort();
  }, [enabled]);

  return { data, isLoading, error };
}
