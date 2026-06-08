"use client";

import { FaApple, FaGoogle } from "react-icons/fa";
import { FiCreditCard, FiShoppingBag } from "react-icons/fi";
import { useCart } from "../../_components/cart-context";

type ProductPurchasePanelProps = {
  product: {
    slug: string;
    name: string;
    price: number;
    image: string;
    color: string;
    size: string;
  };
};

export default function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const { addItem } = useCart();

  return (
    <div className="mt-6 border-t border-neutral-200 pt-6">
      <button
        className="inline-flex items-center gap-3 bg-neutral-900 px-6 py-4 text-sm font-black uppercase text-white"
        type="button"
        onClick={() => addItem(product)}
      >
        <FiShoppingBag className="text-lg" />
        Add to cart
      </button>

      <button
        className="mt-6 flex w-full items-center justify-center gap-2 bg-black px-6 py-4 text-center text-base font-bold text-white"
        type="button"
      >
        Buy with <FaApple className="text-xl" /> Pay
      </button>
      <button
        className="mt-4 flex w-full items-center justify-center gap-4 bg-black px-6 py-3 text-center text-sm font-bold text-white"
        type="button"
      >
        <span className="inline-flex items-center gap-1">
          <FaGoogle className="text-base" /> Pay
        </span>
        <span className="h-4 w-px bg-white/40" />
        <span className="inline-flex items-center gap-1">
          <FiCreditCard className="text-base" /> Card
        </span>
      </button>

      <p className="mt-5 text-xs text-neutral-500">
        Pay in 3 interest-free installments. Powered by PayPal.
      </p>
    </div>
  );
}
