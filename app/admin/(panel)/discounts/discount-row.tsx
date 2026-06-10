"use client";

import { AdminIcon } from "../../_components/admin-shell";
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
          className={`rounded-full px-3 py-1 text-sm font-black ${
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
        <button className="cursor-pointer" onClick={() => onToggleStatus(discount)} type="button">
          {discount.status === "active" ? (
            <span className="inline-flex h-8 w-14 items-center rounded-full bg-blue-600 p-1 shadow-sm">
              <span className="ml-auto h-6 w-6 rounded-full bg-white" />
            </span>
          ) : (
            <span className="inline-flex h-8 w-14 items-center rounded-full bg-slate-300 p-1 shadow-sm">
              <span className="h-6 w-6 rounded-full bg-white" />
            </span>
          )}
        </button>
      </td>
      <td className="px-5 py-4">
        <div className="flex gap-2">
          <button
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-black"
            onClick={() => onEdit(discount)}
            type="button"
          >
            <AdminIcon className="h-4 w-4" name="edit" />
            Edit
          </button>
          <button
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-black text-red-700"
            onClick={() => onDelete(discount)}
            type="button"
          >
            <AdminIcon className="h-4 w-4" name="x" />
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
