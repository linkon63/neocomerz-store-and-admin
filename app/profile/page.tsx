"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../_components/auth-context";
import ProfileSidebar, { type ProfileTab } from "./_components/profile-sidebar";
import ProfileDashboard from "./_components/profile-dashboard";
import ProfileOrders from "./_components/profile-orders";
import ProfileVouchers from "./_components/profile-vouchers";
import ProfileDownloads from "./_components/profile-downloads";
import ProfileAddresses from "./_components/profile-addresses";
import ProfilePaymentMethods from "./_components/profile-payment-methods";
import ProfileDetails from "./_components/profile-details";

export default function ProfilePage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProfileTab>("dashboard");

  const handleLogout = useCallback(async () => {
    await logout();
    router.push("/");
  }, [logout, router]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-neutral-400">
          Loading&hellip;
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-4">
        <h1 className="text-xl font-bold">Sign in to your account</h1>
        <p className="text-sm text-neutral-500">
          You need to be logged in to view this page.
        </p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mt-2 bg-black px-6 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white"
        >
          Go home
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-10 text-[#151515] sm:px-8 lg:py-14">
      <div className="mx-auto max-w-[1200px]">
        <p className="text-[16px] font-bold uppercase tracking-[0.14em] text-neutral-500">
          My Account
        </p>

        <div className="mt-8 flex flex-col gap-10 lg:flex-row">
          <ProfileSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            userName={user.name}
            userEmail={user.email}
            onLogout={handleLogout}
          />

          <div className="min-w-0 flex-1">
            {activeTab === "dashboard" && <ProfileDashboard onTabChange={setActiveTab} />}
            {activeTab === "orders" && <ProfileOrders />}
            {activeTab === "vouchers" && <ProfileVouchers />}
            {activeTab === "downloads" && <ProfileDownloads />}
            {activeTab === "addresses" && <ProfileAddresses />}
            {activeTab === "payment-methods" && <ProfilePaymentMethods />}
            {activeTab === "details" && <ProfileDetails />}
          </div>
        </div>
      </div>
    </main>
  );
}
