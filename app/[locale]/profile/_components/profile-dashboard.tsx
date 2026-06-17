"use client";

import { FiBox, FiMapPin, FiHeart, FiShoppingBag } from "react-icons/fi";
import Link from "@/components/LocaleLink";
import type { ProfileTab } from "./profile-sidebar";

const stats = [
  { label: "Orders", value: "3", icon: FiBox, tab: "orders" as ProfileTab },
  { label: "Wishlist", value: "12", icon: FiHeart, href: "/wishlist" },
  { label: "Addresses", value: "1", icon: FiMapPin, tab: "addresses" as ProfileTab },
];

const recentOrders = [
  { id: "#HV-2024-003", date: "10 Jan 2024", status: "Processing", total: "€52.00" },
  { id: "#HV-2024-002", date: "22 Feb 2024", status: "Shipped", total: "€145.00" },
];

type Props = {
  onTabChange: (tab: ProfileTab) => void;
};

export default function ProfileDashboard({ onTabChange }: Props) {
  return (
    <div>
      <h2 className="text-lg font-bold">Dashboard</h2>
      <p className="mt-1 text-sm text-neutral-500">
        Welcome back! Here&apos;s an overview of your account.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) =>
          stat.href ? (
            <Link
              key={stat.label}
              href={stat.href}
              className="flex items-center gap-4 rounded-lg border border-neutral-200 px-5 py-5 transition hover:border-neutral-400"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-black">
                <stat.icon className="text-lg" />
              </div>
              <div>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-neutral-500">{stat.label}</p>
              </div>
            </Link>
          ) : (
            <button
              key={stat.label}
              type="button"
              onClick={() => onTabChange(stat.tab!)}
              className="flex items-center gap-4 rounded-lg border border-neutral-200 px-5 py-5 text-left transition hover:border-neutral-400"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-black">
                <stat.icon className="text-lg" />
              </div>
              <div>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-neutral-500">{stat.label}</p>
              </div>
            </button>
          ),
        )}
      </div>

      <div className="mt-10">
        <h3 className="text-sm font-bold uppercase tracking-[0.08em]">Recent Orders</h3>
        <div className="mt-4 space-y-3">
          {recentOrders.map((order) => (
            <button
              key={order.id}
              type="button"
              onClick={() => onTabChange("orders")}
              className="flex w-full items-center justify-between rounded-lg border border-neutral-200 px-5 py-4 text-left transition hover:border-neutral-400"
            >
              <div>
                <p className="text-sm font-semibold">{order.id}</p>
                <p className="text-xs text-neutral-500">{order.date}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="rounded bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-amber-800">
                  {order.status}
                </span>
                <span className="text-sm font-bold">{order.total}</span>
              </div>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onTabChange("orders")}
          className="mt-4 inline-block text-xs font-bold uppercase tracking-[0.08em] underline underline-offset-2 transition hover:text-neutral-500"
        >
          View all orders
        </button>
      </div>

      <div className="mt-10 rounded-lg border border-neutral-200 px-5 py-6">
        <div className="flex items-center gap-4">
          <FiShoppingBag className="text-2xl text-neutral-400" />
          <div>
            <p className="font-bold">Account Details</p>
            <p className="mt-0.5 text-sm text-neutral-500">
              Update your name, email, and password
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onTabChange("details")}
          className="mt-4 inline-block text-xs font-bold uppercase tracking-[0.08em] underline underline-offset-2 transition hover:text-neutral-500"
        >
          Edit details
        </button>
      </div>
    </div>
  );
}
