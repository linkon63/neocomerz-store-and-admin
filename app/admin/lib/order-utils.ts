import { OrderStatus, PaymentStatus } from "../../../lib/admin-api";

export function getStatusColor(status: OrderStatus | string) {
  switch (status) {
    case "pending":
      return "border-amber-300 bg-amber-50 text-amber-700";
    case "processing":
      return "border-blue-300 bg-blue-50 text-blue-700";
    case "shipped":
      return "border-violet-300 bg-violet-50 text-violet-700";
    case "delivered":
      return "border-emerald-300 bg-emerald-50 text-emerald-700";
    case "cancelled":
      return "border-rose-300 bg-rose-50 text-rose-700";
    case "returned":
      return "border-slate-300 bg-slate-50 text-slate-600";
    default:
      return "border-slate-300 bg-slate-50 text-slate-600";
  }
}

export function getPaymentStatusColor(status: PaymentStatus | string) {
  switch (status) {
    case "paid":
      return "border-emerald-300 bg-emerald-50 text-emerald-700";
    case "refunded":
      return "border-violet-300 bg-violet-50 text-violet-700";
    case "unpaid":
      return "border-amber-300 bg-amber-50 text-amber-700";
    default:
      return "border-slate-300 bg-slate-50 text-slate-600";
  }
}

export function calculatePaidAmount(payments: { amount: string | number; status: string }[] = []) {
  return payments
    .filter((p) => p.status === "success" || p.status === "paid")
    .reduce((sum, p) => sum + Number(p.amount), 0);
}

export function calculateDueAmount(total: string | number, paidAmount: number) {
  return Math.max(0, Number(total) - paidAmount);
}
