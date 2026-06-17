"use client";

import Image from "next/image";
import { useState } from "react";

type ProductImageGalleryProps = {
  images: string[];
  name: string;
};

export default function ProductImageGallery({ images, name }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);

  // If we only have 1 image, let's add a mirrored version as a second image 
  // to maintain the premium multi-thumbnail layout from the design reference.
  const galleryImages = images.length === 1 ? [images[0], images[0]] : images;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <section className="flex flex-col">
      {/* Main Image Container with Magnifier Zoom */}
      <div 
        className="relative aspect-square overflow-hidden border border-neutral-100 bg-white cursor-zoom-in"
        onMouseEnter={() => setIsZooming(true)}
        onMouseLeave={() => setIsZooming(false)}
        onMouseMove={handleMouseMove}
      >
        <Image
          src={galleryImages[activeIndex]}
          alt={name}
          fill
          priority
          sizes="(min-width: 1024px) 560px, 100vw"
          className={`object-cover object-center p-12 transition-transform duration-75 ${
            activeIndex === 1 && images.length === 1 ? "scale-x-[-1]" : ""
          }`}
          style={{
            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
            transform: isZooming 
              ? `scale(2) ${activeIndex === 1 && images.length === 1 ? "scale-x-[-1]" : ""}` 
              : "scale(1)",
          }}
        />
      </div>

      {/* Thumbnails */}
      <div className="mt-2 flex gap-2">
        {galleryImages.map((img, index) => (
          <button
            key={`${img}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`relative h-24 w-24 border bg-white transition-all ${
              activeIndex === index ? "border-black" : "border-neutral-100 hover:border-neutral-300"
            }`}
          >
            <Image
              src={img}
              alt={`${name} view ${index + 1}`}
              fill
              sizes="96px"
              className={`object-cover p-3 ${
                index === 1 && images.length === 1 ? "scale-x-[-1]" : ""
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
