// Shared abandoned-cart email template. Used by BOTH the admin preview modal and
// the Resend API route so the preview matches the email that actually gets sent.

export const DEFAULT_CART_EMAIL_SUBJECT =
  "You still have items in your cart — complete your order";

export const DEFAULT_CART_EMAIL_MESSAGE =
  "We noticed you still have items waiting in your cart. Complete your purchase before they're gone!";

export type CartEmailItem = {
  name: string;
  quantity: number;
  price: number;
  lineTotal: number;
  imageUrl?: string | null;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function money(value: number) {
  return `€${Number(value || 0).toLocaleString("en", { maximumFractionDigits: 2 })}`;
}

export function buildAbandonedCartEmail(params: {
  customerName: string;
  message: string;
  items: CartEmailItem[];
  total: number;
  cartUrl: string;
}): string {
  const { customerName, message, items, total, cartUrl } = params;

  const intro = escapeHtml(message || DEFAULT_CART_EMAIL_MESSAGE).replace(/\n/g, "<br/>");

  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #eee;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              ${
                item.imageUrl
                  ? `<td width="64" style="padding-right:12px;"><img src="${item.imageUrl}" width="64" height="64" style="border-radius:8px;object-fit:cover;display:block;" alt="" /></td>`
                  : ""
              }
              <td style="font-family:sans-serif;color:#333;">
                <div style="font-weight:700;">${escapeHtml(item.name)}</div>
                <div style="font-size:13px;color:#777;">Qty ${item.quantity} × ${money(item.price)}</div>
              </td>
              <td align="right" style="font-family:sans-serif;font-weight:700;color:#111;white-space:nowrap;">
                ${money(item.lineTotal)}
              </td>
            </tr>
          </table>
        </td>
      </tr>`,
    )
    .join("");

  return `
    <div style="max-width:560px;margin:0 auto;font-family:sans-serif;line-height:1.6;color:#333;">
      <h1 style="color:#000;font-size:24px;margin-bottom:4px;">You left something behind 🛒</h1>
      <p style="font-size:16px;">Dear ${escapeHtml(customerName || "Customer")},</p>
      <p style="font-size:16px;">${intro}</p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
        ${rows}
        <tr>
          <td style="padding:14px 0;font-family:sans-serif;">
            <table role="presentation" width="100%">
              <tr>
                <td style="font-weight:800;font-size:16px;">Total</td>
                <td align="right" style="font-weight:800;font-size:16px;">${money(total)}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <a href="${cartUrl}"
         style="display:inline-block;background:#111;color:#fff;text-decoration:none;font-weight:700;padding:14px 28px;border-radius:8px;">
        Complete your purchase
      </a>

      <p style="font-size:13px;color:#999;margin-top:28px;">
        If you've already checked out, you can ignore this email.
      </p>
    </div>`;
}
