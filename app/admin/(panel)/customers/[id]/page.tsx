"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { AdminIcon } from "../../../_components/admin-shell";
import {
  formatDate,
  formatMoney,
  getCustomer,
  resolveProductImage,
  sendAbandonedCartReminder,
  type CustomerDetail,
} from "../../../../../lib/admin-api";
import {
  DEFAULT_CART_EMAIL_MESSAGE,
  DEFAULT_CART_EMAIL_SUBJECT,
  buildAbandonedCartEmail,
} from "../../../../../lib/email-templates";

type Tab = "orders" | "cart" | "wishlist";

const STATUS_TONE: Record<string, string> = {
  delivered: "bg-emerald-100 text-emerald-700",
  paid: "bg-emerald-100 text-emerald-700",
  shipped: "bg-blue-100 text-blue-700",
  processing: "bg-blue-100 text-blue-700",
  pending: "bg-amber-100 text-amber-700",
  unpaid: "bg-amber-100 text-amber-700",
  cancelled: "bg-rose-100 text-rose-700",
  returned: "bg-rose-100 text-rose-700",
  refunded: "bg-slate-200 text-slate-700",
};

function StatusBadge({ value }: { value: string }) {
  const tone = STATUS_TONE[value?.toLowerCase()] ?? "bg-slate-100 text-slate-600";
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black capitalize ${tone}`}>
      {value}
    </span>
  );
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<CustomerDetail | null>(null);
  const [tab, setTab] = useState<Tab>("orders");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsLoading(true);
    getCustomer(id)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load customer"))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return <div className="grid place-items-center py-24 font-black text-slate-400">Loading customer...</div>;
  }
  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-5 font-bold text-red-700">
        {error || "Customer not found"}
        <div className="mt-3">
          <Link href="/admin/customers" className="text-sm font-black text-red-800 underline">
            ← Back to customers
          </Link>
        </div>
      </div>
    );
  }

  const { customer, summary, orders, abandonedCart, wishlist } = data;

  return (
    <div>
      <Link
        href="/admin/customers"
        className="mb-5 inline-flex items-center gap-1 text-sm font-black text-slate-500 hover:text-slate-800"
      >
        <AdminIcon name="chevronRight" className="h-4 w-4 rotate-180" /> Back to customers
      </Link>

      <div className="mb-7 flex flex-wrap items-start justify-between gap-5 border-b border-slate-200 pb-7">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-blue-600 text-xl font-black text-white">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-black">{customer.name}</h1>
            <p className="font-medium text-slate-600">{customer.email}</p>
            <p className="text-sm font-medium text-slate-500">
              {customer.phone || "No phone"} · Joined {formatDate(customer.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total orders" value={String(summary.ordersCount)} />
        <Stat label="Total spent" value={formatMoney(summary.totalSpent)} />
        <Stat label="Abandoned cart items" value={String(summary.abandonedCartItems)} tone="amber" />
        <Stat label="Wishlist items" value={String(summary.wishlistCount)} tone="rose" />
      </div>

      {customer.addresses.length > 0 && (
        <div className="mb-7 rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-500">Addresses</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {customer.addresses.map((a) => (
              <div key={a.id} className="rounded-xl border border-slate-100 p-4 text-sm">
                <p className="font-black">
                  {a.fullName}{" "}
                  {a.isDefault && (
                    <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-600">
                      DEFAULT
                    </span>
                  )}
                </p>
                <p className="font-medium text-slate-600">
                  {a.addressLine1}
                  {a.addressLine2 ? `, ${a.addressLine2}` : ""}, {a.city}, {a.state} {a.postalCode}, {a.country}
                </p>
                <p className="font-medium text-slate-500">{a.phone}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6 inline-flex flex-wrap rounded-xl border border-slate-200 bg-white p-1">
        <TabButton active={tab === "orders"} onClick={() => setTab("orders")}>
          Orders ({orders.length})
        </TabButton>
        <TabButton active={tab === "cart"} onClick={() => setTab("cart")}>
          Abandoned Cart ({abandonedCart.items.length})
        </TabButton>
        <TabButton active={tab === "wishlist"} onClick={() => setTab("wishlist")}>
          Wishlist ({wishlist.length})
        </TabButton>
      </div>

      {tab === "orders" && <OrdersTab orders={orders} />}
      {tab === "cart" && (
        <CartTab
          cart={abandonedCart}
          customerId={customer.id}
          customerName={customer.name}
          customerEmail={customer.email}
        />
      )}
      {tab === "wishlist" && <WishlistTab wishlist={wishlist} />}
    </div>
  );
}

function OrdersTab({ orders }: { orders: CustomerDetail["orders"] }) {
  if (orders.length === 0) return <Empty message="This customer has no orders yet." />;
  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="rounded-2xl border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-black">{order.orderNumber}</span>
              <StatusBadge value={order.status} />
              <StatusBadge value={order.paymentStatus} />
              <span className="text-sm font-medium text-slate-500">{formatDate(order.placedAt)}</span>
            </div>
            <span className="text-lg font-black">{formatMoney(order.total)}</span>
          </div>
          <div className="divide-y divide-slate-50">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-6 py-3">
                <ProductThumb src={resolveProductImage(item.product.media)} alt={item.product.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-slate-800">{item.product.name}</p>
                  <p className="text-xs font-medium text-slate-500">
                    {item.quantity} × {formatMoney(item.unitPrice)}
                  </p>
                </div>
                <span className="font-black">{formatMoney(item.totalPrice)}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function CartTab({
  cart,
  customerId,
  customerName,
  customerEmail,
}: {
  cart: CustomerDetail["abandonedCart"];
  customerId: string;
  customerName: string;
  customerEmail: string;
}) {
  const [composeOpen, setComposeOpen] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  if (cart.items.length === 0) return <Empty message="No abandoned cart items — this customer's cart is empty." />;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
        <div>
          <p className="text-sm font-black text-slate-500">{cart.items.length} item(s) left in cart</p>
          <p className="font-black">Cart value: {formatMoney(cart.total)}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={() => {
              setResult(null);
              setComposeOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-black text-white hover:bg-blue-700"
            title={`Email ${customerEmail}`}
          >
            <AdminIcon name="reviews" className="h-4 w-4" />
            Compose reminder email
          </button>
          {result && (
            <p
              className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                result.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
              }`}
            >
              {result.text}
            </p>
          )}
        </div>
      </div>

      {composeOpen && (
        <ComposeEmailModal
          cart={cart}
          customerId={customerId}
          customerName={customerName}
          customerEmail={customerEmail}
          onClose={() => setComposeOpen(false)}
          onSent={(msg) => {
            setResult({ ok: true, text: msg });
            setComposeOpen(false);
          }}
        />
      )}
      <div className="divide-y divide-slate-50">
        {cart.items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 px-6 py-4">
            <ProductThumb src={resolveProductImage(item.product.media)} alt={item.product.name} />
            <div className="min-w-0 flex-1">
              <Link
                href={`/shop/${item.product.slug}`}
                target="_blank"
                className="truncate font-bold text-slate-800 hover:underline"
              >
                {item.product.name}
              </Link>
              <p className="text-xs font-medium text-slate-500">
                SKU {item.sku} · Added {formatDate(item.addedAt)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-slate-500">
                {item.quantity} × {formatMoney(item.price)}
              </p>
              <p className="font-black">{formatMoney(item.lineTotal)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WishlistTab({ wishlist }: { wishlist: CustomerDetail["wishlist"] }) {
  if (wishlist.length === 0) return <Empty message="This customer has not wishlisted any products." />;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {wishlist.map((item) => (
        <div key={item.id} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4">
          <ProductThumb src={resolveProductImage(item.product.media)} alt={item.product.name} large />
          <div className="min-w-0 flex-1">
            <Link
              href={`/shop/${item.product.slug}`}
              target="_blank"
              className="line-clamp-2 font-bold text-slate-800 hover:underline"
            >
              {item.product.name}
            </Link>
            {item.product.price != null && (
              <p className="mt-1 font-black">{formatMoney(item.product.price)}</p>
            )}
            <p className="mt-1 text-xs font-medium text-slate-500">Added {formatDate(item.createdAt)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ComposeEmailModal({
  cart,
  customerId,
  customerName,
  customerEmail,
  onClose,
  onSent,
}: {
  cart: CustomerDetail["abandonedCart"];
  customerId: string;
  customerName: string;
  customerEmail: string;
  onClose: () => void;
  onSent: (message: string) => void;
}) {
  const [subject, setSubject] = useState(DEFAULT_CART_EMAIL_SUBJECT);
  const [message, setMessage] = useState(DEFAULT_CART_EMAIL_MESSAGE);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const previewHtml = useMemo(() => {
    const cartUrl = (typeof window !== "undefined" ? window.location.origin : "") + "/cart";
    return buildAbandonedCartEmail({
      customerName,
      message,
      total: cart.total,
      cartUrl,
      items: cart.items.map((it) => ({
        name: it.product.name,
        quantity: it.quantity,
        price: it.price,
        lineTotal: it.lineTotal,
        imageUrl: resolveProductImage(it.product.media),
      })),
    });
  }, [message, customerName, cart]);

  async function handleSend() {
    setSending(true);
    setError("");
    try {
      const res = await sendAbandonedCartReminder(customerId, { subject, message });
      onSent(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-xl font-black">Abandoned cart reminder</h2>
            <p className="text-sm font-medium text-slate-500">
              To: <span className="font-black text-slate-700">{customerName}</span> ({customerEmail})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-slate-400 hover:text-slate-700"
          >
            <AdminIcon name="x" className="h-5 w-5" />
          </button>
        </div>

        <div className="grid flex-1 gap-0 overflow-hidden lg:grid-cols-2">
          {/* Editor */}
          <div className="space-y-4 overflow-y-auto border-b border-slate-100 p-6 lg:border-b-0 lg:border-r">
            <label className="block">
              <span className="mb-1.5 block text-sm font-black text-slate-700">Subject</span>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="h-11 w-full rounded-lg border border-slate-300 px-3 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-black text-slate-700">Message</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                placeholder="Write the message your customer will see..."
              />
              <span className="mt-1 block text-xs font-medium text-slate-400">
                The greeting, cart items, total and “Complete your purchase” button are added automatically.
              </span>
            </label>
            <button
              type="button"
              onClick={() => {
                setSubject(DEFAULT_CART_EMAIL_SUBJECT);
                setMessage(DEFAULT_CART_EMAIL_MESSAGE);
              }}
              className="text-xs font-black text-slate-500 underline hover:text-slate-800"
            >
              Reset to default
            </button>
            {error && (
              <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700">{error}</p>
            )}
          </div>

          {/* Live preview */}
          <div className="flex flex-col overflow-hidden bg-slate-50">
            <div className="border-b border-slate-200 bg-white px-6 py-2.5 text-xs font-black uppercase tracking-wide text-slate-400">
              Preview
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div
                  className="text-sm"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-black text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={sending}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <AdminIcon name="reviews" className="h-4 w-4" />
            {sending ? "Sending..." : "Send email"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductThumb({ src, alt, large }: { src: string; alt: string; large?: boolean }) {
  const size = large ? "h-20 w-20" : "h-12 w-12";
  return (
    <div className={`${size} shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "amber" | "rose" }) {
  const accent =
    tone === "amber" ? "text-amber-600" : tone === "rose" ? "text-rose-600" : "text-slate-900";
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-black ${accent}`}>{value}</p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-5 py-2 text-sm font-black transition ${
        active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

function Empty({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center font-bold text-slate-400">
      {message}
    </div>
  );
}
