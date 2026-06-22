"use client";

import { useEffect, useRef } from "react";

interface InfiniteScrollProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  loadingLabel?: string;
  sentinelLabel?: string;
  allLoadedLabel?: string;
}

export function InfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  loadingLabel = "Loading more...",
  sentinelLabel = "Scroll for more",
  allLoadedLabel,
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
