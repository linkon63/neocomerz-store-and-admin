import { NextResponse } from "next/server";
import { Resend } from "resend";
import "dotenv/config";
import {
  DEFAULT_CART_EMAIL_MESSAGE,
  DEFAULT_CART_EMAIL_SUBJECT,
  buildAbandonedCartEmail,
} from "../../../../lib/email-templates";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key");
const fromEmail = process.env.RESEND_FROM_EMAIL;

// Server-side base URL for talking to the NestJS API.
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.API_BASE_URL ??
  "http://localhost:5010/api/v1";

type CartItem = {
  id: string;
  quantity: number;
  price: number;
  lineTotal: number;
  product: { name: string; slug: string; media?: { media?: { url: string } | null }[] };
};

type CustomerDetail = {
  customer: { id: string; name: string; email: string };
  abandonedCart: { items: CartItem[]; total: number };
};

function itemImage(item: CartItem): string | null {
  return item.product.media?.[0]?.media?.url ?? null;
}

export async function POST(request: Request) {
  try {
    if (!fromEmail || !process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { success: false, message: "Email is not configured (RESEND_FROM_EMAIL / RESEND_API_KEY)" },
        { status: 500 },
      );
    }

    // Require the caller's admin bearer token — we forward it to the API so the
    // backend's section guard decides whether this staff member may view (and
    // therefore email) this customer.
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ success: false, message: "Not authorized" }, { status: 401 });
    }

    const { customerId, subject, message } = await request.json();
    if (!customerId) {
      return NextResponse.json({ success: false, message: "customerId is required" }, { status: 400 });
    }

    // Pull the authoritative customer + cart from the API using the admin's token.
    const apiRes = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
      headers: { Authorization: authHeader },
      cache: "no-store",
    });

    if (apiRes.status === 401 || apiRes.status === 403) {
      return NextResponse.json(
        { success: false, message: "You are not allowed to email this customer" },
        { status: apiRes.status },
      );
    }
    if (!apiRes.ok) {
      return NextResponse.json({ success: false, message: "Customer not found" }, { status: 404 });
    }

    const detail = (await apiRes.json()) as CustomerDetail;
    const { customer, abandonedCart } = detail;

    if (!abandonedCart.items.length) {
      return NextResponse.json(
        { success: false, message: "This customer has no items in their cart." },
        { status: 400 },
      );
    }

    const origin = new URL(request.url).origin;
    const shopUrl = process.env.NEXT_PUBLIC_SITE_URL || origin;
    const cartUrl = `${shopUrl}/cart`;

    const html = buildAbandonedCartEmail({
      customerName: customer.name,
      message: typeof message === "string" && message.trim() ? message : DEFAULT_CART_EMAIL_MESSAGE,
      total: abandonedCart.total,
      cartUrl,
      items: abandonedCart.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        lineTotal: item.lineTotal,
        imageUrl: itemImage(item),
      })),
    });

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [customer.email],
      subject:
        typeof subject === "string" && subject.trim() ? subject : DEFAULT_CART_EMAIL_SUBJECT,
      html,
    });

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { success: true, message: `Reminder sent to ${customer.email}` },
      { status: 200 },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to send reminder";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
