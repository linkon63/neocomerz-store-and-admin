"use client";

import {
  FiGrid,
  FiBox,
  FiGift,
  FiDownload,
  FiMapPin,
  FiCreditCard,
  FiUser,
  FiLogOut,
} from "react-icons/fi";

export type ProfileTab =
  | "dashboard"
  | "orders"
  | "vouchers"
  | "downloads"
  | "addresses"
  | "payment-methods"
  | "details";

const tabs: { key: ProfileTab; label: string; icon: React.ReactNode }[] = [
  { key: "dashboard", label: "Dashboard", icon: <FiGrid /> },
  { key: "orders", label: "Orders", icon: <FiBox /> },
  { key: "vouchers", label: "Gift Voucher", icon: <FiGift /> },
  { key: "downloads", label: "Downloads", icon: <FiDownload /> },
  { key: "addresses", label: "Addresses", icon: <FiMapPin /> },
  { key: "payment-methods", label: "Payment Method", icon: <FiCreditCard /> },
  { key: "details", label: "Account Details", icon: <FiUser /> },
];

type Props = {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  userName: string;
  userEmail: string;
  onLogout: () => void;
};

export default function ProfileSidebar({
  activeTab,
  onTabChange,
  userName,
  userEmail,
  onLogout,
}: Props) {
  return (
    <aside className="w-full shrink-0 lg:w-64 lg:pr-10 border-r border-neutral-200">
      {/* <div className="mb-8 pb-6 border-b border-neutral-200">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-sm font-bold">
          {userName?.charAt(0)?.toUpperCase() ?? "C"}
        </div>
        <h2 className="mt-3 text-sm font-bold">{userName ?? "Customer"}</h2>
        <p className="mt-0.5 text-xs text-neutral-500">{userEmail}</p>
      </div> */}

      <nav className="flex flex-col gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition
              ${
                activeTab === tab.key
                  ? "bg-neutral-100 font-semibold text-black"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-black"
              }`}
          >
            <span className="text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
        <button
          type="button"
          onClick={onLogout}
          className="mt-4 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-neutral-600 transition hover:bg-red-50 hover:text-red-600"
        >
          <FiLogOut className="text-base" />
          Log Out
        </button>
      </nav>
    </aside>
  );
}
