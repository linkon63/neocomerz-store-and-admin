"use client";

import { AdminIcon, StatusToggle } from "../../_components/admin-shell";
import {
  formatDate,
  formatMoney,
} from "../../../../lib/admin-api";

import { ProductDiscount } from "@/lib/type";

interface DiscountRowProps {
  discount: ProductDiscount;
  onToggleStatus: (discount: ProductDiscount) => void;
  onEdit: (discount: ProductDiscount) => void;
  onDelete: (discount: ProductDiscount) => void;
}

export function DiscountRow({ discount, onToggleStatus, onEdit, onDelete }: DiscountRowProps) {
  return (
    <tr className="odd:bg-white even:bg-slate-50/70">
      <td className="px-5 py-4 font-bold text-slate-800">{discount.name}</td>
      <td className="px-5 py-4 font-medium text-slate-700">
        <span
          className={`rounded-full px-3 py-1 text-sm font-semibold ${
            discount.type === "percentage"
              ? "bg-blue-50 text-blue-700"
              : "bg-purple-50 text-purple-700"
          }`}
        >
          {discount.type === "percentage" ? "Percentage" : "Fixed"}
        </span>
      </td>
      <td className="px-5 py-4 font-bold text-slate-800">
        {discount.type === "percentage"
          ? `${Number(discount.value)}%`
          : formatMoney(discount.value)}
      </td>
      <td className="px-5 py-4 font-medium text-slate-700">
        {discount._count?.products ?? 0} products
      </td>
      <td className="px-5 py-4 font-medium text-slate-700">
        {discount.startDate || discount.endDate
          ? `${discount.startDate ? formatDate(discount.startDate) : "—"} → ${discount.endDate ? formatDate(discount.endDate) : "—"}`
          : "No date limit"}
      </td>
      <td className="px-5 py-4">
        <StatusToggle
          checked={discount.status === "active"}
          onChange={() => onToggleStatus(discount)}
        />
      </td>
      <td className="px-5 py-4">
        <div className="flex gap-2">
          <button
            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            onClick={() => onEdit(discount)}
            type="button"
            title="Edit discount"
          >
            <AdminIcon className="h-4 w-4" name="edit" />
          </button>
          <button
            className="grid h-8 w-8 place-items-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            onClick={() => onDelete(discount)}
            type="button"
            title="Delete discount"
          >
            <AdminIcon className="h-4 w-4" name="trash" />
          </button>
        </div>
      </td>
    </tr>
  );
}
