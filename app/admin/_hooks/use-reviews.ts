"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getAllReviews,
  createReview as apiCreateReview,
  updateReview as apiUpdateReview,
  deleteReview as apiDeleteReview,
  apiRequest,
  type Review,
  type UpdateReviewDto,
  type CreateReviewDto,
  type Product,
} from "../../../lib/admin-api";

const LIMIT = 20;

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const reqRef = useRef(0);

  const loadReviews = useCallback(async (p: number, q?: string) => {
    const myReq = ++reqRef.current;
    setIsLoading(true);
    setError("");
    try {
      const params: Record<string, string> = {
        page: String(p),
        limit: String(LIMIT),
      };
      if (q?.trim()) params.search = q.trim();

      const response = await getAllReviews(params);
      if (myReq !== reqRef.current) return;

      setReviews((prev) =>
        p === 1
          ? response.data
          : [...prev, ...response.data.filter((d) => !prev.some((r) => r.id === d.id))],
      );
      setTotal(response.meta.total);
    } catch (err) {
      if (myReq !== reqRef.current) return;
      setError(err instanceof Error ? err.message : "Failed to load reviews");
      setReviews([]);
    } finally {
      if (myReq === reqRef.current) setIsLoading(false);
    }
  }, []);

  // Load products for dropdown (once on mount)
  useEffect(() => {
    apiRequest<{ data: Product[] }>("/products?limit=200").then((res) => {
      setProducts(res.data);
    }).catch(() => {});
  }, []);

  // Reload when page or search changes
  useEffect(() => {
    const id = window.setTimeout(() => {
      void loadReviews(page, search);
    }, 0);
    return () => window.clearTimeout(id);
  }, [page, search, loadReviews]);

  const totalPages = Math.ceil(total / LIMIT);

  const refresh = useCallback(() => {
    setPage(1);
    setSearch("");
  }, []);

  async function create(dto: CreateReviewDto) {
    setError("");
    try {
      await apiCreateReview(dto);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create review");
    }
  }

  async function update(id: string, dto: UpdateReviewDto) {
    setError("");
    try {
      await apiUpdateReview(id, dto);
      await loadReviews(page, search);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update review");
    }
  }

  async function remove(id: string) {
    setError("");
    try {
      await apiDeleteReview(id);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete review");
    }
  }

  return {
    reviews,
    products,
    isLoading,
    error,
    search,
    setSearch,
    page,
    setPage,
    total,
    totalPages,
    hasMore: page < totalPages,
    refresh,
    create,
    update,
    remove,
  };
}
