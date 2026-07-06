"use client";

import Image from "next/image";
import { resolveImageUrl } from "@/lib/admin-api";

interface ResolvedImageProps {
  src: string | null | undefined;
  alt: string;
  fill?: boolean;
  className?: string;
  fallback?: string;
}

export default function ResolvedImage({
  src,
  alt,
  fill = true,
  className = "",
  fallback = "/images/no-image-icon-6.png",
}: ResolvedImageProps) {
  // Pre-resolve URL outside of standard DOM markup mapping loops
  const imageUrl = src ? resolveImageUrl(src) : fallback;

  return (
    <Image
      src={imageUrl}
      alt={alt}
      fill={fill}
      className={className}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        if (target && target.src !== fallback) {
          target.src = fallback;
        }
      }}
    />
  );
}
