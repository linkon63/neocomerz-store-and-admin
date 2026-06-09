"use client";

import { useState } from "react";
import { FaApple, FaGoogle } from "react-icons/fa";
import { FiCreditCard, FiShoppingBag, FiInfo } from "react-icons/fi";
import { useCart } from "../../_components/cart-context";
import { type ProductVariant, type VariantAttribute } from "../products";

type ProductPurchasePanelProps = {
  productName: string;
  productImage: string;
  productSlug: string;
  variants: ProductVariant[];
};

const colorHexMap: Record<string, string> = {
  Black: "#050505",
  Red: "#ed0d0d",
  Yellow: "#f4dc45",
  Green: "#179400",
  White: "#f8f9fa",
  Orange: "#f58a4b",
};

export default function ProductPurchasePanel({
  productName,
  productImage,
  productSlug,
  variants,
}: ProductPurchasePanelProps) {
  const { addItem } = useCart();

  const getAttributeValueName = (attr: VariantAttribute, targetName: string) => {
    const attrName = attr.attributeValue?.attribute?.name?.toLowerCase();
    if (attrName === targetName.toLowerCase() && attr.attributeValue?.value) {
      return attr.attributeValue.value;
    }
    const val = attr.attributeValue?.value;
    if (!val) return null;
    if (targetName.toLowerCase() === "size" && ["S", "M", "L", "XL", "XXL"].includes(val)) {
      return val;
    }
    if (targetName.toLowerCase() === "color" && !["S", "M", "L", "XL", "XXL"].includes(val)) {
      return val;
    }
    return null;
  };

  // Get unique colors and sizes
  const colors = Array.from(
    new Set(
      variants.flatMap((v) =>
        v.attributes.map((a) => getAttributeValueName(a, "Color")).filter(Boolean),
      ),
    ),
  ) as string[];

  const sizes = Array.from(
    new Set(
      variants.flatMap((v) =>
        v.attributes.map((a) => getAttributeValueName(a, "Size")).filter(Boolean),
      ),
    ),
  ) as string[];

  const sizeOrder = ["S", "M", "L", "XL", "XXL"];
  const sortedSizes = [...sizes].sort((a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b));

  // Default selection
  const defaultVariant = variants.find((v) => v.isDefault) || variants[0];
  const defaultColor = defaultVariant
    ? (defaultVariant.attributes
        .map((a) => getAttributeValueName(a, "Color"))
        .find(Boolean) as string)
    : colors[0] || "";
  const defaultSize = defaultVariant
    ? (defaultVariant.attributes
        .map((a) => getAttributeValueName(a, "Size"))
        .find(Boolean) as string)
    : sortedSizes[0] || "";

  const [selectedColor, setSelectedColor] = useState<string>(defaultColor);
  const [selectedSize, setSelectedSize] = useState<string>(defaultSize);

  // Find variant matching current selection
  const matchedVariant = variants.find((v) => {
    const colorMatch =
      colors.length === 0 ||
      v.attributes.some((a) => getAttributeValueName(a, "Color") === selectedColor);
    const sizeMatch =
      sizes.length === 0 ||
      v.attributes.some((a) => getAttributeValueName(a, "Size") === selectedSize);
    return colorMatch && sizeMatch;
  });

  const basePrice = matchedVariant ? Number(matchedVariant.price) : 0;
  const discountedPrice = basePrice * 0.8; // 20% discount as configured in detail page
  const stock = matchedVariant ? matchedVariant.stockQuantity : 0;
  const isOutOfStock = stock <= 0;

  function handleAddToCart() {
    if (!matchedVariant) return;

    void addItem({
      slug: productSlug,
      name: productName,
      price: discountedPrice,
      image: productImage,
      color: selectedColor,
      size: selectedSize,
      variantId: matchedVariant.id,
    });
  }

  return (
    <div className="mt-6 border-t border-neutral-200 pt-6 space-y-6">
      {/* Dynamic Price Display */}
      {matchedVariant && (
        <div className="flex items-center gap-3 bg-neutral-50 p-4 border border-neutral-100 rounded-sm">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.08em] text-neutral-400">Selected Variant Price</p>
            <div className="mt-1 flex items-center gap-3">
              <span className="text-sm font-bold text-neutral-400 line-through">
                €{basePrice.toFixed(2)}
              </span>
              <span className="text-xl font-black text-neutral-900">
                €{discountedPrice.toFixed(2)}
              </span>
              <span className="bg-[#ffd02f] px-2 py-0.5 text-[10px] font-black uppercase rounded-sm">
                Save 20%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Color Selection */}
      {colors.length > 0 && (
        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.08em] text-neutral-500">
            Color: <span className="text-neutral-900 font-bold">{selectedColor}</span>
          </h3>
          <div className="mt-3 flex gap-3">
            {colors.map((color) => {
              const hex = colorHexMap[color] || color.toLowerCase();
              const isSelected = selectedColor === color;
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`relative h-9 w-9 rounded-full border flex items-center justify-center transition-all ${
                    isSelected
                      ? "border-black ring-2 ring-black ring-offset-2 scale-105"
                      : "border-neutral-200 hover:border-neutral-400"
                  }`}
                  style={{ backgroundColor: hex }}
                  title={color}
                >
                  {color === "White" && (
                    <span className="absolute inset-0.5 rounded-full border border-neutral-200" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size Selection */}
      {sortedSizes.length > 0 && (
        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.08em] text-neutral-500">
            Size: <span className="text-neutral-900 font-bold">{selectedSize}</span>
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {sortedSizes.map((size) => {
              const isSelected = selectedSize === size;
              // Check if size is available in current selected color
              const sizeExists = variants.some((v) => {
                const colorMatch =
                  colors.length === 0 ||
                  v.attributes.some((a) => getAttributeValueName(a, "Color") === selectedColor);
                const sizeMatch = v.attributes.some((a) => getAttributeValueName(a, "Size") === size);
                return colorMatch && sizeMatch;
              });

              return (
                <button
                  key={size}
                  type="button"
                  disabled={!sizeExists}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[48px] h-10 px-3 text-xs font-bold border rounded-none transition-all ${
                    isSelected
                      ? "border-black bg-black text-white"
                      : sizeExists
                      ? "border-neutral-200 text-neutral-800 hover:border-neutral-400"
                      : "border-neutral-100 text-neutral-300 cursor-not-allowed opacity-50 bg-neutral-50"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stock Status Indicator */}
      {matchedVariant && (
        <div className="text-xs font-bold">
          {isOutOfStock ? (
            <p className="text-red-600 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
              Out of stock (Temporarily unavailable)
            </p>
          ) : stock <= matchedVariant.stockAlertThreshold ? (
            <p className="text-amber-600 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              Only {stock} left in stock - order soon!
            </p>
          ) : (
            <p className="text-green-600 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              In Stock (Ready to ship)
            </p>
          )}
        </div>
      )}

      {/* Purchase Actions */}
      <div className="space-y-4">
        <button
          className="w-full inline-flex items-center justify-center gap-3 bg-neutral-900 px-6 py-4 text-sm font-black uppercase text-white hover:bg-neutral-800 transition disabled:bg-neutral-300 disabled:text-neutral-500 disabled:cursor-not-allowed"
          type="button"
          disabled={!matchedVariant || isOutOfStock}
          onClick={handleAddToCart}
        >
          <FiShoppingBag className="text-lg" />
          {isOutOfStock ? "Sold Out" : "Add to cart"}
        </button>

        <button
          className="flex w-full items-center justify-center gap-2 bg-black px-6 py-4 text-center text-base font-bold text-white hover:bg-neutral-900 transition disabled:opacity-50"
          type="button"
          disabled={isOutOfStock}
        >
          Buy with <FaApple className="text-xl" /> Pay
        </button>
        <button
          className="flex w-full items-center justify-center gap-4 bg-black px-6 py-3 text-center text-sm font-bold text-white hover:bg-neutral-900 transition disabled:opacity-50"
          type="button"
          disabled={isOutOfStock}
        >
          <span className="inline-flex items-center gap-1">
            <FaGoogle className="text-base" /> Pay
          </span>
          <span className="h-4 w-px bg-white/40" />
          <span className="inline-flex items-center gap-1">
            <FiCreditCard className="text-base" /> Card
          </span>
        </button>
      </div>

      <div className="flex gap-2 text-[10px] text-neutral-400 font-semibold bg-neutral-50 p-3 rounded-sm">
        <FiInfo className="text-xs shrink-0 mt-0.5 text-neutral-500" />
        <p>
          Pay in 3 interest-free installments. Free returns on all archive purchases.
        </p>
      </div>
    </div>
  );
}
