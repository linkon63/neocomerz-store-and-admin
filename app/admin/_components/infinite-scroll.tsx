"use client";

import { useEffect, useRef } from "react";

interface InfiniteScrollProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  loadingLabel?: string;
  sentinelLabel?: string;
  allLoadedLabel?: string;
  total?: number;
  loaded?: number;
  itemLabel?: string;
}

export function InfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  loadingLabel = "Loading more...",
  sentinelLabel = "Scroll for more",
  allLoadedLabel,
  total,
  loaded,
  itemLabel = "items",
}: InfiniteScrollProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  useEffect(() => {
    if (isLoading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMoreRef.current();
        }
      },
      { threshold: 0.1, rootMargin: "100px" },
    );

    const target = sentinelRef.current;
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [isLoading, hasMore]);

  if (total !== undefined && loaded !== undefined) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 px-5 py-4 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex flex-col items-start gap-1.5">
          <p className="text-sm font-medium text-slate-500">
            Showing <span className="font-bold text-slate-800">{loaded}</span> of{" "}
            <span className="font-bold text-slate-800">{total}</span> {itemLabel}
          </p>
          <div className="h-1.5 w-48 overflow-hidden rounded bg-slate-200">
            <div
              className="h-full bg-blue-600 transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, (loaded / total) * 100)}%` }}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 py-2 text-xs font-semibold text-slate-500">
            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
            <span>{loadingLabel}</span>
          </div>
        ) : hasMore ? (
          <div ref={sentinelRef} className="flex items-center gap-2 py-2 text-xs font-semibold text-slate-400 cursor-default">
            {sentinelLabel}
          </div>
        ) : allLoadedLabel ? (
          <span className="text-xs font-semibold text-slate-400">{allLoadedLabel}</span>
        ) : null}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 p-3 text-xs font-semibold text-slate-500 bg-white rounded-md">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
        <span>{loadingLabel}</span>
      </div>
    );
  }

  if (hasMore) {
    return (
      <div ref={sentinelRef} className="flex items-center justify-center p-3 text-xs font-semibold text-slate-400 bg-white rounded-md cursor-default">
        {sentinelLabel}
      </div>
    );
  }

  if (allLoadedLabel && !hasMore && !isLoading) {
    return (
      <div className="flex items-center justify-center p-3 text-xs font-semibold text-slate-400 bg-white rounded-md">
        {allLoadedLabel}
      </div>
    );
  }

  return null;
}
