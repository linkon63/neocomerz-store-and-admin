"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/app/_providers/cart-provider";
import { getCustomerToken } from "@/lib/storefront-api";
import type { AddressForm, CartItem, OrderResult } from "@/lib/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5010/api/v1";

export function usePlaceOrder() {
  const { items, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);

  const placeOrder = async (
    address: AddressForm,
    extra?: { paymentMethod?: string; orderNote?: string; items?: CartItem[] }
  ): Promise<OrderResult> => {
    setSubmitting(true);
    const token = getCustomerToken();
    const orderItems = extra?.items ?? items;
    const orderSubtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    try {
      let data: Record<string, unknown>;

      if (token) {
        const addressRes = await fetch(`${BASE_URL}/addresses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fullName: address.fullName,
            phone: address.phone,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2 || undefined,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
            isDefault: true,
          }),
        });

        if (!addressRes.ok) {
          const err = await addressRes.json().catch(() => ({}));
          throw new Error((err as { message?: string }).message ?? "Failed to save address");
        }

        const savedAddress = await addressRes.json() as { id: string };

        const orderRes = await fetch(`${BASE_URL}/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            addressId: savedAddress.id,
          }),
        });

        if (!orderRes.ok) {
          const err = await orderRes.json().catch(() => ({}));
          throw new Error((err as { message?: string }).message ?? "Failed to place order");
        }

        data = await orderRes.json();
      } else {
        const lineItems = orderItems.map((i) => {
          if (!i.variantId) throw new Error(`Missing variant for "${i.name}". Please remove and re-add the item.`);
          return { variantId: i.variantId, quantity: i.quantity };
        });

        const res = await fetch(`${BASE_URL}/orders/guest`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address: {
              email: address.email,
              fullName: address.fullName,
              phone: address.phone,
              addressLine1: address.addressLine1,
              addressLine2: address.addressLine2 || undefined,
              city: address.city,
              state: address.state,
              postalCode: address.postalCode,
              country: address.country,
            },
            items: lineItems,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error((err as { message?: string }).message ?? "Failed to place order");
        }

        data = await res.json();
      }

      const result: OrderResult = {
        orderNumber: (data.orderNumber ?? data.id ?? "N/A") as string,
        total: (data.total as number) ?? orderSubtotal,
        items: orderItems.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          image: i.image,
        })),
        address: { ...address },
        paymentMethod: extra?.paymentMethod,
        orderNote: extra?.orderNote,
      };

      if (!extra?.items) clearCart();

      try {
        await fetch("/api/resend/order-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(result),
        });
      } catch (notifyErr) {
        console.error("Order confirmation email failed:", notifyErr);
      }

      toast.success("Order placed successfully!");
      return result;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to place order");
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return { placeOrder, submitting };
}
