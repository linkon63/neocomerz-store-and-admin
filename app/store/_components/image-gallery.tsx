"use client";

import { useState } from "react";
import type { ProductMedia } from "@/lib/store-api";

interface ImageGalleryProps {
  media: ProductMedia[];
  productName: string;
}

export function ImageGallery({ media, productName }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!media || media.length === 0) {
    return (
      <div className="aspect-square rounded-2xl bg-[var(--store-surface-2)] flex items-center justify-center">
        <svg
          className="w-24 h-24 text-[var(--store-text-light)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  const currentImage = media[selectedIndex];

  function resolveImageUrl(url: string): string {
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ?? "http://localhost:5010"}${url}`;
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div
        className={`relative aspect-square rounded-2xl bg-[var(--store-surface-2)] overflow-hidden group ${
          isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
        }`}
        onClick={() => setIsZoomed(!isZoomed)}
      >
        <img
          src={resolveImageUrl(currentImage.media.url)}
          alt={productName}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            isZoomed ? "scale-150" : "scale-100 group-hover:scale-105"
          }`}
        />
        {/* Zoom Icon */}
        {!isZoomed && (
          <div className="absolute top-4 right-4 p-2 rounded-full bg-white/90 shadow opacity-0 group-hover:opacity-100 transition">
            <svg
              className="w-5 h-5 text-[var(--store-text)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {media.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {media.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setSelectedIndex(index)}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                index === selectedIndex
                  ? "border-[var(--store-primary)] ring-2 ring-[var(--store-primary-mid)]"
                  : "border-transparent hover:border-[var(--store-border-dark)]"
              }`}
            >
              <img
                src={resolveImageUrl(item.media.url)}
                alt={`${productName} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
